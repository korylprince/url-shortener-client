import store from "../js/store.js"
export default {
    beforeRouteEnter(to, from, next) {
        if (!(store.getters.signed_in)) {
            store.commit("UPDATE_NEXT_ROUTE", to)
            next({name: "signin"})
            return
        }
        next()
    },
}
