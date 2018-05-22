<template>
    <md-dialog class="edit-dialog" :md-active="active" :class="{'invisible': !url_loaded}">
        <div class="spinner-container" v-show="!url_loaded">
            <md-progress-spinner md-mode="indeterminate" :md-stroke="3"></md-progress-spinner>
        </div>

        <md-dialog-title v-if="create">Create URL</md-dialog-title>
        <md-dialog-title v-if="!create">Edit URL: {{url_id}}</md-dialog-title>

        <md-dialog-content>

            <div v-if="!create">
                <div class="md-subtitle">
                    <span>
                        Last Modified: {{last_modified_pretty}}
                        <md-tooltip md-direction="bottom">{{last_modified}}</md-tooltip>
                    </span>
                </div>
                <div class="md-subtitle">Views: {{current_url.views}}</div>
            </div>

            <md-field :class="{'md-invalid': errors.has('URL')}">
                <label>URL</label>
                <md-input ref="url" v-model="url" name="url" data-vv-name="URL" v-validate="'required|url:true'"></md-input>
                <span class="md-error">{{errors.first('URL')}}</span>
            </md-field>

            <div v-if="create"><span>
                    <md-switch v-model="set_id" class="md-primary">Custom Code</md-switch>
                    <md-tooltip md-direction="bottom">Turn on to set your own code for the shortened URL</md-tooltip>
            </span></div>

            <md-field :class="{'md-invalid': errors.has('Custom Code')}" v-if="set_id && create">
                <label>Custom Code</label>
                <span class="md-prefix">{{window.location.origin}}/</span>
                <md-input ref="custom_url_id" v-model="$data._custom_url_id" name="custom_url_id" data-vv-name="Custom Code" v-validate="custom_url_id_regex"></md-input>
                <span class="md-error" v-if="errors.first('Custom Code')">
                    {{errors.first('Custom Code')}}
                    Valid characters: a-z A-Z 0-9 _ - .
                </span>
            </md-field>

            <div><span>
                    <md-switch v-model="set_expires" class="md-primary" @change="change_expires">Expiration Date</md-switch>
                    <md-tooltip md-direction="bottom">Turn on to set an expiration date</md-tooltip>
            </span></div>

            <md-field v-show="expires && set_expires">
                <label>Expires end of:</label>
                <md-input
                    :value="expires_date"
                    name="url"
                    disabled>
                </md-input>
            </md-field>

            <div style="text-align: center" v-show="expires && set_expires">
                <v-date-picker
                    mode="single"
                    :is-inline="true"
                    v-model="$data._expires"
                    @input="unset_expires">
                </v-date-picker>
            </div>

            <div class="md-error" v-if="error">{{error}}</div>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="$router.push(dashboard_route)">Cancel</md-button>
            <md-button class="md-primary" :disabled="save_disabled" @click="save(custom_url_id, url, expires)">
                <span v-show="!is_loading">Save</span>
                <md-progress-spinner
                    class="app-spinner"
                    v-if="is_loading"
                    md-mode="indeterminate"
                    :md-diameter="20"
                    :md-stroke="2"
                    ></md-progress-spinner>
            </md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import moment from "moment"
import {mapGetters} from "vuex"
import AuthorizedMixin from "./authorized-mixin.js"
import store from "../js/store.js"
export default {
    name: "app-edit",
    mixins: [AuthorizedMixin],
    props: ["active", "url_id"],
    data() {
        return {
            error: null,
            url_loaded: false,
            current_url: null,
            url: null,
            set_id: false,
            _custom_url_id: null,
            set_expires: false,
            _expires: null
        }
    },
    computed: {
        window() { return window },
        ...mapGetters(["is_loading", "dashboard_route"]),
        save_disabled() {
            return this.is_loading || this.errors.any() || this.url == null || (this.set_id && this.custom_url_id == null)
        },
        create() {
            return this.current_url == null
        },
        custom_url_id() {
            if (this.$data._custom_url_id == null || !this.$data.set_id) { return null }
            return this.$data._custom_url_id
        },
        custom_url_id_regex() {
            if (!this.set_id) { return {} }
            return { required: true, regex: /^[a-zA-Z0-9_\-.]+$/ }
        },
        expires() {
            if (this.$data._expires == null || !this.$data.set_expires) { return null }
            return moment(this.$data._expires).endOf("day").toDate()
        },
        expires_date() {
            return moment(this.expires).format("L")
        },
        last_modified() {
            return moment(this.current_url.last_modified).format("LLLL")
        },
        last_modified_pretty() {
            return moment(this.current_url.last_modified).fromNow()
        }
    },
    watch: {
        $route() {
            if (this.active) {
                this.load(this.url_id)
            }
        }
    },
    methods: {
        change_expires(val) {
            if (val && this.expires == null) {
                this.$data._expires = moment().startOf("day").add(1, "days").toDate()
            }
        },
        unset_expires(val) {
            if (val == null) { this.set_expires = false }
        },
        load(url_id) {
            this.url_loaded = false
            this.current_url = null
            this.url = null
            this.set_id = false
            this.set_expires = false
            this.$data._custom_url_id = null
            this.set_expires = false
            this.$data._expires = null

            if (this.url_id == null) {
                this.url_loaded = true
                return
            }

            var promise = this.$store.dispatch("get_url", this.url_id)
            promise.then(response => {
                var url = response.data
                this.current_url = url
                this.url = url.url
                if (url.expires != null) {
                    this.$data._expires = moment(url.expires).startOf("day").toDate()
                    this.set_expires = true
                }
                this.url_loaded = true
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
        },
        save(url_id, url, expires) {
            if (this.is_loading) { return }

            this.error = null

            this.$validator.validateAll().catch(() => {
                this.$store.commit("UPDATE_ERROR", "Form validation error")
            }).then(valid => {
                if (valid) {
                    if (this.create) {
                        return this.$store.dispatch("put_url", {url_id, url, expires})
                    }
                    url_id = this.url_id
                    return this.$store.dispatch("update_url", {url_id, url, expires})
                }
                return false
            }).then((val) => {
                if (val !== false ) { this.$router.push(this.dashboard_route) }
            }).catch(error => {
                if (error.response != null && error.response.status === 409) {
                    this.error = "Code \"" + url_id + "\" already exists"
                }
            })
        },
    },
    created() {
        this.load(this.url_id)
    }
}
</script>

<style lang="stylus" scoped>
.invisible *
    opacity: 0

.edit-dialog
    min-width: 480px

.spinner-container
    position: absolute
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center

    &, *
        opacity: 1.0
</style>
