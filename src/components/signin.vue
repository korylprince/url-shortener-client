<template>
    <v-card width="100%" max-width="480px">
        <v-card-title primary-title>
            <div class="headline">Sign In</div>
        </v-card-title>

        <validation-observer ref="form" v-slot="{invalid}">
            <form novalidate @submit.prevent="do_authenticate(username, password)">
                <v-card-text>
                    <validation-provider name="username" rules="required" v-slot="{errors}">
                        <v-text-field
                            label="Username"
                            v-model="username"
                            :error-messages="errors"
                            required>
                        </v-text-field>
                    </validation-provider>

                    <validation-provider name="password" rules="required" v-slot="{errors}">
                        <v-text-field
                            :type="show_password ? 'text' : 'password'"
                            :append-icon="show_password ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="show_password = !show_password"
                            label="Password"
                            v-model="password"
                            :error-messages="errors"
                            required>
                        </v-text-field>
                    </validation-provider>

                    <span class="error--text" v-if="error">{{error}}</span>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn type="submit"
                           color="primary"
                           text
                           :loading="_loading"
                           :disabled="invalid || username === '' || password === ''">
                           Sign In</v-btn>
                </v-card-actions>
            </form>
        </validation-observer>

    </v-card>
</template>

<script>
import {mapState, mapGetters, mapActions} from "vuex"
import api from "../js/api.js"
import store from "../js/store.js"
export default {
    name: "app-signin",
    data() {
        return {
            username: "",
            password: "",
            show_password: false,
        }
    },
    computed: {
        ...mapState({"error": "last_error"}),
        ...mapGetters(["is_loading"]),
        _loading() {
            return this.is_loading([api.authenticate])
        },
    },
    methods: {
        ...mapActions(["authenticate"]),
        async do_authenticate(username, password) {
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            this.authenticate({username, password})
        },
    },
    beforeRouteEnter(to, from, next) {
        if (store.getters.signed_in) {
            next({name: "dashboard"})
            return
        }
        next()
    },
}
</script>
