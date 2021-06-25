const Applet = imports.ui.applet;
const Main = imports.ui.main;
const { webpackNumbers } = require('./webpack-numbers');

class MyApplet extends Applet.IconApplet {
    constructor(orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id)
        this.set_applet_icon_name("computer");
    }

    on_applet_clicked = function () {
        global.log(webpackNumbers.wordToNum('Two'))

    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new MyApplet(orientation, panel_height, instance_id);
}
