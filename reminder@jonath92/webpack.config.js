
const path = require('path');
const webpack = require('webpack');
const fs = require('fs')

const cinnamonVersion = '4.6'
const appletFullName = __dirname.split('/').slice(-1)[0]
const appletShortName = appletFullName.split('@')[0]

console.log(appletShortName)

// could both also be any other name
const bundledFileName = `${appletShortName}-applet.js`
const libraryName = `${appletShortName}Applet`

// TODO: write the content of applet.js to file

const buildPath = path.resolve(__dirname, `files/${appletFullName}/${cinnamonVersion}`)


fs.mkdirSync(buildPath, { recursive: true })

const appletJsPath = buildPath + '/applet.js'
console.log(buildPath)


fs.writeFileSync(appletJsPath, 'jo')


/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    devtool: "eval-source-map",
    target: 'node', // without webpack renames 'global'
    module: {
        rules: [
            {
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: buildPath,
        filename: bundledFileName,
        library: libraryName,
    },
};