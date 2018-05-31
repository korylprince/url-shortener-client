/*global API_BASE*/

import axios from "axios"

import store from "./store.js"

const api = {
    authenticate(username, password) {
        return axios.post(API_BASE + "/auth", {username, password})
    },
    get_url(url_id) {
        var $http = store.getters.$http
        if ($http == null) { return Promise.reject({response: {status: 401}}) }
        return $http.get(API_BASE + "/urls/" + url_id)
    },
    put_url(url_id, url, expires) {
        var $http = store.getters.$http
        if ($http == null) { return Promise.reject({response: {status: 401}}) }
        return $http.post(API_BASE + "/urls", {id: url_id, url, expires})
    },
    update_url(url_id, url, expires) {
        var $http = store.getters.$http
        if ($http == null) { return Promise.reject({response: {status: 401}}) }
        return $http.put(API_BASE + "/urls/" + url_id, {url, expires})
    },
    delete_url(url_id) {
        var $http = store.getters.$http
        if ($http == null) { return Promise.reject({response: {status: 401}}) }
        return $http.delete(API_BASE + "/urls/" + url_id)
    },
    get_urls(all_urls) {
        var $http = store.getters.$http
        if ($http == null) { return Promise.reject({response: {status: 401}}) }
        if (all_urls) {
            return $http.get(API_BASE + "/urls?all=true")
        }
        return $http.get(API_BASE + "/urls")
    },
    title() {
        return axios.get(API_BASE + "/title")
    }
}

export default api
