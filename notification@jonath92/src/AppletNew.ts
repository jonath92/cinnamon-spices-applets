const { Applet, AllowedLayout, IconApplet } = imports.ui.applet


interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number,
}


export function createApplet(args: Arguments) {

    const {
        orientation,
        panelHeight,
        instanceId,
    } = args

    const applet = new IconApplet(orientation, panelHeight, instanceId)

    applet.set_applet_icon_symbolic_name('empty-notif')

    return applet

}