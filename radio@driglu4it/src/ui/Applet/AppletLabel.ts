import { ChannelStore } from "ChannelStore"
import { createConfig } from "Config"
import { createMpvHandler } from "mpv/MpvHandler"

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
            getCurrentChannel
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

    // /**
    //  * 
    //  * @param newValue text to show on the label. The text however is only visible in the GUI when visible is true. It is also shown no text when passing null for text but in that case the text is shown again when calling this function again with a string (i.e this function is intended to be used with null when the text shall only temporarily be hidden)    
    //  * 
    //  */
    // function setText(newValue: string | null) {

    //     text = newValue

    //     if (!visible) return

    //     label.show()
    //     newValue ? label.text = ` ${newValue}` : label.hide()
    // }

    //initialChannelName && setText(initialChannelName)

    addChannelOnPanelChangeHandler((channelOnPanel) => label.visible = channelOnPanel)

    return label
}