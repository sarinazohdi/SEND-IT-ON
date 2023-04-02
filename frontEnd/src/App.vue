<template>
  <v-app>
  <div id="app">
    <router-view></router-view>
  </div>
  </v-app>
</template>

<script>

export default {
  name: 'Application',
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

