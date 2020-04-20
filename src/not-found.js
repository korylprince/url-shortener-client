import Vue from "vue"
import vuetify from "./plugins/vuetify.js"

import NotFound from "./components/not-found.vue"

const App = new (Vue.extend(NotFound))({
    el: "#root",
    vuetify,
})

export default App
