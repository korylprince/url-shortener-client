import Vue from "vue"
import {ValidationProvider, ValidationObserver, extend} from "vee-validate"
import {required} from "vee-validate/dist/rules"
import en from "vee-validate/dist/locale/en"
import isURL from "validator/lib/isURL"

extend("required", {...required, message: en.messages["required"]})
extend("code", code => {
    if (RegExp(/^[a-zA-Z0-9_\-.]+$/).test(code)) {
        return true
    }
    return "The {_field_} field format is invalid. Valid characters: a-z A-Z 0-9 _ - ."
})
extend("url", url => {
    if (isURL(url)) {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return true
        }
    }
    return "The {_field_} field must be a valid URL"
})
Vue.component("ValidationProvider", ValidationProvider)
Vue.component("ValidationObserver", ValidationObserver)
