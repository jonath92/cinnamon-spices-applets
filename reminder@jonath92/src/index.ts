const Applet = imports.ui.applet;
const Main = imports.ui.main;


class MyApplet extends Applet.IconApplet {
    constructor(orientation: imports.gi.St.Side, panel_height: number, instance_id: number) {
        super(orientation, panel_height, instance_id)
        this.set_applet_icon_name("computer");
    }

    on_applet_clicked() {
        global.log('applet clicked')
    }
}

interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}


export function main(args: Arguments) {

    const {
        orientation,
        panelHeight: panel_height,
        instanceId: instance_id
    } = args

    return new MyApplet(orientation, panel_height, instance_id)
}