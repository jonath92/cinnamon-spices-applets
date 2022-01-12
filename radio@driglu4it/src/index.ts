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
const Lang = imports.Lang
const Tweener = imports.ui.tweener;

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


function makeDraggable(actor: imports.gi.St.BoxLayout) {
    return new _Draggable(actor)
}

class _Draggable {

    public inhibit: boolean
    public actor: imports.gi.St.BoxLayout
    public target: null
    public buttonPressEventId: number
    public destroyEventId: number

    constructor(actor: imports.gi.St.BoxLayout) {

        const params = {
            manualMode: false,
            restoreOnSuccess: false,
            overrideX: undefined,
            overrideY: undefined,
            dragActorMaxSize: undefined,
            dragActorOpacity: undefined
        }

        this.inhibit = false // Use the inhibit flag to temporarily disable an object from being draggable

        this.actor = actor

        this.target = null
        this.buttonPressEventId = this.actor.connect('button-press-event', (actor, event) => this._onButtonPress(actor, event))
        this.destroyEventId = 0;

    }

    _onButtonPress(actor: imports.gi.St.BoxLayout, event: imports.gi.Clutter.ButtonEvent
    ) {
        if (this.inhibit)
            return false;

        if (event.get_button() != 1)
            return false;

        if (Tweener.getTweenCount(actor))



        return false
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



