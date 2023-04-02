<template>
  <v-container fluid style="margin: 0 auto 0 auto; padding: 0px; width: 90%">
    <send-header
      fluid
      style="margin: 0 auto 0 auto; padding: 0px; width: 90%"
    ></send-header>
    <v-card class="mx-auto">
      <v-data-table
        :headers="headers"
        :items="eventList"
        :expanded.sync="expanded"
        item-key="timeStamp"
        show-expand
        class="elevation-1"
      >
        <v-divider></v-divider>
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title> Hour Tracking </v-toolbar-title>
            
            <v-spacer></v-spacer>
            <v-dialog v-model="dialogAddVolunteering" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="accent"
                  class="ml-2 mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  Add hours
                </v-btn>
              </template>
              <v-card>
                <v-card-text>
                  <v-container>
                    <v-text-field
                      required
                      color="accent"
                      v-model="event"
                      label="Event Type (Ex. Mentoring)"
                      prepend-icon="mdi-information"
                      autocomplete="off"
                    ></v-text-field>
                    <v-text-field
                      required
                      color="accent"
                      v-model="timeVolunteered"
                      label="Time volunteered"
                      persistent-hint
                      prepend-icon="mdi-timer"
                      autocomplete="off"
                      suffix="hours"
                    ></v-text-field>
                    <v-textarea
                      color="accent"
                      v-model="description"
                      label="Short Description"
                      prepend-icon="mdi-text-box"
                      autocomplete="off"
                    ></v-textarea>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="closeAddVolunteering"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="saveAddVolunteering"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
              <v-snackbar color="red" v-model="snackbar" :timeout="3000">
                {{ saveError }}
                <template v-slot:action="{ attrs }">
                  <v-btn
                    color="white"
                    text
                    v-bind="attrs"
                    @click="snackbar = false"
                  >
                    Close
                  </v-btn>
                </template>
              </v-snackbar>
            </v-dialog>
            <v-card-title class="float-left"
            > Total Hours: {{ calcTotalTime() }} 
            </v-card-title>
          </v-toolbar>
        </template>
        <template v-slot:item.event="{ item }">
          {{ item.event }}
        </template>
        <template v-slot:item.timeVolunteered="{ item }">
          {{ item.timeVolunteered }}
        </template>
        <template v-slot:item.timeStamp="{ item }">
          {{ displayDate(item.timeStamp) }}
        </template>
        <template v-slot:expanded-item="{ item }">
          <td :colspan="1">{{ item.description }}</td>
        </template>
        <template v-slot:item.delete="{ item }">
          <v-dialog v-model="dialogDelete" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon large color="accent" v-bind="attrs" v-on="on">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="headline"
                >Are you sure you want to delete this item?</v-card-title
              >
              <v-card-actions>
                <v-btn color="blue darken-1" text @click="closeDelete">
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="deleteItemConfirm(item.timeStamp)"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
      </v-data-table>
      <send-footer></send-footer>
    </v-card>
  </v-container>
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import {
  deleteVolunteering,
  updateVolunteering,
  getVolunteering,
  getSignedInUserObj,
} from "../services/apiServices";
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
dayjs.extend(utcPlugin);

export default {
  data() {
    return {
      dialogDelete: false,
      dialogAddVolunteering: false,

      event: "",
      timeVolunteered: "",
      description: "",
      timeStamp: "",
      expanded: [],

      eventList: [],

      snackbar: false,
      saveError: "",

      id: null,

      headers: [
        {
          text: "Event",
          align: "start",
          sortable: false,
          value: "event",
        },
        {
          text: "Time Volunteered",
          align: "start",
          sortable: false,
          value: "timeVolunteered",
        },
        {
          text: "Date",
          align: "start",
          sortable: false,
          value: "timeStamp",
        },
        {
          text: "Delete",
          sortable: false,
          value: "delete",
          align: "center"
        },
        {
          text: "Description",
          value: "data-table-expand",
          align: "center"
        },
      ],
    };
  },
  watch: {
    dialogAddVolunteering(val) {
      val || this.closeAddVolunteering();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
  components: {
    "send-header": Header,
    "send-footer": Footer,
  },
  methods: {
    displayDate(timeStamp) {
      return dayjs.utc(timeStamp).format('MM/DD/YYYY')
    },

    closeDelete() {
      this.dialogDelete = false;
    },

    closeAddVolunteering() {
      this.resetVolunteering();
      this.dialogAddVolunteering = false;
    },

    calcTotalTime() {
      if(!this.eventList) { return "0"; }
      let sum = 0;
      this.eventList.forEach((event) => sum += parseInt(event.timeVolunteered));
      return sum;
    },

    async deleteItemConfirm(timeStamp) {
      try {
        await deleteVolunteering(this.id, timeStamp);
        this.render();
      } catch (err) {
        this.showNotification("Could not delete item")
      }

      this.render();
      this.closeDelete();
    },

    showNotification(notification) {
      this.saveError = notification;
      this.snackbar = true;
      setTimeout(() => {
        this.snackbar = false;
      }, 5000);
    },

    async saveAddVolunteering() {
      if (this.event && this.timeVolunteered) {
        if (isNaN(parseInt(this.timeVolunteered))) {
          return this.showNotification("Please enter a whole number for time");
        }
        try {
          this.description = this.description || "N/A";
          let volunteering = {
            event: this.event,
            timeVolunteered: this.timeVolunteered,
            description: this.description,
          };
          this.eventList.push(volunteering);
          await updateVolunteering(
            this.id,
            this.event,
            this.timeVolunteered,
            this.description
          );
          this.dialogAddVolunteering = false;
          this.resetVolunteering();
          this.render();
          return;
        } catch (error) {
          return this.showNotification("Could not save volunteering");
        }
      } else {
        this.showNotification("Please fill event and time fields");
      }
    },
    resetVolunteering() {
      this.event = "";
      this.timeVolunteered = "";
      this.description = "";
    },
    async render() {
      let user = await getSignedInUserObj();
      this.id = user.id;
      this.eventList = await getVolunteering(this.id);
    },
  },
  created() {
    this.render();
  },
};
</script>