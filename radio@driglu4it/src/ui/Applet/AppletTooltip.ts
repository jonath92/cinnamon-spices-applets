import { DEFAULT_TOOLTIP_TXT } from "../../consts"
import { Store } from "redux"
import { Actions, State } from '../../types'

const { PanelItemTooltip } = imports.ui.tooltips

interface Arguments {
    applet: imports.ui.applet.Applet
    orientation: imports.gi.St.Side,
    store: Store<State, Actions>
}

export function createAppletTooltip(args: Arguments) {

    const {
        orientation,
        applet,
        store
    } = args

    const tooltip = new PanelItemTooltip(applet, null, orientation)

    setDefaultTooltip()

    store.subscribe(() => {
        const state = store.getState()
        setVolume(state.volume)
    })

    function setVolume(volume: number) {
        tooltip.set_text(`Volume: ${volume.toString()} %`)
    }

    function setDefaultTooltip() {
        tooltip.set_text(DEFAULT_TOOLTIP_TXT)
    }

    return {
        setDefaultTooltip
    }
}