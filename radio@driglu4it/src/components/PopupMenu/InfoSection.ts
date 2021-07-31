import * as consts from "../../consts";
import { createIconMenuItem } from "../../lib/ui/IconMenuItem";
import { getState, selectCurrentChannelName, watchSelector } from "../../Store";
const { BoxLayout } = imports.gi.St

export function createInfoSection() {

    const channelInfoItem = createInfoItem(consts.RADIO_SYMBOLIC_ICON_NAME)
    const songInfoItem = createInfoItem(consts.SONG_INFO_ICON_NAME)

    const infoSection = new BoxLayout({
        vertical: true
    });

    [channelInfoItem, songInfoItem].forEach(infoItem => {
        infoSection.add_child(infoItem.actor)
    })

    function createInfoItem(iconName: string) {
        const iconMenuItem = createIconMenuItem({
            iconName,
            maxCharNumber: consts.MAX_STRING_LENGTH,
        })

        return iconMenuItem
    }

    watchSelector(selectCurrentChannelName, (newName) => {
        channelInfoItem.setText(newName)
    })


    function setSongTitle(songTitle: string) {
        songInfoItem.setText(songTitle)
    }

    return {
        actor: infoSection,
        setSongTitle,
    }

}