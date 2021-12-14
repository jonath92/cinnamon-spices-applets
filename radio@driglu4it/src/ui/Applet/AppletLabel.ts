import { createConfig } from "../../Config"
import { createMpvHandler } from "../../mpv/MpvHandler"


const { Label } = imports.gi.St
const { EllipsizeMode } = imports.gi.Pango
const { ActorAlign } = imports.gi.Clutter

interface Props {
    configs: ReturnType<typeof createConfig>, 
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createAppletLabel(props: Props) {

    const { 
        configs: {
            settingsObject, 
            addChannelOnPanelChangeHandler
        }, 
        mpvHandler: {
            getCurrentChannel, 
            addChannelChangeHandler
        }

    } = props


    const label = new Label({
        reactive: true,
        track_hover: true,
        style_class: 'applet-label',
        y_align: ActorAlign.CENTER,
        y_expand: false,
        visible: settingsObject.channelNameOnPanel,
        text: getCurrentChannel() || ''
    })

    // No idea why needed but without the label is not shown 
    label.clutter_text.ellipsize = EllipsizeMode.NONE

    addChannelOnPanelChangeHandler((channelOnPanel) => label.visible = channelOnPanel)
    addChannelChangeHandler((channel) => label.set_text(channel || ''))

    return label
}