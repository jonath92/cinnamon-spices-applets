import { createSubMenu } from "../../lib/ui/PopupSubMenu";
import { createChannelMenuItem } from "./ChannelMenuItem";
import { AdvancedPlaybackStatus } from "../../types";
import { selectCurrentChannelName, store, watchSelector } from "../../Store";

interface Arguments {
    onChannelClicked: (name: string) => void
}

function selectActivatedChannelNames(): string[] {

    const channelItems = store.getState().settings.userStations

    return channelItems.flatMap(channel => {
        return channel.inc ? channel.name : []
    })
}

function selectPlaybackStatus(): AdvancedPlaybackStatus {
    return store.getState().mpv.playbackStatus
}


export function createChannelList(args: Arguments) {

    const {
        onChannelClicked
    } = args

    const subMenu = createSubMenu({ text: 'My Stations' })

    // the channelItems are saved here to the map and to the container as on the container only the reduced name are shown. Theoretically it therefore couldn't be differentiated between two long channel names with the same first 30 (or so) characters   
    const channelItems = new Map<string, ReturnType<typeof createChannelMenuItem>>()
    let currentChannelName: string
    let playbackStatus: AdvancedPlaybackStatus = 'Stopped'

    // Todo: why needed??
    setStationNames(selectActivatedChannelNames())

    watchSelector(selectActivatedChannelNames, (newStationNames) => {
        setStationNames(newStationNames)
    })

    watchSelector(selectPlaybackStatus, (newStatus) => {
        setPlaybackStatus(newStatus)
    })

    watchSelector(selectCurrentChannelName, (newName) => {
        setCurrentChannel(newName)
    })

    function setStationNames(names: string[]) {
        channelItems.clear()
        subMenu.box.remove_all_children()

        names.forEach(name => {
            const channelPlaybackstatus =
                (name === currentChannelName) ? playbackStatus : 'Stopped'

            const channelItem = createChannelMenuItem({
                channelName: name,
                onActivated: onChannelClicked,
                playbackStatus: channelPlaybackstatus
            })

            channelItems.set(name, channelItem)
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