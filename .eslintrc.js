module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: [
        "plugin:vue-libs/recommended",
        "plugin:promise/recommended"
    ],
    parserOptions: {
        sourceType: "module"
    },
    rules: {
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "double"],
        "semi": ["error", "never"],
        "no-console": ["error", {allow: ["error"]}],
        "camelcase": 0,
        "space-before-function-paren": ["error", "never"],
        "object-curly-spacing": ["error", "never"],
        "arrow-parens": ["error", "as-needed"],
        "arrow-body-style": ["error", "always"],
        "promise/always-return": "off",
        "promise/no-return-wrap": ["error", {allowReject: true}]
    },
    plugins: [
        "html",
        "promise"
    ]
}
