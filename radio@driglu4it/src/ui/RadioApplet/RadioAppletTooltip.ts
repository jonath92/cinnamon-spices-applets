import { DEFAULT_TOOLTIP_TXT } from "../../consts"
import { mpvHandler } from "../../mpv/MpvHandler"

const { PanelItemTooltip } = imports.ui.tooltips

interface Arguments {
    appletContainer: imports.ui.applet.Applet
}

export function createRadioAppletTooltip(args: Arguments) {

    const {
        appletContainer,
    } = args

    const {
        getVolume,
        addVolumeChangeHandler
    } = mpvHandler

    function getTitle(): string {
        const volume = getVolume()
        if (!volume) return DEFAULT_TOOLTIP_TXT
        return `Volume: ${volume.toString()} %`
    }

    const tooltip = new PanelItemTooltip(appletContainer, getTitle(), __meta.orientation)

    addVolumeChangeHandler(() => {
        tooltip.set_text(getTitle())
    })
}