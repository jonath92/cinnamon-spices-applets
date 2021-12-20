import { configs } from "../../Config"
import { createAppletLabel } from "../../lib/AppletLabel"
import { mpvHandler } from "../../mpv/MpvHandler"

export function createRadioAppletLabel() {

    const {
        getCurrentChannelName: getCurrentChannel,
        addChannelChangeHandler,
        addPlaybackStatusChangeHandler
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
    addChannelChangeHandler((channel) => label.set_text(channel))
    addPlaybackStatusChangeHandler((newStatus) => {
        if (newStatus === 'Stopped')
            label.set_text('')
    })

    return label
}