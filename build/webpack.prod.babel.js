import {CleanWebpackPlugin} from "clean-webpack-plugin"
import TerserWebpackPlugin from "terser-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin"
import merge from "webpack-merge"
import fibers from "fibers"

import {baseConfig, postcssLoader} from "./webpack.base.babel.js"

const prodConfig = {
    mode: "production",
    optimization: {
        minimizer: [
            new CleanWebpackPlugin(),
            new TerserWebpackPlugin({
                cache: true,
                parallel: true,
                sourceMap: false,
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.(css|s[ac]ss)$/g,
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: "css-loader", options: {importLoaders: 1, sourceMap: true}},
                    postcssLoader,
                ],
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: "css-loader", options: {importLoaders: 2, sourceMap: true}},
                    postcssLoader,
                    {loader: "sass-loader", options: {sourceMap: true, sassOptions: {indentedSyntax: true, fibers}}},

                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "style/[name].css",
        }),
    ],
}

export default merge(baseConfig, prodConfig)
