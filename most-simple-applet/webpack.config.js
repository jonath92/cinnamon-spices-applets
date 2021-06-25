const path = require('path')

module.exports = {
    mode: 'development',
    // devtool: 'none',
    entry: './src/applet.js',
    output: {
        filename: 'applet.js',
        path: path.resolve(__dirname, 'files/most-simple-applet/'),
    },
    resolve: {
        modules: [
            path.resolve('./src'),
            'node_modules'
        ]
    }
}