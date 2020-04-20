<template>
    <v-dialog :value="active" @click:outside="close" max-width="480">
        <v-card :loading="_loading">
            <v-card-title class="headline" v-if="id">Edit URL: {{id}}</v-card-title>
            <v-card-title class="headline" v-else>Create URL</v-card-title>

            <validation-observer ref="form" v-slot="{invalid}" v-if="!(id) || (id && !_loading)">
                <form novalidate @submit.prevent="id ? update(id, url, expires_compound) : create(code_compound, url, expires_compound)">
                    <v-card-text>
                        <div class="body-1" style="color: red">{{error}}</div>

                        <div v-if="current_url">
                            <v-tooltip bottom>
                                <template v-slot:activator="{on}">
                                    <span v-on="on" class="subtitle-1">Last Modified: {{current_url.last_modified | pretty_from_now}}</span>
                                </template>
                                <span>{{current_url.last_modified | pretty}}</span>
                            </v-tooltip>
                            <div class="subtitle-1">Views: {{current_url.views}}</div>
                        </div>

                        <validation-provider name="url" rules="required|url" mode="lazy" v-slot="{errors}">
                            <v-text-field
                                ref="url"
                                label="URL"
                                v-model="url"
                                autofocus
                                :error-messages="errors"
                                required>
                            </v-text-field>
                        </validation-provider>

                        <v-switch
                            label="Custom Code"
                            v-model="enable_code"
                            v-if="!(id)">
                        </v-switch>

                        <validation-provider name="code" rules="required|code" v-slot="{errors}" v-if="enable_code">
                            <v-text-field
                                ref="code"
                                label="Custom Code"
                                v-model="code"
                                :prefix="origin"
                                :error-messages="errors"
                                required>
                            </v-text-field>
                        </validation-provider>

                        <v-switch
                            v-model="enable_expires"
                            label="Expiration Date">
                        </v-switch>

                        <div v-if="enable_expires">
                            <v-text-field label="Expires end of" :value="expires_date" disabled></v-text-field>
                            <v-row justify="center">
                                <v-date-picker v-model="expires" no-title></v-date-picker>
                            </v-row>
                        </div>

                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn color="accent" text @click="close">
                            Cancel
                        </v-btn>

                        <v-btn color="primary"
                               text
                               type="submit"
                               :loading="_loading"
                               :disabled="invalid || url == null || (enable_code && code_compound == null) || (enable_expires && expires_compound == null)">
                            Save
                        </v-btn>
                    </v-card-actions>
                </form>
            </validation-observer>
        </v-card>
    </v-dialog>
</template>

<script>
import moment from "moment"
import {mapGetters, mapMutations, mapActions} from "vuex"
import AuthorizedMixin from "./authorized-mixin.js"
import api from "../js/api.js"
export default {
    name: "app-edit",
    mixins: [AuthorizedMixin],
    props: ["active", "id"],
    filters: {
        pretty(val) {
            return moment(val).format("LLLL")
        },
        pretty_from_now(val) {
            if (val == null) {
                return "Never"
            }
            return moment(val).fromNow()
        },
    },
    data() {
        return {
            url: null,
            enable_expires: false,
            expires: null,
            enable_code: false,
            code: null,
            current_url: null,
            error: null,
        }
    },
    computed: {
        ...mapGetters(["is_loading"]),
        _loading() {
            return this.is_loading(api.get_url, api.put_url, api.update_url)
        },
        origin() {
            return `${window.location.origin}/`
        },
        code_compound() {
            if (!this.enable_code) {
                return null
            }
            return this.code
        },
        expires_date() {
            if (this.expires == null) {
                return null
            }
            return moment(this.expires).format("L")
        },
        expires_compound() {
            if (!this.enable_expires) {
                return null
            }
            if (this.expires == null) {
                return null
            }
            return moment(this.expires).endOf("day").toDate()
        },
    },
    watch: {
        async id(val) {
            if (val == null) {
                return
            }
            try {
                this.current_url = await this.api_action({action: api.get_url, params: [val]})
                this.url = this.current_url.url
                if (this.current_url.expires != null) {
                    this.expires = moment(this.current_url.expires).format("YYYY-MM-DD")
                    this.enable_expires = true
                }
            } catch (err) {
                if (err.response !== null && err.response.status === 404) {
                    this.UPDATE_ERROR("Unable to load URL. Contact your system administrator")
                }
            }
        },
    },
    methods: {
        ...mapMutations(["ADD_FEEDBACK", "UPDATE_ERROR"]),
        ...mapActions(["api_action"]),
        close() {
            this.$emit("update:active", null)
            this.$emit("update:id", null)
            this.url = null
            this.code = null
            this.enable_code = false
            this.expires = null
            this.enable_expires = false
            this.current_url = null
            this.error = null
            this.$refs.form.reset()
        },
        async create(id, url, expires) {
            this.error = null
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                await this.api_action({action: api.put_url, params: [id, url, expires]})
                this.$emit("update")
                this.close()
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.error = `The code "${id}" already exists`
                } else {
                    this.UPDATE_ERROR("Unable to create URL. Contact your system administrator")
                }
            }
        },
        async update(id, url, expires) {
            this.error = null
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                await this.api_action({action: api.update_url, params: [id, url, expires]})
                this.$emit("update")
                this.close()
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.error = `The code ${id} already exists`
                } else {
                    this.UPDATE_ERROR("Unable to update URL. Contact your system administrator")
                }
            }
        },
    },
}
</script>
