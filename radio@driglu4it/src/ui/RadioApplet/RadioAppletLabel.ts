import { configs } from "../../Config"
import { createAppletLabel } from "../../lib/AppletLabel"
import { createMpvHandler } from "../../mpv/MpvHandler"

interface Props {
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createRadioAppletLabel(props: Props) {

    const {
        mpvHandler: {
            getCurrentChannelName: getCurrentChannel,
            addChannelChangeHandler
        }
    } = props

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