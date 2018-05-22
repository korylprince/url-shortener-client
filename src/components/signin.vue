<template>
    <form novalidate @submit.prevent="authenticate(username, password)">
        <md-card>
            <md-card-header>
                <div class="md-title">Sign In</div>
            </md-card-header>

            <md-card-content>

                <md-field :class="{'md-invalid': errors.has('username')}">
                    <label>Username</label>
                    <md-input v-model="username" name="username" v-validate="'required'"></md-input>
                    <span class="md-error">{{errors.first('username')}}</span>
                </md-field>

                <md-field :class="{'md-invalid': errors.has('password')}">
                    <label>Password</label>
                    <md-input type="password" v-model="password" name="password" v-validate="'required'"></md-input>
                    <span class="md-error">{{errors.first('password')}}</span>
                </md-field>

                <span class="md-error" v-if="error">{{error}}</span>

            </md-card-content>

            <md-card-actions>
                <md-button type="submit" class="md-primary" :disabled="is_loading">
                    <span v-show="!is_loading">Sign In</span>
                    <md-progress-spinner
                        class="app-spinner"
                        v-if="is_loading"
                        md-mode="indeterminate"
                        :md-diameter="20"
                        :md-stroke="2"
                        ></md-progress-spinner>
                </md-button>

            </md-card-actions>
        </md-card>
    </form>
</template>

<script>
import {mapState, mapGetters} from "vuex"
import store from "../js/store.js"
export default {
    name: "app-signin",
    computed: {
        ...mapState({"error": "last_error"}),
        ...mapGetters(["is_loading"])
    },
    data() {
        return {
            username: null,
            password: null
        }
    },
    methods: {
        authenticate(username, password) {
            if (this.is_loading) { return }

            this.$validator.validateAll().catch(() => {
                this.$store.commit("UPDATE_ERROR", "Form validation error")
            }).then(valid => {
                if (valid) {
                    return this.$store.dispatch("authenticate", {username, password})
                }
                return Promise.reject()
            }).then(() => {
                var next = this.$store.getters.next_route
                if (next == null) {
                    next = {name: "dashboard"}
                }
                this.$router.push(next)
                this.$store.commit("UPDATE_NEXT_ROUTE", null)
            }).catch(() => {
                // ignore errors
            })
        }
    },
    beforeRouteEnter(to, from, next) {
        if (store.getters.signed_in) {
            next({name: "dashboard"})
            return
        }
        next()
    }
}
</script>
