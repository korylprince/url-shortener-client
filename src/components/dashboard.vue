<template>
    <v-card width="100%" :max-width="admin_mode ? '1280px': '960px'" :loading="_loading">
        <v-card-title>
            <span v-if="admin_mode">All URLs</span>
            <span v-else>My URLs</span>

            <v-progress-circular indeterminate class="ma-2" :size="20" :width="2" v-if="_loading"></v-progress-circular>

            <v-btn icon v-else @click="get_urls(admin_mode)">
                <v-icon>mdi-reload</v-icon>
            </v-btn>

            <v-spacer></v-spacer>

            <v-switch v-model="admin_mode" label="View all URLs" v-if="admin"></v-switch>

            <v-spacer></v-spacer>
            <v-text-field
                v-model="search"
                prepend-icon="mdi-magnify"
                label="Search URLs..."
                single-line
                hide-details
                class="mt-0 pt-0"
                ></v-text-field>
        </v-card-title>
        <v-data-table
            :headers="headers"
            :items="items"
            :hide-default-footer="items.length === 0"
            :search="search">

            <template slot="no-data">
                <div class="ma-5">
                    <v-icon :size="200">mdi-earth</v-icon>
                    <div class="display-2" style="color: black">No URLs Created Yet</div>
                    <div class="body-1">Click the button below to create your first URL!</div>
                    <v-btn color="primary" class="ma-5" @click="edit_dialog = true">Add URL</v-btn>
                </div>
            </template>

            <template v-slot:item.id="{item}">
                <a :href="item.id | url">{{item.id}}</a>
            </template>

            <template v-slot:item.url="{item}">
                <a :href="item.url" class="url-item">{{item.url}}</a>
            </template>

            <template v-slot:item.expires="{item}">
                <v-tooltip bottom v-if="item.expires">
                    <template v-slot:activator="{on}">
                        <span v-on="on">{{item.expires | pretty_from_now}}</span>
                    </template>
                    <span>{{item.expires | pretty}}</span>
                </v-tooltip>
                <span v-else>Never</span>
            </template>

            <template v-slot:item.last_modified="{item}">
                <v-tooltip bottom>
                    <template v-slot:activator="{on}">
                        <span v-on="on">{{item.last_modified | pretty_from_now}}</span>
                    </template>
                    <span>{{item.last_modified | pretty}}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.actions="{item}">
                <div style="white-space: nowrap">
                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn icon v-on="on"
                                        v-clipboard="id_to_url(item.id)"
                                        @success="$store.commit('ADD_FEEDBACK', 'URL copied to clipboard')">
                                <v-icon>mdi-content-copy</v-icon>
                            </v-btn>
                        </template>
                        <span>Copy to Clipboard</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn icon v-on="on" @click="edit_url(item.id)">
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                        </template>
                        <span>Edit</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn icon v-on="on" @click="delete_dialog_id = item.id">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </template>
                        <span>Delete</span>
                    </v-tooltip>
                </div>
            </template>
        </v-data-table>

        <v-btn color="accent" fab fixed right bottom @click="edit_dialog = true">
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <v-dialog :value="delete_dialog_id" persistent max-width="360px">
            <v-card>
                <v-card-title class="headline">Delete URL</v-card-title>
                <v-card-text>Are you sure you to delete URL {{delete_dialog_id}}?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="accent" text @click="delete_dialog_id = null">Cancel</v-btn>
                    <v-btn color="primary" text @click="delete_url(delete_dialog_id)">Yes</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <app-edit :active.sync="edit_dialog" :id.sync="edit_dialog_id" @update="get_urls(admin_mode)"></app-edit>
    </v-card>
</template>

<script>
import moment from "moment"
import {mapState, mapGetters, mapMutations, mapActions} from "vuex"
import AuthorizedMixin from "./authorized-mixin.js"
import AppEdit from "./edit.vue"
import api from "../js/api.js"
export default {
    name: "app-dashboard",
    mixins: [AuthorizedMixin],
    components: {AppEdit},
    filters: {
        url(id) {
            return `${window.location.origin}/${id}`
        },
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
            search: "",
            items: [],
            delete_dialog_id: null,
            edit_dialog: false,
            edit_dialog_id: null,
        }
    },
    computed: {
        ...mapState(["admin"]),
        ...mapGetters(["is_loading"]),
        _loading() {
            return this.is_loading(api.get_urls)
        },
        admin_mode: {
            get() {
                return this.$route.name === "admin"
            },
            set(val) {
                if (val) {
                    this.$router.push({"name": "admin"})
                } else {
                    this.$router.push({"name": "dashboard"})
                }
            },
        },
        headers() {
            if (this.admin_mode) {
                return [
                    {text: "ID", value: "id"},
                    {text: "URL", value: "url"},
                    {text: "Views", value: "views"},
                    {text: "Expires", value: "expires"},
                    {text: "Last Modified", value: "last_modified"},
                    {text: "User", value: "user"},
                    {text: "Actions", value: "actions", sortable: false, align: "end"},
                ]
            }
            return [
                {text: "ID", value: "id"},
                {text: "URL", value: "url"},
                {text: "Views", value: "views"},
                {text: "Expires", value: "expires"},
                {text: "Last Modified", value: "last_modified"},
                {text: "Actions", value: "actions", sortable: false, align: "end"},
            ]
        },
    },
    watch: {
        "$route": function() {
            this.get_urls(this.admin_mode)
        },
    },
    methods: {
        ...mapMutations(["ADD_FEEDBACK", "UPDATE_ERROR"]),
        ...mapActions(["api_action"]),
        id_to_url(id) {
            return `${window.location.origin}/${id}`
        },
        async get_urls(admin_mode) {
            try {
                this.items = (await this.api_action({action: api.get_urls, params: [admin_mode]})).urls
            } catch (err) {
                if (err.response !== null && err.response.status === 404) {
                    this.UPDATE_ERROR("Unable to load URLs. Contact your system administrator")
                }
            }
        },
        edit_url(id) {
            this.edit_dialog_id = id
            this.edit_dialog = true
        },
        async delete_url(id) {
            try {
                await this.api_action({action: api.delete_url, params: [id]})
                this.delete_dialog_id = null
                this.get_urls(this.admin_mode)
                this.ADD_FEEDBACK("URL deleted")
            } catch (err) {
                if (err.response !== null && err.response.status !== 401) {
                    this.UPDATE_ERROR("Unable to delete URL. Contact your system administrator")
                }
            }
        },
    },
    created() {
        this.get_urls(this.admin_mode)
    },
}
</script>
<style lang="sass">
.url-item
    display: block
    width: 350px
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
</style>
