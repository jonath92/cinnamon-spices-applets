import { DEFAULT_TOOLTIP_TXT } from "../../consts"

const { PanelItemTooltip } = imports.ui.tooltips

interface Arguments {
    applet: imports.ui.applet.Applet
    orientation: imports.gi.St.Side, 
    initialVolume: number | null
}

export function createAppletTooltip(args: Arguments) {

    const {
        orientation,
        applet, 
        initialVolume
    } = args

    // @ts-ignore
    const tooltip = new PanelItemTooltip(applet, null, orientation)

    function setVolume(volume: number) {
        tooltip.set_text(`Volume: ${volume.toString()} %`)
    }

    function setDefaultTooltip() {
        tooltip.set_text(DEFAULT_TOOLTIP_TXT)
    }

    initialVolume ? setVolume(initialVolume) : setDefaultTooltip()


    return {
        setVolume,
        setDefaultTooltip
    }
}