const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production";

    return {
        entry: "./src/core/engine.js",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "core/[name].[contenthash].js",
            chunkFilename: "chunks/[name].[contenthash].js",
            clean: true,
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: isProduction,
                        },
                    },
                }),
                new CssMinimizerPlugin(),
            ],
            splitChunks: {
                chunks: "all",
                maxInitialRequests: Infinity,
                minSize: 0,
                cacheGroups: {
                    coreDeps: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "core-deps",
                        priority: 10,
                    },
                    visual: {
                        test: /[\\/]src[\\/]visual[\\/]/,
                        name: "visual",
                        priority: 5,
                    },
                    areas: {
                        test: /[\\/]src[\\/]world[\\/]areas[\\/]/,
                        name: (module) => {
                            const match = module.context.match(
                                /[\\/]areas[\\/]([\w-]+)/
                            );
                            return match ? `area-${match[1]}` : "areas";
                        },
                        priority: 5,
                    },
                },
            },
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        isProduction
                            ? MiniCssExtractPlugin.loader
                            : "style-loader",
                        "css-loader",
                    ],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset",
                    parser: {
                        dataUrlCondition: {
                            maxSize: 8 * 1024, // 8kb
                        },
                    },
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: "asset/resource",
                },
                {
                    test: /\.json$/i,
                    type: "asset/resource",
                    generator: {
                        filename: "assets/[hash][ext][query]",
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                minify: isProduction,
            }),
            isProduction &&
                new MiniCssExtractPlugin({
                    filename: "styles/[name].[contenthash].css",
                    chunkFilename: "styles/[id].[contenthash].css",
                }),
        ].filter(Boolean),
        devServer: {
            contentBase: path.join(__dirname, "dist"),
            compress: true,
            port: 9000,
            hot: true,
        },
    };
};
