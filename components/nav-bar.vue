<template lang="pug">
// using toolbar for navigation
v-toolbar( dense ).mb-2
  v-spacer
  v-btn( icon to="/" nuxt color="primary")
    v-icon mdi-table-large
  v-btn( icon to="/lines" nuxt color="primary")
    v-icon mdi-chart-line
  v-btn( icon to="/mlines" nuxt color="primary")
    v-icon mdi-chart-multiline
  v-spacer
</template>

<script>
export default {

    name: "navbar",
    props: []
}
