import path from "path"
import webpack from "webpack"
import VueLoaderPlugin from "vue-loader/lib/plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import HtmlWebpackPlugin from "html-webpack-plugin"
import FaviconsWebpackPlugin from "favicons-webpack-plugin"

var root = path.resolve(__dirname, "../")

var API_BASE = process.env.API_BASE ? process.env.API_BASE : "/api/1.1"

export default {
    entry: {
        app: path.resolve(root, "src/app.js"),
        "not-found": path.resolve(root, "src/not-found.js")
    },
    output: {
        path: path.resolve(root, "dist/"),
        filename: "js/[name].js"
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: "css-loader", options: {importLoaders: 1, sourceMap: true}},
                    {loader: "postcss-loader", options: {sourceMap: true}}
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: "css-loader", options: {importLoaders: 2, sourceMap: true}},
                    {loader: "postcss-loader", options: {sourceMap: true}},
                    {loader: "sass-loader", options: {sourceMap: true}}
                ]
            },
            {
                test: /\.styl(us)?$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: "css-loader", options: {importLoaders: 2, sourceMap: true}},
                    {loader: "postcss-loader", options: {sourceMap: true}},
                    {loader: "stylus-loader", options: {sourceMap: true}}
                ]
            }
        ]
    },
    resolve: {
        alias: {
            "vue$": path.resolve(root, "node_modules", "vue/dist/vue.runtime.esm.js")
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            API_BASE: JSON.stringify(API_BASE)
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: "style/[name].css"
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(root, "src/index.html"),
            chunks: ["app"],
            filename: "index.html"
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(root, "src/index.html"),
            chunks: ["not-found"],
            filename: "404.html"
        }),
        new FaviconsWebpackPlugin({
            logo: path.resolve(root, "src/img/favicon.png"),
            prefix: "icons/",
            icons: {
                android: true,
                appleIcon: true,
                appleStartup: false,
                coast: false,
                favicons: true,
                firefox: false,
                opengraph: false,
                twitter: false,
                yandex: false,
                windows: false
            }
        })
    ]
}
