<template>
    <v-card>
        <Header></Header>
        <v-card-title class="first">
            Book a Computer
        </v-card-title>
        <v-card-subtitle>
            All times shown in your local time: {{ timezone }}.
        </v-card-subtitle>
        <v-row 
            align-items="flex-start"
            justify="center"
            class="container">
            <v-col cols="4">
                <v-select
                    v-model="selectedComputer"
                    :items="firestoreComputers"
                    item-text="name"
                    item-value="googleCalendarId"
                    item-color="black"
                    :hint="selectedComputer.description"
                    label="Select a computer to view availability for!"
                    return-object
                    single-line
                />
                <v-card v-if="createdEvent">
                    <v-card-title>Your Booking</v-card-title>
                    <v-form>
                        <p>Start: {{ toDateTimeStrWithAmPm(createdEvent.start) }}</p>
                        <p>End: {{ toDateTimeStrWithAmPm(createdEvent.end) }}</p>
                        <v-row>
                            <v-col cols="6">
                                <v-btn v-if="showBookingActions" color="error" class="white--text" @click="cancelBooking">Cancel</v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn v-if="showBookingActions" color="success" class="white--text" @click="submitBooking">Submit</v-btn>
                            </v-col>
                            <v-col cols="12" v-if="!showBookingActions">Please refresh the page before continuing or trying to book another computer.</v-col>
                        </v-row>
                        <v-alert
                            v-model="successfulBookingAlert"
                            dismissible
                            type="success">
                            Success!
                            <br />
                            <br />
                            Note: If you want to ensure your booking went through, check that your Google Calendar event was accepted.
                            If it was declined, that means someone may have already booked during your chosen time slot, while you were trying to book it.
                        </v-alert>
                        <v-alert
                            v-model="conflictingBookingAlert"
                            dismissible
                            type="error">
                            Sorry, someone else has already booked the computer you selected at this time! 
                            Please make sure your booking doesn't conflict with an existing one.
                            If it looks like it doesn't conflict, please refresh the page.
                        </v-alert>
                        <v-alert
                            v-model="errorSendingBookingRequestAlert"
                            dismissible
                            type="error">
                            Sorry, failed to book. Please refresh and try again.
                            {{ errorSendingBookingRequestAlertMessage }}
                        </v-alert>
                    </v-form>
                </v-card>
            </v-col>
            <v-col cols="8">
                <Calendar 
                    :calendarId="selectedComputer.googleCalendarId" 
                    @emitCreatedEvent="updateCreatedEvent" 
                    ref="calendar" 
                    :events="events"
                    :earliestAllowedCalendarDate="earliestAllowedCalendarDate"
                    :latestAllowedCalendarDate="latestAllowedCalendarDate" />
            </v-col>
        </v-row>
    </v-card>
</template>
<script>
import Header from "../components/Header.vue";
import Calendar from '../components/Calendar.vue';
import { getAllComputersFromFirestore, getFreeBusyBetween, bookComputer } from '../services/apiServices';
import { toDateTimeStr, toDateTimeStrWithAmPm } from '../helper';
import Pizzly from 'pizzly-js';
import * as dayjs from 'dayjs';
import timezonePlugin from 'dayjs/plugin/timezone';
dayjs.extend(timezonePlugin);


const googleCalendarApiKey = process.env.VUE_APP_GOOGLE_CALENDAR_API_KEY;

