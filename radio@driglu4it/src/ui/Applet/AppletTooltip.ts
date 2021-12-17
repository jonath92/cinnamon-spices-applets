import { DEFAULT_TOOLTIP_TXT, MPV_CVC_NAME } from "../../consts"
import { createMpvHandler } from "../../mpv/MpvHandler"

const { PanelItemTooltip } = imports.ui.tooltips

interface Arguments {
    appletContainer: imports.ui.applet.Applet
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createAppletTooltip(args: Arguments) {

    const {
        appletContainer, 
        mpvHandler: {
            getVolume, 
            addVolumeChangeHandler
        }
    } = args

    function getTitle(): string{
        const volume = getVolume()
        if (!volume) return DEFAULT_TOOLTIP_TXT
        return `Volume: ${volume.toString()} %`
    }

    const tooltip = new PanelItemTooltip(appletContainer, getTitle(), __meta.orientation)

    addVolumeChangeHandler(() => {
        tooltip.set_text(getTitle())
    })
}