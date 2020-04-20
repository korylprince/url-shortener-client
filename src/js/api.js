/* global API_BASE */

import axios from "axios"
import store from "./store.js"

const api = {
    authenticate(username, password) {
        return axios.post(`${API_BASE}/auth`, {username, password})
    },
    get_title() {
        return axios.get(API_BASE + "/title")
    },
    get_url(id) {
        return store.getters.$http.get(API_BASE + "/urls/" + id)
    },
    put_url(id, url, expires) {
        return store.getters.$http.post(API_BASE + "/urls", {id: id, url, expires})
    },
    update_url(id, url, expires) {
        return store.getters.$http.put(API_BASE + "/urls/" + id, {url, expires})
    },
    delete_url(id) {
        return store.getters.$http.delete(API_BASE + "/urls/" + id)
    },
    get_urls(all_urls) {
        if (all_urls) {
            return store.getters.$http.get(API_BASE + "/urls?all=true")
        }
        return store.getters.$http.get(API_BASE + "/urls")
    },
}

export default api
