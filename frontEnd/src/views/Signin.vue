<template>
  
  <v-form>
    <v-container>
      <h1>Sign In</h1>
      <v-row
        justify="center">
        <v-col
          cols="12"
          sm="10"
        >
          <v-text-field
            v-model="email"
            placeholder="first.last@email.com"
            label="Email"
            outlined
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            placeholder="******"
            label="Password"
            outlined
            required
            :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
            :type="passwordVisible ? 'text' : 'password'"
            name="input-10-2"
            hint="At least 8 characters"
            @click:append="passwordVisible = !passwordVisible"
          ></v-text-field>
          <v-col>
            <v-btn
              color="accent"
              @click="signin"
            > Sign in
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="accent"
              margin-bottom="1em"
              @click="$router.push('/signup')"
            >
              Dont have an account? Sign Up
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="accent"
              margin-bottom="1em"
              @click="$router.push('/forgot')"
            >
              Forgot Password
            </v-btn>
          </v-col>
        </v-col>
      </v-row>
    </v-container>
    <v-alert
      v-model="signinFailureAlert"
      dismissible
      type="error"
    >
      {{signInErrorMessage}}
    </v-alert>
  </v-form>
</template>

<script>
import { signin } from '@/services/apiServices';

export default {
  name: 'Signin',
  data () {
    return {
      id: '',
      email: '',
      password: '',
      passwordVisible: false,
      signinFailureAlert: false,
      signInErrorMessage: '',
    }
  },
  methods: {
      async signin() {
        try {
          const user = await signin(this.email, this.password);
          if (user.isAdmin) {
            this.$router.push('/admin/home');
          } else {
            this.$router.push('/');
          }
        } catch(error) {          
          this.signinFailureAlert = true;
          this.signInErrorMessage = error.message;
        }
      }
  }
}
</script>