import { ReminderApplet } from "./Applet";
import { getSoonEvents } from "./Office365Events";


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

    const reminderApplet = new ReminderApplet(orientation, panel_height, instance_id)

    reminderApplet.on_applet_clicked = () => getSoonEvents()


    return reminderApplet

}