export default {
    components: {
        Header,
        Calendar,
    },
    data() {
        // dates the calendar is allowed to display
        const earliestAllowedCalendarDate = dayjs();
        const latestAllowedCalendarDate = earliestAllowedCalendarDate.add(dayjs.duration(1, 'M'));
        // date to stop querying for events at - it's higher than the latestAllowedCalendarDate to effectively "round up" by a week
        const calendarDateRange = latestAllowedCalendarDate.diff(earliestAllowedCalendarDate);
        const eventEndDate = earliestAllowedCalendarDate.add(calendarDateRange).add(dayjs.duration(1, 'w'));
        return {
            firestoreComputers: [],
            selectedComputer: {
                description: ''
            },
            earliestAllowedCalendarDate,
            latestAllowedCalendarDate,
            eventEndDate,
            events: [],
            createdEvent: null,
            showBookingActions: true,
            successfulBookingAlert: false,
            conflictingBookingAlert: false,
            errorSendingBookingRequestAlert: false,
            errorSendingBookingRequestAlertMessage: '',
            timezone: dayjs.tz.guess(),
            googleCalendarUser: null,
        }
    },
    mounted() {
        this.getAllComputersFromFirestore();
        // restrict requests on heroku side after setting up SEND IT ON's account
        this.$pizzly = new Pizzly({
            host: process.env.VUE_APP_PIZZLY_HOST,
        });
    },
    methods: {
        async getAllComputersFromFirestore() {
            this.firestoreComputers = await getAllComputersFromFirestore();
        },
        updateCreatedEvent(createdEvent) {
            this.createdEvent = createdEvent;
        },
        toDateTimeStrWithAmPm(datetime) {
            return toDateTimeStrWithAmPm(datetime);
        },
        cancelBooking() {
            this.$refs['calendar'].cancelBooking();
        },
        async submitBooking() {
            if (dayjs(this.createdEvent.start).isBefore(this.earliestAllowedCalendarDate)) {
                this.errorSendingBookingRequestAlert = true;
                this.errorSendingBookingRequestAlertMessage = 'Attempted to book in the past!';
                return;
            }
            for (const event of this.events) {
                if (event != this.createdEvent && this.isOverlapping(event, this.createdEvent)) {
                    this.conflictingBookingAlert = true;
                    return;
                }
            }
            if (!this.googleCalendarUser) {
                await this.authGoogleCalendar();
            }
            try {
                const res = await bookComputer(dayjs(this.createdEvent.start), 
                                               dayjs(this.createdEvent.end), 
                                               this.selectedComputer.googleCalendarId, 
                                               this.$pizzly, 
                                               this.googleCalendarUser);
                if (res.error) {
                    throw new Error(res.error.message);
                }
                this.successfulBookingAlert = true;
                this.showBookingActions = false; // prevent them from booking again without refreshing
            } catch(error) {
                this.errorSendingBookingRequestAlert = true;
                this.errorSendingBookingRequestAlertMessage = error.message;
            }
        },
        async authGoogleCalendar() {
            try {
                const data = await this.$pizzly.integration('google-calendar').connect();
                this.googleCalendarUser = data.authId;
            } catch (error) {
                this.errorSendingBookingRequestAlert = true;
                this.errorSendingBookingRequestAlertMessage = error.message;
            }
        },
        // checks if two events overlap. Assumes that for each event, end > start
        isOverlapping(firstEvent, secondEvent) {
            const secondEventStart = dayjs(secondEvent.start);
            if (dayjs(firstEvent.start).isAfter(secondEventStart)) {
                return this.isOverlapping(secondEvent, firstEvent);
            }
            return secondEventStart.isBefore(dayjs(firstEvent.end));
        }
    },
    watch: {
        selectedComputer: {
            handler: async function({ googleCalendarId }) {
                this.cancelBooking();
                const freeBusy = await getFreeBusyBetween(this.earliestAllowedCalendarDate, this.eventEndDate, 'MST', googleCalendarId, googleCalendarApiKey);
                this.events = [];
                this.events = freeBusy.map((busy) => {
                    const startDateObj = dayjs(busy.start);
                    const endDateObj = dayjs(busy.end);
                    
                    const start = toDateTimeStr(startDateObj);
                    const end = toDateTimeStr(endDateObj);
                    return {
                        name: "Booked",
                        start: start,
                        end: end,
                    }
                });
            }
        },
    },
}
</script>
<style scoped>
    .first {
        padding-top: 100px;
    }

    .container {
        padding: 10px;
        max-width: 100%;
    }
</style>