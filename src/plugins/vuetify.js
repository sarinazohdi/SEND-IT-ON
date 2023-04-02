import '@mdi/font/css/materialdesignicons.css';
import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#fafafa",           //LIGHT GREY BACKGROUND
        secondary: "#ffffff",         //WHITE
        primarytext: "#000000",       //BLACK (for text in the footer)
        userinfotext: "589DA1",       //dark accent for user info text
        notificationgreen: "00C853",  //GREEN for notification info
        accent: "2DCCD3",             //TURQUIOSE FOR BUTTON
        complete: "2DCCD3",           //turquoise for complete tasks
        inprogress: "FFB81C",         //yellow for inprogress      
        needsattention: "F44336",     //red for needs attention
      }
    }
  }
});
