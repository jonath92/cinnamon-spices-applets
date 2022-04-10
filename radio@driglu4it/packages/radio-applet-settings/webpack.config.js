const path = require('path');
const webpack = require('webpack');
const fs = require('fs')
const { exec } = require("child_process");


// TODO: this is redundant to radio-applet-main webpack.config
const CINNAMON_VERSION = "4.6"; 
const ROOT_PATH = path.resolve(__dirname, "../../");
const UUID = ROOT_PATH.split("/").slice(-1)[0];
const FILES_DIR = `${ROOT_PATH}/files/${UUID}`;
const BUILD_DIR = CINNAMON_VERSION
  ? `${FILES_DIR}/${CINNAMON_VERSION}`
  : FILES_DIR;

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    // devtool: "eval-source-map",
    target: 'node', // without webpack renames 'global'
    optimization: {
        minimize: false,
        usedExports: true,
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'radio-applet-settings.js',
        path: BUILD_DIR
        // library: LIBRARY_NAME,
    }
};
