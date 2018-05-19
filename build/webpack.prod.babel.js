import UglifyJsPlugin from "uglifyjs-webpack-plugin"
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin"
import merge from "webpack-merge"

import baseConfig from "./webpack.base.babel.js"

var prodConfig = {
    mode: "production",
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.(css|styl(us)?|s[ac]ss)$/g
            })
        ]
    }
}

export default merge(baseConfig, prodConfig)
