<template>
  <v-card>
    <Header></Header>
    <!-- Admins -->
    <v-card-title class="first">
      Admins
      <v-spacer></v-spacer>
      <!-- TODO: fix search -->
      <!-- <v-text-field
        v-model="adminSearch"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field> -->
    </v-card-title>
    <v-data-table
      :headers="adminHeaders"
      :items="admins"
      :search="adminSearch"
      item-key="id"
    >
      <template v-slot:[`item.name`]="{item}">
        <td>{{item.firstname}} {{item.lastname}}</td>
      </template>
      <template v-slot:[`item.email`]="{item}">
        <td>{{item.email}}</td>
      </template>
      <template v-slot:[`item.signupDate`]="{item}">
        <td>{{toDate(item.signupDate)}}</td>
      </template>
      <template v-slot:no-data>
      <v-alert :value="admins.length === 0" color="error">
        Sorry, nothing to display here :(
      </v-alert>
    </template>
    </v-data-table>

    <!--  Non Admins -->
    <v-card-title>
      Regular Members
      <v-spacer></v-spacer>
      <!-- TODO: fix search -->
      <!-- <v-text-field
        v-model="nonAdminSearch"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field> -->
    </v-card-title>
    <v-data-table
      :headers="nonAdminHeaders"
      :items="nonAdmins"
      :search="nonAdminSearch"
      item-key="id"
    >
      <template v-slot:[`item.name`]="{item}">
        <td>{{item.firstname}} {{item.lastname}}</td>
      </template>
      <template v-slot:[`item.email`]="{item}">
        <td>{{item.email}}</td>
      </template>
      <template v-slot:[`item.hours`]="{item}">
        <td>{{item.hours}}</td>
      </template>
      <template v-slot:[`item.signupDate`]="{item}">
        <td>{{toDate(item.signupDate)}}</td>
      </template>
      <template v-slot:no-data>
      <v-alert :value="nonAdmins.length === 0" color="error">
        Sorry, nothing to display here :(
      </v-alert>
    </template>
    </v-data-table>
    <Footer></Footer>
  </v-card>
</template>

<script>
  import { getAllAdmins, getAllNonAdmins} from "../services/apiServices";
  import * as dayjs from 'dayjs';
  import Header from "../components/Header.vue";
  import Footer from "../components/Footer.vue";

  export default {
    name: 'Administrator',
    components: {
      'Header' : Header,
      'Footer' : Footer
    },
    props: {
    },
    data () {
      return {
        adminHeaders: [
          {
            text: 'Name',
            align: 'start',
            selectable: false,
            sortable: true,
            value: 'name',
          },
          {
            text: 'Email',
            sortable: true,
            value: 'email',
          },
          {
            text: 'Signup Date',
            sortable: true,
            value: 'signupDate',
          },
        ],
        nonAdminHeaders: [
          {
            text: 'Name',
            align: 'start',
            selectable: false,
            sortable: true,
            value: 'name',
          },
          {
            text: 'Email',
            sortable: true,
            value: 'email',
          },
          {
            text: 'Hours',
            selectable: true,
            value: 'hours'
          },
          {
            text: 'Signup Date',
            sortable: true,
            value: 'signupDate',
          },
        ],
        adminSearch: '',
        nonAdminSearch: '',
        admins: [],
        nonAdmins: []
      }
    },
    mounted() {
      this.getAllUsers();
    },
    methods: {
      async getAllUsers() {
        this.admins = await getAllAdmins();
        this.nonAdmins = await getAllNonAdmins();
      },
      toDate(timestamp) {
        return dayjs.unix(timestamp.seconds).format('YYYY-MM-DD')
      }
    },

  }
</script>
<style scoped>
  ::v-deep tbody tr {
    cursor: pointer;
  }

  .first {
    padding-top: 100px;
  }
</style>