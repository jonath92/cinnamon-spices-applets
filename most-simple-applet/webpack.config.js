const path = require('path')

module.exports = {
    mode: 'development',
    devtool: 'none',
    entry: './src/applet.js',
    output: {
        filename: 'hello.js',
        path: path.resolve(__dirname, 'files')
    }
}