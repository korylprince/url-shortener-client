import axios from "axios"

import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

import api from "./api.js"

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    state: {
        last_error: null,
        _loading_count: 0,
        username: window.localStorage.getItem("username"),
        session_id: window.localStorage.getItem("session_id"),
        _next_route: null,
        _next_dispatch_action: null,
        _next_dispatch_payload: null,
        _feedback: [],
        _feedback_delay: false
    },
    getters: {
        is_loading(state) {
            return state._loading_count !== 0
        },
        next_route(state) {
            if (state._next_route == null) {
                return null
            }
            return {
                name: state._next_route.name,
                path: state._next_route.path,
                params: state._next_route.params,
                query: state._next_route.query
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
                headers: {Authorization: "Session id=\"" + state.session_id + "\""}
            })
        },
        current_feedback(state) {
            if (state._feedback_delay || state._feedback.length === 0) { return null }
            return state._feedback[0]
        }
    },
    mutations: {
        UPDATE_ERROR(state, error) {
            state.last_error = error
        },
        START_LOADING(state) {
            state._loading_count++
            state.last_error = null
        },
        STOP_LOADING(state) {
            state._loading_count--
        },
        UPDATE_CREDENTIALS(state, {username, session_id}) {
            state.username = username
            window.localStorage.setItem("username", username)
            state.session_id = session_id
            window.localStorage.setItem("session_id", session_id)
        },
        SIGNOUT(state) {
            state.username = null
            window.localStorage.removeItem("username")
            state.session_id = null
            window.localStorage.removeItem("session_id")
        },
        UPDATE_NEXT_ROUTE(state, route) {
            state._next_route = route
        },
        UPDATE_NEXT_DISPATCH(state, {action, payload}) {
            state._next_dispatch_action = action
            state._next_dispatch_payload = payload
        },
        ADD_FEEDBACK(state, msg) {
            state._feedback.push(msg)
        },
        CLEAR_FEEDBACK(state) {
            // remove first element
            state._feedback.splice(0, 1)
            state._feedback_delay = true
        },
        CLEAR_FEEDBACK_DELAY(state) {
            state._feedback_delay = false
        }
    },
    actions: {
        authenticate(context, {username, password}) {
            context.commit("START_LOADING")

            var promise = api.authenticate(username, password)
            promise.then(response => {
                context.commit("STOP_LOADING")
                var session_id = response.data.session_id
                context.commit("UPDATE_CREDENTIALS", {username, session_id})
            }).then(() => {
                context.dispatch("next_dispatch")
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response !== null && error.response.status === 401) {
                    context.commit("UPDATE_ERROR", "Wrong email or password")
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        signout(context) {
            context.commit("SIGNOUT")
        },
        next_dispatch(context) {
            if (context.state._next_dispatch_action == null) { return }
            return context.dispatch(context.state._next_dispatch_action, context.state._next_dispatch_payload).finally(() => {
                context.commit("UPDATE_NEXT_DISPATCH", {action: null, payload: null})
            })
        },
        clear_feedback(context) {
            context.commit("CLEAR_FEEDBACK")
            window.setTimeout(() => {
                context.commit("CLEAR_FEEDBACK_DELAY")
            }, 500)
        },
        get_url(context, url_id) {
            context.commit("START_LOADING")

            var promise = api.get_url(url_id)
            promise.then(() => {
                context.commit("STOP_LOADING")
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("SIGNOUT")
                    context.commit("ADD_FEEDBACK", "Session expired. Please sign back in")
                    return
                } else if (error.response != null && error.response.status === 404) {
                    context.commit("ADD_FEEDBACK", "URL not found")
                    return
                } else if (error.response != null && error.response.status === 403) {
                    context.commit("ADD_FEEDBACK", "You don't have permission to view this URL")
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        put_url(context, {url_id, url, expires}) {
            context.commit("START_LOADING")

            var promise = api.put_url(url_id, url, expires)
            promise.then(() => {
                context.commit("STOP_LOADING")
                context.commit("ADD_FEEDBACK", "URL added")
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("SIGNOUT")
                    context.commit("ADD_FEEDBACK", "Session expired. Please sign back in to add URL")
                    context.commit("UPDATE_NEXT_DISPATCH", {action: "put_url", payload: {url_id, url, expires}})
                    return
                } else if (error.response != null && error.response.status === 404) {
                    context.commit("ADD_FEEDBACK", "URL not found")
                    return
                } else if (error.response != null && error.response.status === 409) {
                    // Handled in view
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        update_url(context, {url_id, url, expires}) {
            context.commit("START_LOADING")

            var promise = api.update_url(url_id, url, expires)
            promise.then(() => {
                context.commit("STOP_LOADING")
                context.commit("ADD_FEEDBACK", "URL updated")
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("SIGNOUT")
                    context.commit("ADD_FEEDBACK", "Session expired. Please sign back in to update URL")
                    context.commit("UPDATE_NEXT_DISPATCH", {action: "update_url", payload: {url_id, url, expires}})
                    return
                } else if (error.response != null && error.response.status === 404) {
                    context.commit("ADD_FEEDBACK", "URL not found")
                    return
                } else if (error.response != null && error.response.status === 403) {
                    context.commit("ADD_FEEDBACK", "You don't have permission to update this URL")
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        delete_url(context, url_id) {
            context.commit("START_LOADING")

            var promise = api.delete_url(url_id)
            promise.then(() => {
                context.commit("STOP_LOADING")
                context.commit("ADD_FEEDBACK", "URL deleted")
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("SIGNOUT")
                    context.commit("ADD_FEEDBACK", "Session expired. Please sign back in to delete URL")
                    context.commit("UPDATE_NEXT_DISPATCH", {action: "delete_url", payload: url_id})
                    return
                } else if (error.response != null && error.response.status === 404) {
                    context.commit("ADD_FEEDBACK", "URL not found")
                    return
                } else if (error.response != null && error.response.status === 403) {
                    context.commit("ADD_FEEDBACK", "You don't have permission to delete this URL")
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        },
        get_urls(context) {
            context.commit("START_LOADING")

            var promise = api.get_urls()
            promise.then(() => {
                context.commit("STOP_LOADING")
            }).catch(error => {
                context.commit("STOP_LOADING")
                if (error.response != null && error.response.status === 401) {
                    context.commit("SIGNOUT")
                    context.commit("ADD_FEEDBACK", "Session expired. Please sign back in")
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: error})
            })

            return promise
        }
    }
})

export default store
