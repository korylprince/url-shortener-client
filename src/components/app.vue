<template>
    <div id="root" class="page-container">
        <md-app>
            <md-app-toolbar class="md-primary md-dense">
                <router-link class="md-title" :to="dashboard_route">{{title}}</router-link>

                <span v-show="username">{{username}}</span>

                <div v-show="signed_in">
                    <md-menu md-direction="bottom-start">
                        <md-button class="md-icon-button" md-menu-trigger>
                            <md-icon>more_vert</md-icon>
                        </md-button>

                        <md-menu-content>
                            <md-menu-item @click="signout">Sign Out</md-menu-item>
                        </md-menu-content>
                    </md-menu>
                </div>
            </md-app-toolbar>

            <md-app-content id="content">
                <router-view></router-view>
                <md-button class="md-fab md-fab-bottom-right md-accent" @click="$router.push({name: 'create'})" v-show="signed_in">
                    <md-icon>add</md-icon>
                    <md-tooltip md-direction="top">Add URL</md-tooltip>
                </md-button>
            </md-app-content>

        </md-app>

        <md-dialog-alert
            id="dialog-alert"
            :md-active="show_dialog"
            @update:mdActive="$store.commit('UPDATE_ERROR', null)"
            md-title="Error"
            :md-content="error"
            :md-click-outside-to-close="false"
            ></md-dialog-alert>

        <md-snackbar
            :md-active="current_feedback != null"
            @update:mdActive="$store.dispatch('clear_feedback')"
            md-persistent
            >
            <span>{{current_feedback}}</span>
        </md-snackbar>
    </div>
</template>

<script>
import {mapState, mapGetters} from "vuex"
export default {
    name: "my-app",
    computed: {
        ...mapState(["username", "title"]),
        ...mapState({"error": "last_error"}),
        ...mapGetters(["signed_in", "current_feedback", "dashboard_route"]),
        ...mapGetters({"show_dialog_state": "show_dialog"}),
        show_dialog() {
            return this.$route.name !== "signin" && this.show_dialog_state
        }
    },
    methods: {
        signout() {
            return this.$store.dispatch("signout").then(() => {
                this.$router.push({name: "signin"})
            })
        }
    }
}
</script>

<style lang="stylus">
#root, &>.md-app
    min-height: 100vh

#dialog-alert
    z-index: 999

.md-toolbar .md-title
    flex: 1

    &:hover
        text-decoration: none
        font-weight: 500

#content
    background-color: #eee

    > div, form
        max-width: 600px
        margin-left: auto
        margin-right: auto
</style>
