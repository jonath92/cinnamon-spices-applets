import { configs, initConfig } from './services/Config';
import { initMpvHandler } from './services/mpv/MpvHandler';
import { initPolyfills } from './polyfill';
import { createRadioAppletContainer } from './ui/RadioApplet/RadioAppletContainer';
const { Applet, AllowedLayout } = imports.ui.applet

const {} = imports.signals

declare global {
    // added during build (see webpack.config.js)
    interface Meta {
        instanceId: number
        orientation: imports.gi.St.Side
        panel: imports.ui.panel.Panel
        locationLabel: imports.ui.appletManager.LocationLabel
        monitor: imports.ui.layout.Monitor
    }
}


export function main() {

    // order must be retained!
    initPolyfills()
    initConfig()
    const mpvHandler = initMpvHandler()

    let appletReloaded = false;

    const appletContainer = createRadioAppletContainer()


    // const applet = new Applet(__meta.orientation, __meta.panel.height, __meta.instanceId)

    // // @ts-ignore
    // applet.actor = appletContainer.actor


    // applet.on_applet_reloaded = function () {
    //     appletReloaded = true
    // }


    // applet.on_applet_removed_from_panel = function () {
    //     mpvHandler.deactivateAllListener()
    //     mpvHandler.stop()
    //     // appletReloaded ? onMoved() : onRemoved()
    //     // appletReloaded = false
    // }


    return {
        actor: appletContainer.actor, 
        on_applet_reloaded: () => {},
        _onAppletRemovedFromPanel: () => {}, 
        // _panelLocation: null,
        on_applet_added_to_panel_internal: () => {}, 
        _addStyleClass: () => {}, 
        finalizeContextMenu: () => {},
        getAllowedLayout: () => AllowedLayout.BOTH

    }

}



