<template>
    <v-app>
        <v-content>
            <v-container fluid>
                <v-row justify="center" align="center" align-content="center" style="text-align: center">
                    <v-col align-self="center" cols="4">
                        <v-icon :size="200">mdi-help-circle</v-icon>
                        <div class="display-1">{{code}}</div>
                        <div class="body-1">{{text}}</div>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
export default {
    name: "not-found",
    computed: {
        code() {
            return (new URL(window.location.href)).searchParams.get("statusCode")
        },
        text() {
            return (new URL(window.location.href)).searchParams.get("statusText")
        },
    },
}
</script>
