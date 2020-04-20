import "@mdi/font/css/materialdesignicons.css"
import Vue from "vue"
import Vuetify from "vuetify/lib"

Vue.use(Vuetify)

import colors from "vuetify/lib/util/colors"

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: "#063d63",
                accent: "#3f7da9",
                secondary: colors.blue.accent4,
            },
        },
    },
})
