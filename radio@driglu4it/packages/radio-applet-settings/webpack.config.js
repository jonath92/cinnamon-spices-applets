const path = require('path');
const webpack = require('webpack');
const fs = require('fs')
const { exec } = require("child_process");

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
        filename: 'index.js',
        // library: LIBRARY_NAME,
    }
};
