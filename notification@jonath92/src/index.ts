import { NoticiationApplet } from "./Applet";
import { createPopupMenu } from 'cinnamonpopup'
const { BoxLayout, Label, Table, Button, Bin, Icon, IconType, Align } = imports.gi.St
const { NOTIFICATION } = imports.gi.Atk.Role

const { WrapMode } = imports.gi.Pango

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

    const reminderApplet = new NoticiationApplet(orientation, panel_height, instance_id)

    return reminderApplet

}