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

            <md-field :class="{'md-invalid': errors.has('url')}">
                <label>URL</label>
                <md-input ref="url" v-model="url" name="url" v-validate="'required|url:true'"></md-input>
                <span class="md-error">{{errors.first('url')}}</span>
            </md-field>

            <md-button @click="enable_expires" v-if="!expires">Enable Expiration Date</md-button>

            <md-field v-if="expires">
                <label>Expires end of:</label>
                <md-input
                    :value="expires_date"
                    name="url"
                    disabled
                    @click.native="enable_expires">
                </md-input>
            </md-field>

            <div style="text-align: center" v-if="expires">
                <v-date-picker
                    mode="single"
                    :is-inline="true"
                    v-model="$data._expires">
                </v-date-picker>
                <div class="md-caption">Hint: Click on selected day to clear expiration date</div>
            </div>

        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-accent" @click="$router.push({name: 'dashboard'})">Cancel</md-button>
            <md-button class="md-primary" :disabled="is_loading" @click="save(url, expires)">
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
            url_loaded: false,
            current_url: null,
            url: null,
            _expires: null
        }
    },
    computed: {
        ...mapGetters(["is_loading"]),
        create() {
            return this.current_url == null
        },
        expires() {
            if (this.$data._expires == null) { return null }
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
        enable_expires() {
            this.$data._expires = moment().startOf("day").add(1, "days").toDate()
        },
        load(url_id) {
            this.url_loaded = false
            this.current_url = null
            this.url = null
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
                }
                this.url_loaded = true
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
        },
        save(url, expires) {
            if (this.is_loading) { return }

            this.$validator.validateAll().catch(() => {
                this.$store.commit("UPDATE_ERROR", "Form validation error")
            }).then(valid => {
                if (valid) {
                    if (this.create) {
                        return this.$store.dispatch("put_url", {url, expires})
                    }
                    var url_id = this.url_id
                    return this.$store.dispatch("update_url", {url_id, url, expires})
                }
                return Promise.reject()
            }).then(() => {
                this.$router.push({name: "dashboard"})
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
