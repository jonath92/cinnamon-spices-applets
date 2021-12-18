import { createConfig } from "../../Config"
import { createAppletLabel } from "../../lib/AppletLabel"
import { createMpvHandler } from "../../mpv/MpvHandler"

interface Props {
    configs: ReturnType<typeof createConfig>, 
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createRadioAppletLabel(props: Props) {

    const { 
        configs: {
            settingsObject, 
            addChannelOnPanelChangeHandler
        }, 
        mpvHandler: {
            getCurrentChannelName: getCurrentChannel, 
            addChannelChangeHandler
        }

    } = props

    const label = createAppletLabel({
        visible: settingsObject.channelNameOnPanel,
        text: getCurrentChannel() || ''
    })

    addChannelOnPanelChangeHandler((channelOnPanel) => label.visible = channelOnPanel)
    addChannelChangeHandler((channel) => label.set_text(channel || ''))

    return label
}