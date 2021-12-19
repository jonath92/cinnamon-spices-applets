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
        addVolumeChangeHandler,
        addPlaybackStatusChangeHandler
    } = mpvHandler

    const getVolumeText = (volume: number) => {
        return `Volume: ${volume.toString()} %`
    }

    const initialVolume = getVolume()
    const initialText = (initialVolume == null) ? 
        DEFAULT_TOOLTIP_TXT : getVolumeText(initialVolume)

    const tooltip = new PanelItemTooltip(appletContainer, initialText, __meta.orientation)

    addVolumeChangeHandler((newVolume) => {
        tooltip.set_text(getVolumeText(newVolume))
    })

    addPlaybackStatusChangeHandler((newStatus) => {
        if (newStatus === 'Stopped') tooltip.set_text(DEFAULT_TOOLTIP_TXT)
    })
}