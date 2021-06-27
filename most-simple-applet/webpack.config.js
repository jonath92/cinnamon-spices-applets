const path = require('path');

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
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
        path: path.resolve(__dirname, 'files/most-simple-applet/'),
        filename: 'radio-applet.js',
        library: "radioApplet",
    },
};