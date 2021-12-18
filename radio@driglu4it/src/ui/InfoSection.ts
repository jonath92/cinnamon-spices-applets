import { RADIO_SYMBOLIC_ICON_NAME, MAX_STRING_LENGTH, SONG_INFO_ICON_NAME } from "../consts";
import { createIconMenuItem } from "../lib/IconMenuItem";
const { BoxLayout } = imports.gi.St

interface Arguments {
    initialSongTitle?: string | undefined,
    initialChannelName?: string | undefined
}

export function createInfoSection(args: Arguments) {

    const { initialChannelName, initialSongTitle } = args

    const channelInfoItem = createIconMenuItem({
        iconName: RADIO_SYMBOLIC_ICON_NAME,
        initialText: initialChannelName,
        maxCharNumber: MAX_STRING_LENGTH
    })

    const songInfoItem = createIconMenuItem({
        iconName: SONG_INFO_ICON_NAME,
        initialText: initialSongTitle,
        maxCharNumber: MAX_STRING_LENGTH
    })

    const infoSection = new BoxLayout({
        vertical: true
    });

    [channelInfoItem, songInfoItem].forEach(infoItem => {
        infoSection.add_child(infoItem.actor)
    })

    function setChannel(channeName: string) {
        channelInfoItem.setText(channeName)
    }

    function setSongTitle(songTitle: string) {
        songInfoItem.setText(songTitle)
    }

    return {
        actor: infoSection,
        setSongTitle,
        setChannel
    }

}