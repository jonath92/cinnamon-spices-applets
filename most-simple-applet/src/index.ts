import * as _ from 'lodash';
// import numRef from './ref.json';

// @ts-ignore
const Applet = imports.ui.applet;

export class MyApplet extends Applet.IconApplet {
    constructor(orientation: any, panel_height: any, instance_id: any) {
        super(orientation, panel_height, instance_id)
        // @ts-ignore
        this.set_applet_icon_name("computer");
    }

    on_applet_clicked = function () {
        // @ts-ignore
        global.log(_.join(['Hello', 'webpack new'], ' '));

    }
}


