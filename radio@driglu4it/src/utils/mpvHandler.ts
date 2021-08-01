import { createMpvApi } from '../lib/api/mpvApi'
import { playbackStatusChanged, titleChanged, urlChanged, volumeChanged } from '../slices/mpvSlice'
import { getState, store, watchSelector, } from '../Store'
import { AdvancedPlaybackStatus } from '../types'


interface Arguments {
    onPlaybackstatusChanged: (playbackStatus: AdvancedPlaybackStatus) => void,
    /** length in seconds */
    onLengthChanged: (length: number) => void,
    /** position in seconds */
    onPositionChanged: (position: number) => void,
}


let mpvHandler: ReturnType<typeof createMpvApi>


function selectValidUrls() {
    return getState().settings.userStations.map(channel => channel.url)
}

function selectInitialVolume() {
    return getState().settings.initialVolume
}


// TODO export of create and use necessary? Wouldn't a getFunction be sufficient?

export function createMpvHandler(args: Arguments) {

    if (mpvHandler) {
        global.logWarning('createMpvHandler should be called only once')
        return
    }

    const {
        onPlaybackstatusChanged,
        onLengthChanged,
        onPositionChanged,
    } = args


    function handleVolumeChanged(volume: number) {
        store.dispatch(volumeChanged(volume))
    }

    function handlePlaybackstatusChanged(playbackStatus: AdvancedPlaybackStatus) {
        onPlaybackstatusChanged(playbackStatus)
        store.dispatch(playbackStatusChanged(playbackStatus))
    }

    function handleUrlChanged(url: string) {
        store.dispatch(urlChanged(url))
    }

    function handleTitleChanged(title: string) {
        store.dispatch(titleChanged(title))
    }

    mpvHandler = createMpvApi({
        onPlaybackstatusChanged: handlePlaybackstatusChanged,
        onUrlChanged: handleUrlChanged,
        onVolumeChanged: handleVolumeChanged,
        onTitleChanged: handleTitleChanged,
        onLengthChanged,
        onPositionChanged,
        lastUrl: getState().settings.lastUrl,
        initialVolume: selectInitialVolume(),
        validUrls: selectValidUrls()
    })


    watchSelector(selectInitialVolume, (newValue) => mpvHandler.setInitialVolume(newValue))
    watchSelector(selectValidUrls, (newValue) => mpvHandler.setValidUrls(newValue))
}

export function useMpvHandler() {
    if (!mpvHandler)
        throw new Error('createMpvHandler must be called once before this function')

    return mpvHandler
}