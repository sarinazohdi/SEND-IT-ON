<template>
  <v-form>
    <v-container>
      <h1>Sign Up</h1>
      <v-row
        justify="center">
        <v-col
          cols="12"
          sm="10"
        >
          <v-text-field
            v-model="firstName"
            placeholder="First"
            label="First"
            outlined
            required
          ></v-text-field>
          <country-select class="country-select" v-model="country" :country="country" topCountry="US" />
          <v-text-field
            v-model="lastName"
            placeholder="Last"
            label="Last"
            outlined
            required
          ></v-text-field>
          <v-text-field
            v-model="email"
            placeholder="first.last@email.com"
            :rules="emailrules"
            label="Email"
            outlined
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            placeholder="******"
            :rules="passwordrules"
            label="Password"
            outlined
            required
            :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
            :type="passwordVisible ? 'text' : 'password'"
            name="input-10-2"
            hint="At least 8 characters"
            @click:append="passwordVisible = !passwordVisible"
          ></v-text-field>
          <v-text-field
            v-model="checkpassword"
            :rules="matches"
            placeholder="******"
            :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
            :type="passwordVisible ? 'text' : 'password'"
            name="input-10-2"
            label="Confirm"
            outlined
            required
          ></v-text-field>
          <v-col>
            <v-btn
              color="accent"
              margin-bottom="1em"
              :disabled="!isValid"
              @click="signup"
            >
              Sign Up
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="accent"
              @click="$router.push('signin')"
            > Already a member? Sign in
            </v-btn>
          </v-col>
        </v-col>
      </v-row>
    </v-container>
    <v-alert
      v-model="signupSuccessAlert"
      dismissible
      type="success"
    >
      Success! Check your email to verify before signing in.
    </v-alert>
    <v-alert
      v-model="signupFailureAlert"
      dismissible
      type="error"
    >
      {{signupErrorMessage}}
    </v-alert>
  </v-form>
</template>

<script>
import Vue from 'vue'
import vueCountryRegionSelect from 'vue-country-region-select'
Vue.use(vueCountryRegionSelect)
import { signup } from '../services/apiServices';

export default {
  name: 'Signup',
    data () {
      return {
        firstName: '',
        lastName: '',
        country: '',
        email: '',
        password: '',
        checkpassword: '',
        passwordVisible: false,
        isValid: true,
        signupSuccessAlert: false,
        signupFailureAlert: false,
        signupErrorMessage: '',

        emailrules: [ 
        v => 
        !!v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) 
        || 'E-mail must be valid'
        || 'E-mail is required'
        ],
        passwordrules: [
          v => (v && v.length >= 8) || 'Password must have 8+ characters',
          v => /(?=.*[A-Z])/.test(v) || 'Must have one uppercase character', 
          v => /(?=.*\d)/.test(v) || 'Must have one number'
        ],
        matches: [
          v => (this.password === v || 'Passwords must match')
        ]
      }
    },

    methods:{
      async signup(){
        if (! (this.email && this.firstName && this.lastName && this.country)) {
          return;
        }
        try {
          await signup(this.email, this.password, this.firstName, this.lastName, this.country);
          this.signupSuccessAlert = true;
        } catch(error) {
          this.signupFailureAlert = true;
          this.signupErrorMessage = error.message;
        }
      },
    }
}
</script>

<style scoped>
  .v-text-field {
    font-size: 1.2em;
  }
  .country-select {
    width: 800px;
    margin-bottom: 10px;
    box-shadow: 0px 0px 0px 1px rgba(0,0,0,0.3);   
    border-radius: 4px;
    padding: 5px;
    align-items: flex-start;
    display: flex;
    flex: 1 1 auto;
    letter-spacing: normal;
    text-align: left;
    max-width: 100%;
  }
</style>