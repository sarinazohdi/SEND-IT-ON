<template>
  <v-app-bar
    data-app
    color="primary"
    padding-left="1rem"
    padding-right="1rem"
    flat
    absolute
  >
    <v-btn 
    class="mr-2"
    href="/" v-if="user && !user.isAdmin">
      Home
    </v-btn>
    <v-btn 
    class="mr-2"
    href="/admin/home" v-if="user && user.isAdmin">
      Home
    </v-btn>
    <v-btn 
    class="mr-2"
    href="/bookcomputers">
      Book Computers
    </v-btn>
    <v-btn 
    class="mr-2"
    href="/resources">
      Resources
    </v-btn>
    <v-spacer></v-spacer>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :close-on-click="true"
      :nudge-width="200"
      offset-y
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" rounded elevation="0">
          {{ user.firstname + " " + user.lastname }}
          <v-icon right>mdi-account</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title align="left"
                >Profile Information</v-list-item-title
              >
            </v-list-item-content>
            <v-list-item-action>
              <v-btn align="right" icon @click="menu = false">
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>

          <v-divider></v-divider>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle align="left">
                Email: {{ user.email }}
              </v-list-item-subtitle>
              <v-list-item-subtitle align="left">
                Country: {{ user.country }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <v-btn text rounded font-family="Roboto, sans-serif" @click="signout">
      Log out
    </v-btn>
  </v-app-bar>
</template>

<script>
import { signout, getSignedInUserObj } from '../services/apiServices';

export default {
  data: () => ({
    menu: false,
    name: "",
    type: "",
    user: {},
    email: "",
  }),
  async mounted() {
    this.user = await getSignedInUserObj();
  },
  methods: {
    async signout() {
      signout();
      this.$router.push('/signin');
    },
    bookComputers() {
      this.$router.push('/bookComputers')
    }
  },
};
</script>
