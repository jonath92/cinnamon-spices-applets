import { configs } from "../../Config"
import { createAppletLabel } from "../../lib/AppletLabel"
import { mpvHandler } from "../../mpv/MpvHandler"

export function createRadioAppletLabel() {

    const {
        getCurrentChannelName: getCurrentChannel,
        addChannelChangeHandler
    } = mpvHandler

    const {
        settingsObject,
        addChannelOnPanelChangeHandler
    } = configs

    const label = createAppletLabel({
        visible: settingsObject.channelNameOnPanel,
        text: getCurrentChannel() || ''
    })

    addChannelOnPanelChangeHandler((channelOnPanel) => label.visible = channelOnPanel)
    addChannelChangeHandler((channel) => label.set_text(channel || ''))

    return label
}