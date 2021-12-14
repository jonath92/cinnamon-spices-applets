import { createSubMenu } from "../../lib/PopupSubMenu";
import { createChannelMenuItem } from "./ChannelMenuItem";
import { AdvancedPlaybackStatus } from "../../types";
import { createMpvHandler } from "../../mpv/MpvHandler";
import { createConfig } from "../../Config";

// HIER WEITERMACHEN

interface Arguments {
    stationNames: string[],
    onChannelClicked: (name: string) => void, 
    initialChannelName?: string | undefined, 
    initialPlaybackStatus?: AdvancedPlaybackStatus
    mpvHandler: ReturnType<typeof createMpvHandler>, 
    configs: ReturnType<typeof createConfig>
}

export function createChannelList(args: Arguments) {

    const {
        stationNames,
        initialChannelName, 
        initialPlaybackStatus, 
        onChannelClicked, 
        mpvHandler: {
            getPlaybackStatus, 
            getCurrentChannel
        }
    } = args

    const subMenu = createSubMenu({ text: 'My Stations' })

    let currentChannelName: string | null
    let playbackStatus: AdvancedPlaybackStatus = 'Stopped'

    // the channelItems are saved here to the map and to the container as on the container only the reduced name are shown. Theoretically it therefore couldn't be differentiated between two long channel names with the same first 30 (or so) characters   
    const channelItems = new Map<string, ReturnType<typeof createChannelMenuItem>>()

    function setStationNames(names: string[]) {
        channelItems.clear()
        subMenu.box.remove_all_children()

        names.forEach(name => {
            const channelPlaybackstatus =
                (name === getCurrentChannel()) ? getPlaybackStatus() : 'Stopped'

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

        if(currentChannelName){
            const currentChannelItem = channelItems.get(currentChannelName)
            currentChannelItem?.setPlaybackStatus('Stopped')
        }

        if (name) {
            const newChannelItem = channelItems.get(name)
            if (!newChannelItem) throw new Error(`No channelItem exist for ${name}`)
            newChannelItem.setPlaybackStatus(playbackStatus)
        }

        currentChannelName = name
    }

    setStationNames(stationNames)
    initialChannelName && setCurrentChannel(initialChannelName)
    initialPlaybackStatus && setPlaybackStatus(initialPlaybackStatus)

    return {
        actor: subMenu.actor,
        setPlaybackStatus,
        setStationNames,
        setCurrentChannel
    }
}