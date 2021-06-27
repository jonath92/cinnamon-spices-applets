const path = require('path');

// TODO: use env variable to share between bash script and the config. Or bash script even necessary?
const cinnamonVersion = '4.6'

module.exports = {
    entry: './src/index.ts',
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
        path: path.resolve(__dirname, `files/most-simple-applet/${cinnamonVersion}/`),
        filename: 'radio-applet.js',
        library: "radioApplet",
    },
};