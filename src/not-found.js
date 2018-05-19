import "vue-material/dist/vue-material.css"
import "./style/theme.scss"

import Vue from "vue"
import VueMaterial from "vue-material"

Vue.use(VueMaterial)

import NotFound from "./components/not-found.vue"

var App = new (Vue.extend(NotFound))({
    el: "#root"
})

export default App
