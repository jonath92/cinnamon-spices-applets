import { createSubMenu } from "../../lib/ui/PopupSubMenu";
import { createChannelMenuItem } from "./ChannelMenuItem";
import { AdvancedPlaybackStatus, Channel } from "../../types";
import { selectCurrentChannelName, store, watchSelector } from "../../Store";
import { urlChanged } from "../../slices/mpvSlice";
import { useMpvHandler } from "../../utils/mpvHandler";

function selectChannels(): Channel[] {
    return store.getState().settings.userStations
}

function selectPlaybackStatus(): AdvancedPlaybackStatus {
    return store.getState().mpv.playbackStatus
}

export function createChannelList() {

    const subMenu = createSubMenu({ text: 'My Stations' })

    // the channelItems are saved here to the map and to the container as on the container only the reduced name are shown. Theoretically it therefore couldn't be differentiated between two long channel names with the same first 30 (or so) characters   
    const channelItems = new Map<string, ReturnType<typeof createChannelMenuItem>>()
    let currentChannelName: string
    let playbackStatus: AdvancedPlaybackStatus = 'Stopped'
    const mpvHandler = useMpvHandler()

    setChannels(selectChannels())

    watchSelector(selectChannels, (newChannels) => {
        setChannels(newChannels)
    })

    watchSelector(selectPlaybackStatus, (newStatus) => {
        setPlaybackStatus(newStatus)
    })

    watchSelector(selectCurrentChannelName, (newName) => {
        setCurrentChannel(newName)
    })

    function setChannels(channels: Channel[]) {
        channelItems.clear()
        subMenu.box.remove_all_children()

        channels.forEach(cnl => {

            if (!cnl.inc) return

            const channelPlaybackstatus =
                (cnl.name === currentChannelName) ? playbackStatus : 'Stopped'

            const channelItem = createChannelMenuItem({
                channelName: cnl.name,
                onActivated: () => mpvHandler.setUrl(cnl.url),
                playbackStatus: channelPlaybackstatus
            })

            channelItems.set(cnl.name, channelItem)
            subMenu.box.add_child(channelItem.actor)
        })
    }

    function setPlaybackStatus(newStatus: AdvancedPlaybackStatus) {
        playbackStatus = newStatus

        if (!currentChannelName) return

        const channelMenuItem = channelItems.get(currentChannelName)
        channelMenuItem?.setPlaybackStatus(playbackStatus)

        if (playbackStatus === 'Stopped')
            currentChannelName = null

    }

    function setCurrentChannel(name: string) {

        const currentChannelItem = channelItems.get(currentChannelName)
        currentChannelItem?.setPlaybackStatus('Stopped')

        if (name) {
            const newChannelItem = channelItems.get(name)
            if (!newChannelItem) throw new Error(`No channelItem exist for ${name}`)
            newChannelItem.setPlaybackStatus(playbackStatus)
        }

        currentChannelName = name
    }

    return {
        actor: subMenu.actor
    }
}