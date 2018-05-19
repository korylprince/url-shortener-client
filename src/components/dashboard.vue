<template>
    <div id="dashboard">
        <md-table v-if="urls" :value="urls" md-sort="last_modified" md-sort-order="asc" md-card>
            <md-table-toolbar>
                <div class="md-title">My URLs</div>
            </md-table-toolbar>

            <md-table-empty-state
                md-icon="public"
                md-label="No URLs Created Yet"
                md-description="Click the button below to create your first URL!">
                <md-button class="md-primary md-raised" @click="$router.push({name: 'create'})">Add URL</md-button>
            </md-table-empty-state>

            <md-table-row slot="md-table-row" slot-scope="{ item }">
                <md-table-cell md-label="ID" md-sort-by="id">
                    <a target="_blank" :href="window.location.origin + '/' + item.id">{{item.id}}</a>
                </md-table-cell>
                <md-table-cell class="url-cell" md-label="URL" md-sort-by="url">
                    <a target="_blank" :href="item.url">{{item.url}}</a>
                </md-table-cell>
                <md-table-cell md-label="Views" md-sort-by="views">{{item.views}}</md-table-cell>
                <md-table-cell md-label="Expires" md-sort-by="_expires">
                    {{item.expires | pretty_from_now}}
                    <md-tooltip md-direction="bottom" v-if="item.expires">{{item.expires | pretty}}</md-tooltip>
                </md-table-cell>
                <md-table-cell md-label="Last Modified" md-sort-by="last_modified">
                    {{item.last_modified | pretty_from_now}}
                    <md-tooltip md-direction="bottom">{{item.last_modified | pretty}}</md-tooltip>
                </md-table-cell>
                <md-table-cell md-label="Actions">
                    <md-button class="md-icon-button"
                        v-clipboard="window.location.origin + '/' + item.id"
                        @success="$store.commit('ADD_FEEDBACK', 'URL copied to clipboard')">
                        <md-icon>file_copy</md-icon>
                        <md-tooltip md-direction="bottom">Copy to Clipboard</md-tooltip>
                    </md-button>
                    <md-button class="md-icon-button" @click="$router.push({name: 'edit', params: {id: item.id}})">
                        <md-icon>edit</md-icon>
                        <md-tooltip md-direction="bottom">Edit</md-tooltip>
                    </md-button>
                    <md-button class="md-icon-button" @click="$router.push({name: 'delete', params: {id: item.id}})">
                        <md-icon>delete</md-icon>
                        <md-tooltip md-direction="bottom">Delete</md-tooltip>
                    </md-button>
                </md-table-cell>
            </md-table-row>
        </md-table>

        <app-edit :active="editActive" :url_id="$route.params.id"/>

        <md-dialog-confirm
            :md-active="$route.name === 'delete'"
            md-title="Delete URL"
            :md-content="'Are you sure you want to delete URL ' + $route.params.id + '?'"
            md-confirm-text="Yes"
            md-cancel-text="Cancel"
            @md-confirm="delete_url($route.params.id)" 
            @md-cancel="$router.push({name: 'dashboard'})"
            />
    </div>
</template>

<script>
function processURLs(urls) {
    for (var i = 0; i < urls.length; i++) {
        urls[i]._expires = urls[i].expires
        if (urls[i]._expires == null) {
            urls[i]._expires = moment().add(10, "years").toISOString()
        }
    }
}

import moment from "moment"
import {mapGetters} from "vuex"
import AuthorizedMixin from "./authorized-mixin.js"
import store from "../js/store.js"
import AppEdit from "./edit.vue"
export default {
    name: "app-dashboard",
    mixins: [AuthorizedMixin],
    components: {AppEdit},
    filters: {
        pretty(val) {
            return moment(val).format("LLLL")
        },
        pretty_from_now(val) {
            if (val == null) { return "Never" }
            return moment(val).fromNow()
        }
    },
    data() {
        return {
            urls: []
        }
    },
    computed: {
        ...mapGetters(["is_loading"]),
        editActive() {
            return this.$route.name === "create" || this.$route.name === "edit"
        },
        window() {
            return window
        }
    },
    methods: {
        reload() {
            var promise = store.dispatch("get_urls")
            promise.then(response => {
                var urls = response.data.urls
                processURLs(urls)
                this.urls = urls
            })
        },
        delete_url(url_id) {
            if (this.is_loading) { return }

            var promise = this.$store.dispatch("delete_url", url_id)
            promise.then(() => {
                this.$router.push({name: "dashboard"})
                this.reload()
            }).catch(error => {
                if (error.response != null &&  error.response.status === 403) {
                    this.$router.replace({name: "dashboard"})
                    return
                }
                if (error.response != null &&  error.response.status === 404) {
                    this.$router.push({name: "dashboard"})
                    return
                }
            })
        }
    },
    beforeRouteEnter(to, from, next) {
        /* Remove once https://github.com/vuejs/vue-router/issues/2188 is resolved
        if (to.name !== "dashboard") {
            next()
            return
        }
        */

        var promise = store.dispatch("get_urls")
        promise.then(response => {
                var urls = response.data.urls
            next(vm => {
                processURLs(urls)
                vm.urls = urls
            })
        })
    }
}
</script>

<style lang="stylus">
#content #dashboard
    max-width: 960px

.md-table-cell.url-cell
    max-width: 200px

    .md-table-cell-container
        overflow: hidden
        text-overflow: ellipsis
</style>
