const { webpackNumbers } = require('./webpack-numbers');

function main(metadata, orientation, panel_height, instance_id) {
    return new webpackNumbers.MyApplet(orientation, panel_height, instance_id);
}

