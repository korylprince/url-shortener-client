import "vue-material/dist/vue-material.css"
import "v-calendar/lib/v-calendar.min.css"
import "./style/theme.scss"
import "./style/app.styl"

import Vue from "vue"
import VueMaterial from "vue-material"
import VeeValidate from "vee-validate"
import VCalendar from "v-calendar"
import VueClipboards from "vue-clipboards"

Vue.use(VueMaterial)
Vue.use(VeeValidate)
Vue.use(VCalendar)
Vue.use(VueClipboards)

import router from "./js/router.js"
import store from "./js/store.js"

// if signed out, go to signin page
store.watch((state, getters) => { return getters.signed_in }, signed_in => {
    if (!signed_in) {
        router.push({name: "signin"})
    }
})

import MainApp from "./components/app.vue"

var App = new (Vue.extend(MainApp))({
    el: "#root",
    router,
    store
})

export default App
