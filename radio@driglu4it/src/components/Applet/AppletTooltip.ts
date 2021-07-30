import { DEFAULT_TOOLTIP_TXT } from "../../consts"
import { store, watchStateProp } from "../../Store"

const { PanelItemTooltip } = imports.ui.tooltips

interface Arguments {
    applet: imports.ui.applet.Applet
    orientation: imports.gi.St.Side
}

export function createAppletTooltip(args: Arguments) {

    const {
        orientation,
        applet
    } = args

    const tooltip = new PanelItemTooltip(applet, null, orientation)

    setDefaultTooltip()

    watchStateProp(() => store.getState().mpv.volume, (newValue) => {
        setVolume(newValue)
    })

    function setVolume(volume: number) {
        if (volume == null) {
            global.logWarning('setVolume called with null or undefined')
            return
        }
        tooltip.set_text(`Volume: ${volume.toString()} %`)
    }

    function setDefaultTooltip() {
        tooltip.set_text(DEFAULT_TOOLTIP_TXT)
    }

    return {
        setDefaultTooltip
    }
}