/* eslint no-new: 0 */
const Vue = require('vue')
const axios = require('axios')

Vue.prototype.$http = axios

const CheckboxTypeahead = require('./modules/checkbox-typeahead.vue').default

const vueWrappers = Array.from(document.querySelectorAll('.js-vue-wrapper'))

vueWrappers.forEach((wrapper) => {
  new Vue({
    el: wrapper,
    components: {
      'checkbox-typeahead': CheckboxTypeahead,
    },
  })
})
