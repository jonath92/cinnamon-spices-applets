import * as _ from 'lodash';
import { runInContext } from 'lodash';
import { createAppletIcon } from './ui/Applet/AppletIcon';
import { createApplet } from './ui/Applet/Applet';


const { Icon, Label, IconType } = imports.gi.St
const { getAppletDefinition } = imports.ui.appletManager;
const { panelManager } = imports.ui.main


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

    const appletDefinition = getAppletDefinition({
        applet_id: instanceId,
    })

    const panel = panelManager.panels.find(panel =>
        panel?.panelId === appletDefinition.panelId
    )

    const appletIcon = createAppletIcon({
        locationLabel: appletDefinition.location_label,
        panel
    })

    panel.connect('icon-size-changed', () => appletIcon.updateIconSize())


    const icon = new Icon({
        icon_name: 'computer',
        icon_type: IconType.FULLCOLOR
    })

    const label = new Label({
        text: 'hi'
    })

    const applet = createApplet({
        icon: appletIcon.actor,
        instanceId,
        label,
        onAppletMoved: () => { },
        onAppletRemoved: () => { },
        onClick: () => global.log(_.join(['Hello', 'webpack'], ' ')),
        onMiddleClick: () => { },
        onRightClick: () => { },
        onScroll: () => { },
        orientation,
        panelHeight
    })

    return applet

}


