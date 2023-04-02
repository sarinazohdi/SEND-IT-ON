<template>
    <v-card>
        <v-sheet height="64">
            <v-toolbar flat>
                <v-btn
                    outlined
                    class="mr-4"
                    color="grey darken-2"
                    @click="goToToday">
                    Today
                </v-btn>
                <v-btn
                    fab
                    text
                    small
                    color="grey darken-2"
                    @click="prev">
                    <v-icon small>
                        mdi-chevron-left
                    </v-icon>
                </v-btn>
                <v-btn
                    fab
                    text
                    small
                    color="grey darken-2"
                    @click="next">
                    <v-icon small>
                        mdi-chevron-right
                    </v-icon>
                </v-btn>
                <v-toolbar-title>
                    {{ monthAndYearOfCurrentCalendarDay }} 
                </v-toolbar-title>
                <v-spacer />
                <!-- TODO: add a refresh button that sits on the right -->
                <v-snackbar
                    v-model="invalidCalendarPrevOperationAttempted"
                    :timeout="3000"
                    absolute
                    bottom
                    color="red"
                >
                    You can't make a booking in the past!
                    <template v-slot:action="{ attrs }">
                        <v-btn
                            color="primary"
                            text
                            v-bind="attrs"
                            @click="invalidCalendarPrevOperationAttempted = false">
                            Close
                        </v-btn>
                    </template>
                </v-snackbar>
                <v-snackbar
                    v-model="invalidCalendarNextOperationAttempted"
                    :timeout="3000"
                    absolute
                    bottom
                    color="red"
                >
                    You can only book up to one month in advance!
                    <template v-slot:action="{ attrs }">
                        <v-btn
                            color="primary"
                            text
                            v-bind="attrs"
                            @click="invalidCalendarNextOperationAttempted =false">
                            Close
                        </v-btn>
                    </template>
                </v-snackbar>
            </v-toolbar>
        </v-sheet>
        <v-sheet height="600">
            <v-calendar
                ref="calendar"
                type="week"
                :value="toDateStr(today)"
                :events="events"
                :key="toDateStr(today)"
                :event-color=EVENT_COLOR
                @mousedown:event="startDrag"
                @mousedown:time="startTime"
                @mousemove:time="mouseMove"
                @mouseup:time="endDrag"
                @mouseleave.native="cancelDrag"
                >
            </v-calendar>
        </v-sheet>
    </v-card>
</template>
<script>
import * as dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
dayjs.extend(durationPlugin);
import { toDateStr } from '../helper';

export default {
    props: {
        calendarId: String,
        events: Array,
        earliestAllowedCalendarDate: Object,
        latestAllowedCalendarDate: Object,
    },
    data () {
        return {
            EVENT_NAME: "Booked",
            EVENT_COLOR: "#2196F3",
            today: dayjs(),
            invalidCalendarPrevOperationAttempted: false,
            invalidCalendarNextOperationAttempted: false,
            dragEvent: null, // event being dragged around and moved
            dragTime: null,
            creatingEvent: null, // event being created
            creatingStart: null,
            createdEvent: null, // event that's already been created - the user's booking
        }
    },
    mounted () {
        this.$refs.calendar.scrollToTime('08:00');
    },
    methods: {
        async login() {
            await this.$gapi.getGapiClient();
        },
        goToToday() {
            this.today = dayjs()
        },
        prev() {
            // only allow going back if you're already at least a week after the earliest allowed day
            if (this.today.isAfter(this.earliestAllowedCalendarDate.add(dayjs.duration(1, 'w')))) {
                this.today = this.today.add(dayjs.duration(-1, 'w'));
            } else {
                this.invalidCalendarPrevOperationAttempted = true;
            }
        },
        next() {
            // only allow going forward if you're already at least a week before the last allowed day
            if (this.today.isBefore(this.latestAllowedCalendarDate.add(dayjs.duration(-1, 'w')))) {
                this.today = this.today.add(dayjs.duration(1, 'w'));
            } else {
                this.invalidCalendarNextOperationAttempted = true;
            }
        },
        // series of methods for adding a new event adapted from: https://vuetifyjs.com/en/components/calendars/#drag-and-drop
        startDrag ({ event, timed }) {
            if (this.calendarId && event && timed) {
                this.dragEvent = event;
                this.dragTime = null;
            }
        },
        // handle timestamp at start of calendar drag/drop operation
        startTime (tms) {
            const mouse = this.toTime(tms);

            if (this.dragEvent && this.dragTime === null && this.dragEvent == this.createdEvent) { // can only drag your created event
                const start = this.dragEvent.start;
                this.dragTime = mouse - start;
            } 
            else if (this.calendarId && this.createdEvent == null) { // only create a new event if you haven't already
                this.creatingStart = this.roundTime(mouse);
                this.creatingEvent = {
                    name: "Your Booking",
                    color: this.EVENT_COLOR,
                    start: this.creatingStart,
                    end: this.creatingStart,
                    timed: true,
                };
                this.events.push(this.creatingEvent);
            }
        },
        // adjust time of currently created event
        mouseMove (tms) {
            const mouse = this.toTime(tms)

            if (this.dragEvent && this.dragTime !== null && this.dragEvent == this.createdEvent) { // can only move your booking
                const start = this.dragEvent.start;
                const end = this.dragEvent.end;
                const duration = end - start;
                const newStartTime = mouse - this.dragTime;
                const newStart = this.roundTime(newStartTime);
                const newEnd = newStart + duration;

                this.dragEvent.start = newStart;
                this.dragEvent.end = newEnd;
            } else if (this.creatingEvent && this.creatingStart !== null) {
                const mouseRounded = this.roundTime(mouse, false);
                const min = Math.min(mouseRounded, this.creatingStart);
                const max = Math.max(mouseRounded, this.creatingStart);

                this.creatingEvent.start = min;
                this.creatingEvent.end = max;
            }
        },
        endDrag () {
            if (this.createdEvent == null) {
                this.createdEvent = this.creatingEvent;
            }
            this.creatingEvent = null;
            this.creatingStart = null;
            this.dragTime = null;
            this.dragEvent = null;
            this.emitCreatedEvent();
        },
        cancelBooking() {
            this.createdEvent = null;
            this.emitCreatedEvent();
            this.events.splice(-1, 1); // remove event that was previously added
        },
        cancelDrag () {
            if (this.creatingEvent) {
                const i = this.events.indexOf(this.creatingEvent);
                if (i !== -1) {
                    this.events.splice(i, 1);
                }
            }

            this.creatingEvent = null;
            this.creatingStart = null;
            this.dragTime = null;
            this.dragEvent = null;
        },
        roundTime (time, down = true) {
            const roundTo = 15; // minutes
            const roundDownTime = roundTo * 60 * 1000;

            return down
            ? time - time % roundDownTime
            : time + (roundDownTime - (time % roundDownTime));
        },
        toTime (tms) {
            return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime();
        },
        toDateStr(date) {
            return toDateStr(date);
        },
        emitCreatedEvent() {
            this.$emit('emitCreatedEvent', this.createdEvent);
        }
    },
    computed: {
        monthAndYearOfCurrentCalendarDay() {
            return this.today.format('MMMM YYYY');
        }
    }
}
</script>