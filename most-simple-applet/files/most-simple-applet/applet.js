const Applet = imports.ui.applet;
const Main = imports.ui.main;

function MyApplet(orientation, panel_height, instance_id) {
    this._init(orientation, panel_height, instance_id);
}

class MyApplet extends Applet.IconApplet {
    constructor(orientation, panel_height, instance_id) {
        this.set_applet_icon_name("computer");
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new MyApplet(orientation, panel_height, instance_id);
}
