const path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'files/most-simple-applet/'),
        filename: 'webpack-numbers.js',
        library: "webpackNumbers", // TODO: library needed?
    }
}