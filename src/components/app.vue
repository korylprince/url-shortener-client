<template>
    <v-app>
        <v-app-bar color="primary" dark dense app>
            <v-toolbar-title>{{title}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-tooltip bottom v-if="display_name">
                <template v-slot:activator="{on}">
                    <span v-on="on">{{display_name}}</span>
                </template>
                <span>{{username}}</span>
            </v-tooltip>

           <v-menu offset-y v-show="signed_in">
                <template v-slot:activator="{on}">
                    <v-btn icon v-on="on" v-show="signed_in"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                </template>
                <v-list>
                    <v-list-item @click="signout">
                        <v-list-item-title>Sign Out</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-content style="background-color: #fafafa">
            <v-container fluid :pa-0="$vuetify.breakpoint.xsOnly">
                <v-layout justify-center>
                    <router-view></router-view>
                </v-layout>
            </v-container>
        </v-content>

        <v-dialog :value="show_dialog" persistent max-width="480" :fullscreen="$vuetify.breakpoint.xsOnly">
            <v-card>
                <v-card-title class="headline">Error</v-card-title>
                <v-card-text>{{error}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="UPDATE_ERROR(null)">OK</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar :value="current_feedback != null" @input="clear_feedback">
            {{ current_feedback }}
            <v-btn color="secondary"
                text
                @click="clear_feedback">
                Close
            </v-btn>
        </v-snackbar>
    </v-app>
</template>

<script>
import {mapState, mapMutations, mapGetters, mapActions} from "vuex"
import api from "../js/api.js"
export default {
    name: "app-main",
    computed: {
        ...mapState(["username", "display_name", "title"]),
        ...mapState({"error": "last_error"}),
        ...mapGetters(["signed_in", "current_feedback"]),
        ...mapGetters({"show_dialog_state": "show_dialog"}),
        show_dialog() {
            return this.$route.name !== "signin" && this.show_dialog_state
        },
    },
    methods: {
        ...mapMutations(["UPDATE_TITLE", "UPDATE_ERROR"]),
        ...mapActions(["clear_feedback", "signout", "api_action"]),
    },
    async created() {
        try {
            const title = (await this.api_action({action: api.get_title, params: []})).app_title
            this.UPDATE_TITLE(title)
        } catch (err) {
            console.error("Unable to update title:", err)
        }
    },
}
</script>

<style lang="sass" scoped>
.toolbar-title
    color: inherit
    cursor: pointer
    text-decoration: none

    &:hover
        font-weight: bold
</style>
