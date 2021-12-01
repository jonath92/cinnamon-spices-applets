import * as consts from "../consts";
import { createIconMenuItem } from "../lib/IconMenuItem";
const { BoxLayout } = imports.gi.St

interface Arguments {
    initialSongTitle?: string, 
    initialChannelName?: string
}

export function createInfoSection(args: Arguments) {

    const {initialChannelName, initialSongTitle} = args

    const channelInfoItem = createInfoItem(consts.RADIO_SYMBOLIC_ICON_NAME, initialChannelName)
    const songInfoItem = createInfoItem(consts.SONG_INFO_ICON_NAME, initialSongTitle)

    const infoSection = new BoxLayout({
        vertical: true
    });

    [channelInfoItem, songInfoItem].forEach(infoItem => {
        infoSection.add_child(infoItem.actor)
    })

    function createInfoItem(iconName: string, initialText?: string) {

        const iconMenuItem = createIconMenuItem({
            iconName,
            maxCharNumber: consts.MAX_STRING_LENGTH,
            initialText
        })

        return iconMenuItem
    }

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