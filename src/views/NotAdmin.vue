<template>
    <v-card>
        <Header></Header>
        <v-card-title class="first" text-color="black">
            Sorry, you're not an admin!
        </v-card-title>
        <Footer></Footer>
    </v-card>
</template>
<script>
import Header from "../components/Header.vue";
  import Footer from "../components/Footer.vue";

export default {
    name: 'NotAdmin',
    components: {
      'Header' : Header,
      'Footer' : Footer
    },
}
</script>
<style scoped>
.first {
  padding-top: 100px;
}
</style>