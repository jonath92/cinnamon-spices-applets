import { ReminderApplet } from "./Applet";


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


    return new ReminderApplet(orientation, panel_height, instance_id)
}