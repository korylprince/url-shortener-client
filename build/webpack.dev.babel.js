import merge from "webpack-merge"

import baseConfig from "./webpack.base.babel.js"

var devConfig = {
    mode: "development",
    stats: {children: false},
    devServer: {
        stats: "minimal"
    },
    devtool: "#cheap-module-inline-source-map"
}

export default merge(baseConfig, devConfig)
