import axios from "axios"

import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

import api from "./api.js"

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    state: {
        last_error: null,
        _loading: {},
        title: "URL Shortener",
        display_name: window.localStorage.getItem("display_name"),
        username: window.localStorage.getItem("username"),
        session_id: window.localStorage.getItem("session_id"),
        admin: window.localStorage.getItem("admin") === "true",
        _next_route: null,
        _next_dispatch_action: null,
        _next_dispatch_payload: null,
        _feedback: [],
        _feedback_delay: false,
    },
    getters: {
        is_loading(state) {
            return (...keys) => {
                for (const key of keys) {
                    if (key in state._loading && state._loading[key] !== 0) {
                        return true
                    }
                }
                return false
            }
        },
        next_route(state) {
            if (state._next_route == null) {
                return null
            }
            return {
                name: state._next_route.name,
                path: state._next_route.path,
                params: state._next_route.params,
                query: state._next_route.query,
            }
        },
        signed_in(state) {
            return state.session_id != null
        },
        show_dialog(state) {
            return state.last_error != null
        },
        $http(state) {
            return axios.create({
                headers: {Authorization: "Bearer " + state.session_id},
            })
        },
        current_feedback(state) {
            if (state._feedback_delay || state._feedback.length === 0) {
                return null
            }
            return state._feedback[0]
        },
    },
    mutations: {
        UPDATE_ERROR(state, error) {
            state.last_error = error
        },
        START_LOADING(state, key) {
            if (!(key in state._loading)) {
                Vue.set(state._loading, key, 0)
            }
            state._loading[key]++
            state.last_error = null
        },
        STOP_LOADING(state, key) {
            state._loading[key]--
        },
        UPDATE_TITLE(state, title) {
            if (title !== "") {
                state.title = title
                document.title = title
            }
        },
        UPDATE_CREDENTIALS(state, {display_name, username, session_id, admin}) {
            state.display_name = display_name
            window.localStorage.setItem("display_name", display_name)
            state.username = username
            window.localStorage.setItem("username", username)
            state.session_id = session_id
            window.localStorage.setItem("session_id", session_id)
            state.admin = admin
            window.localStorage.setItem("admin", admin)
        },
        SIGNOUT(state) {
            state.display_name = null
            window.localStorage.removeItem("display_name")
            state.username = null
            window.localStorage.removeItem("username")
            state.session_id = null
            window.localStorage.removeItem("session_id")
            state.admin = null
            window.localStorage.removeItem("admin")
        },
        UPDATE_NEXT_ROUTE(state, route) {
            state._next_route = route
        },
        UPDATE_NEXT_DISPATCH(state, {action, payload}) {
            state._next_dispatch_action = action
            state._next_dispatch_payload = payload
        },
        ADD_FEEDBACK(state, msg) {
            if (state._feedback[state._feedback.length - 1] !== msg) {
                state._feedback.push(msg)
            }
        },
        CLEAR_FEEDBACK(state) {
            // remove first element
            state._feedback.splice(0, 1)
            state._feedback_delay = true
        },
        CLEAR_FEEDBACK_DELAY(state) {
            state._feedback_delay = false
        },
    },
    actions: {
        async authenticate(context, {username, password}) {
            context.commit("START_LOADING", api.authenticate)

            try {
                const response = await api.authenticate(username, password)
                context.commit("STOP_LOADING", api.authenticate)
                context.commit("UPDATE_CREDENTIALS", {display_name: response.data.display_name, username, session_id: response.data.session_id, admin: response.data.attrs.admin})
            } catch (err) {
                context.commit("STOP_LOADING", api.authenticate)
                if (err.response !== null && err.response.status === 401) {
                    context.commit("UPDATE_ERROR", "Wrong username or password")
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: err})
                return
            }
        },
        async signout(context) {
            context.commit("SIGNOUT")
        },
        next_route(context, router) {
            let next = context.getters.next_route
            if (next == null) {
                next = {name: "dashboard"}
            }
            router.push(next)
            context.commit("UPDATE_NEXT_ROUTE", null)
        },
        async next_dispatch(context) {
            if (context.state._next_dispatch_action == null) {
                return
            }
            await context.dispatch(context.state._next_dispatch_action, context.state._next_dispatch_payload)
            context.commit("UPDATE_NEXT_DISPATCH", {action: null, payload: null})
        },
        clear_feedback(context) {
            context.commit("CLEAR_FEEDBACK")
            window.setTimeout(() => {
                context.commit("CLEAR_FEEDBACK_DELAY")
            }, 500)
        },
        async api_action(context, {action, params}) {
            context.commit("START_LOADING", action)
            try {
                const response = await action(...params)
                context.commit("STOP_LOADING", action)
                return response.data
            } catch (err) {
                context.commit("STOP_LOADING", action)
                if (err.response !== null && err.response.status === 401) {
                    context.dispatch("signout")
                    context.commit("ADD_FEEDBACK", "Session expired. Please sign back in")
                } else if (err.response !== null && (err.response.status === 404 || err.response.status === 409)) {
                    // pass
                } else {
                    context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                    console.error({err: err})
                }
                // handle in caller
                throw (err)
            }
        },
    },
})

export default store
