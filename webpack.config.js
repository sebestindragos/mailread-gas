const { join, resolve } = require("path");
const root = resolve(__dirname, "../../");
const GasPlugin = require("gas-webpack-plugin");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
const exec = require("child_process").exec;
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    app: "./src/main.ts",
  },
  output: {
    filename: "build.gs",
    path: join(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: ["node_modules"],
  },
  plugins: [
    new GasPlugin(),
    new CopyWebpackPlugin([
      { from: join(".clasp.json"), to: ".", ToType: "file" },
      { from: join("appsscript.json"), to: ".", ToType: "file" },
    ]),
  ],
};
