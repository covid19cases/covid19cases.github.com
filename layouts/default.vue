<template lang="pug">
// Simple layout for Vuetify playground
v-app
  v-content
    Nuxt/

  v-footer(color="indigo" app padless)
    v-layout(justify-center row wrap)
      v-flex(py-3 text-center white--text xs12)
        | &copy;{{new Date().getFullYear()}} - <strong><a href="https://leocorn.com">Leocornus LTD.</a></strong>
</template>

<script>
export default {
}
</script>
