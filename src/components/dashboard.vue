<template>
    <div id="dashboard" :class="{'wide': admin_interface}">
        <md-table ref="table" v-if="urls" v-model="searched_urls" md-sort="last_modified" md-sort-order="asc" md-card md-fixed-header>
            <md-table-toolbar class="toolbar">
                <div class="md-title" v-if="!admin_interface">My URLs</div>
                <div class="md-title" v-if="admin_interface">All URLs</div>

                <md-button class="md-icon-button" @click="reload">
                    <md-icon v-if="!is_loading">refresh</md-icon>
                    <md-progress-spinner
                        class="app-spinner"
                        v-if="is_loading"
                        md-mode="indeterminate"
                        :md-diameter="20"
                        :md-stroke="2"
                        ></md-progress-spinner>
                </md-button>

                <div class="spacer"></div>

                <md-switch
                    v-model="admin_interface_toggle"
                    class="md-primary admin-toggle"
                    v-if="admin">
                    View all URLs
                </md-switch>

                <div class="spacer"></div>

                <md-field md-clearable class="search md-toolbar-section-end">
                    <md-input placeholder="Search URLs..." v-model="search" @input="search_urls" />
                </md-field>
            </md-table-toolbar>

            <md-table-empty-state
                md-icon="search"
                md-label="No URLs found"
                md-description="Try another search query."
                v-if="search">
            </md-table-empty-state>

            <md-table-empty-state
                md-icon="public"
                md-label="No URLs Created Yet"
                md-description="Click the button below to create your first URL!"
                v-if="!search">
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
                <md-table-cell md-label="User" md-sort-by="user" v-if="admin_interface">{{item.user}}</md-table-cell>
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
            @md-cancel="$router.push(dashboard_route)"
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
import {mapState, mapGetters} from "vuex"
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
            search: "",
            urls: [],
            searched_urls: []
        }
    },
    computed: {
        window() {
            return window
        },
        ...mapState(["admin"]),
        ...mapGetters(["is_loading", "admin_interface", "dashboard_route"]),
        editActive() {
            return this.$route.name === "create" || this.$route.name === "edit"
        },
        admin_interface_toggle: {
            get() {
                return this.admin_interface
            },
            set(val) {
                this.$store.commit("UPDATE_ADMIN_STATE", val)
            }
        }
    },
    watch: {
        $route(route) {
            if (route.name === "admin" || route.name === "dashboard") {
                this.reload()
            }
        }
    },
    methods: {
        reload() {
            var promise = store.dispatch("get_urls")
            promise.then(response => {
                var urls = response.data.urls
                processURLs(urls)
                this.urls = urls
                this.search_urls(this.search)
                this.$nextTick(() => { window.dispatchEvent(new Event("resize")) })
            })
        },
        resort_urls() {
            if (this.$refs.table != null) { this.$refs.table.mdSortFn(this.searched_urls) }
        },
        search_urls(search) {
            if (search == null) {
                this.searched_urls = this.urls
                this.resort_urls()
                return
            }

            search = search.toLowerCase()
            this.searched_urls = this.urls.filter(elem => {
                if (elem.id.toLowerCase().includes(search)) { return true }
                if (elem.url.toLowerCase().includes(search)) { return true }
                if (this.admin_interface && elem.user.toLowerCase().includes(search)) { return true }
            })

            this.resort_urls()
        },
        delete_url(url_id) {
            if (this.is_loading) { return }

            var promise = this.$store.dispatch("delete_url", url_id)
            promise.then(() => {
                this.$router.push(this.dashboard_route)
            }).catch(error => {
                if (error.response != null &&  error.response.status === 403) {
                    this.$router.replace(this.dashboard_route)
                    return
                }
                if (error.response != null &&  error.response.status === 404) {
                    this.$router.push(this.dashboard_route)
                    return
                }
            })
        }
    },
    created() {
        var promise = store.dispatch("get_urls")
        promise.then(response => {
            var urls = response.data.urls
            processURLs(urls)
            this.urls = urls
            this.search_urls(this.search)
        })
    },
    beforeRouteEnter(to, from, next) {
        if (to.name === "admin" && !store.state.admin) {
            next({name: "dashboard"})
            return
        }

        if (to.name === "admin") {
            store.commit("UPDATE_ADMIN_STATE", true)
        } else if (to.name === "dashboard") {
            store.commit("UPDATE_ADMIN_STATE", false)
        }

        next()
    }
}
</script>

<style lang="stylus">
#content #dashboard
    max-width: 960px

#content #dashboard.wide
    max-width: 1280px

.md-toolbar.toolbar
    .md-title
        flex: none

    .spacer
        flex: 1

    .admin-toggle
        flex: 1

.search
    max-width: 300px

.md-table-cell.url-cell
    max-width: 200px

    .md-table-cell-container
        overflow: hidden
        text-overflow: ellipsis
</style>
