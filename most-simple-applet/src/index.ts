import * as _ from 'lodash';
import { runInContext } from 'lodash';
import { createApplet } from './ui/Applet/Applet';
const { Icon, Label, IconType } = imports.gi.St


const Applet = imports.ui.applet;

interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}

export function main(args: Arguments) {
    const {
        orientation,
        panelHeight,
        instanceId
    } = args

    const icon = new Icon({
        icon_name: 'computer',
        icon_type: IconType.FULLCOLOR
    })

    const label = new Label({
        text: 'hi'
    })

    const applet = createApplet({
        icon,
        instanceId,
        label,
        onAppletRemovedFromPanel: () => { },
        onClick: () => global.log('hi'),
        onMiddleClick: () => { },
        onRightClick: () => { },
        onScroll: () => { },
        orientation,
        panelHeight
    })

    // const applet = new MyApplet(orientation, panelHeight, instanceId)

    return applet

}


export class MyApplet extends Applet.IconApplet {
    constructor(orientation: any, panel_height: any, instance_id: any) {
        super(orientation, panel_height, instance_id)
        this.set_applet_icon_name("computer");
    }

    on_applet_clicked = function () {
        global.log(_.join(['Hello', 'webpack new'], ' '));

    }
}


