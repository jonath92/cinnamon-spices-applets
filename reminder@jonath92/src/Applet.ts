const { IconApplet } = imports.ui.applet

export class CalendarApplet extends IconApplet {

    constructor(orientation: imports.gi.St.Side, panel_height: number, instance_id: number) {
        super(orientation, panel_height, instance_id)
        this.set_applet_icon_name("view-calendar");
    }
}
