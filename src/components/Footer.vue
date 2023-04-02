<template>
  <v-footer
    display="flex"
    color="primary"
    padding-left="1rem"
    padding-right="1rem"
  >
    <v-row
      justify="center"
      no-gutters
    >
    <v-col
      align="left">
      <v-btn
        v-for="(link, index) in links"
        :key=index
        :href="link.href"
        text
        rounded
      >
        {{ link.text }}
      </v-btn>
    </v-col>
    <v-col align="right">
      <v-btn
        text
        disabled
      >
        © 2020 - SEND IT ON
      </v-btn>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
  export default {
    data: () => ({
      links: [
        {
          text: 'Support',
          href: 'https://www.google.com/'
        },
        {
          text: 'Help Center',
          href: 'https://www.google.com/'
        },
        {
          text: 'Privacy',
          href: 'https://www.google.com/'
        },
        {
          text: 'Terms of Service',
          href: 'https://www.google.com/'
        }
      ],
    }),
  }
</script>
