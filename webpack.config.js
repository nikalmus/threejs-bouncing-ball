const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "./public"),
    filename: "bundle.js",
  },
  plugins: [new HtmlWebpackPlugin({ title: "Bouncing Ball" })],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.(glb|gltf)$/,
        loader: "file-loader",
      },
    ],
  },
  performance: {
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000,
  },
  devServer: {
    publicPath: "/public/",
    compress: true,
    port: 9000,
    hot: true,
  },
};
