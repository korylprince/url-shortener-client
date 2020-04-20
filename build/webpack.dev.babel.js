import webpack from "webpack"
import merge from "webpack-merge"
import fibers from "fibers"

import {baseConfig, postcssLoader} from "./webpack.base.babel.js"

const devConfig = {
    mode: "development",
    devServer: {
        hot: true,
        stats: "minimal",
        proxy: {
            "/api": {
                target: process.env.API_SERVER,
                secure: false,
                changeOrigin: true,
            },
        },
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {loader: "style-loader"},
                    {loader: "css-loader", options: {importLoaders: 1, sourceMap: true}},
                    postcssLoader,
                ],
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    {loader: "style-loader"},
                    {loader: "css-loader", options: {importLoaders: 2, sourceMap: true}},
                    postcssLoader,
                    {loader: "sass-loader", options: {sourceMap: true, sassOptions: {indentedSyntax: true, fibers}}},
                ],
            },
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
}

export default merge(baseConfig, devConfig)
