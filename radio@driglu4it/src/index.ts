import { configs, initConfig } from './services/Config';
import { initMpvHandler } from './services/mpv/MpvHandler';
import { initPolyfills } from './polyfill';
import { createRadioAppletContainer } from './ui/RadioApplet/RadioAppletContainer';
import { createRadioAppletIcon } from './ui/RadioApplet/RadioAppletIcon';
import { createRadioAppletContainerNew } from './ui/RadioApplet/RadioAppletContainerNew';
import { createRadioPopupMenu } from './ui/RadioPopupMenu/RadioPopupMenu';
const { Applet, AllowedLayout } = imports.ui.applet
const { GenericContainer } = imports.gi.Cinnamon
const { BoxLayout } = imports.gi.St

const { } = imports.signals

declare global {
    // added during build (see webpack.config.js)
    interface Meta {
        instanceId: number
        orientation: imports.gi.St.Side // TODO: needed??
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

    const appletContainer = createRadioAppletContainerNew({
        onClick: () => popupMenu.toggle(),
        onMiddleClick: () => global.log('onMiddleClick'),
        onRightClick: () => global.log('onRigh Click'),
        onScroll: () => global.log('onScroll')
    })

    const dragActor = new GenericContainer({
        style_class: 'drag-item-container'
    })

    const popupMenu = createRadioPopupMenu({ launcher: appletContainer })


    appletContainer.add_child(createRadioAppletIcon())

    // const appletContainer = createRadioAppletContainer()


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
        actor: appletContainer,
        on_applet_reloaded: () => { },
        _onAppletRemovedFromPanel: () => { },
        // _panelLocation: null,
        on_applet_added_to_panel_internal: () => { },
        _addStyleClass: () => { },
        finalizeContextMenu: () => { },
        getAllowedLayout: () => AllowedLayout.BOTH

    }

}



