import { RADIO_SYMBOLIC_ICON_NAME, MAX_STRING_LENGTH, SONG_INFO_ICON_NAME } from "../consts";
import { createIconMenuItem } from "../lib/IconMenuItem";
import { createMpvHandler } from "../mpv/MpvHandler";
const { BoxLayout } = imports.gi.St

interface Arguments {
    initialSongTitle?: string | undefined,
    initialChannelName?: string | undefined,
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createInfoSection(args: Arguments) {

    const { 
        initialChannelName, 
        initialSongTitle, 
        mpvHandler: {
            getCurrentChannelName, 
            addChannelChangeHandler, 
            getCurrentTitle
        }
    } = args

    const channelInfoItem = createIconMenuItem({
        iconName: RADIO_SYMBOLIC_ICON_NAME,
        initialText: getCurrentChannelName(),
        maxCharNumber: MAX_STRING_LENGTH
    })

    const songInfoItem = createIconMenuItem({
        iconName: SONG_INFO_ICON_NAME,
        initialText: getCurrentTitle(),
        maxCharNumber: MAX_STRING_LENGTH
    })

    const infoSection = new BoxLayout({
        vertical: true
    });

    [channelInfoItem, songInfoItem].forEach(infoItem => {
        infoSection.add_child(infoItem.actor)
    })

    addChannelChangeHandler((newChannel) => {
        channelInfoItem.setText(newChannel || '')
    })

    return {
        actor: infoSection
    }

}