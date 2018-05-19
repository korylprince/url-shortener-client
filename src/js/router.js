import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

import AppSignin from "../components/signin.vue"
import AppDashboard from "../components/dashboard.vue"

const router = new VueRouter({
    routes: [
        {name: "signin", path: "/signin", component: AppSignin},
        {name: "dashboard", path: "/dashboard", component: AppDashboard},
        {name: "create", path: "/create", component: AppDashboard},
        {name: "edit", path: "/edit/:id", component: AppDashboard},
        {name: "delete", path: "/delete/:id", component: AppDashboard},
        {path: "*", redirect: {name: "dashboard"}}
    ]
})

export default router
