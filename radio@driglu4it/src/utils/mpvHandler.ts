import { createMpvApi } from '../lib/api/Mpv'
import { playbackStatusChanged, urlChanged, volumeChanged } from '../slices/mpvSlice'
import { getState, store, watchSelector } from '../Store'
import { AdvancedPlaybackStatus } from '../types'


interface Arguments {
    onPlaybackstatusChanged: (playbackStatus: AdvancedPlaybackStatus) => void,
    onUrlChanged: (url: string) => void,
    onTitleChanged: (title: string) => void,
    /** length in seconds */
    onLengthChanged: (length: number) => void,
    /** position in seconds */
    onPositionChanged: (position: number) => void,
    checkUrlValid: (url: string) => boolean,
    /** the lastUrl is used to determine if mpv is initially (i.e. on cinnamon restart) running for radio purposes and not for something else. It is not sufficient to get the url from a dbus interface and check if the url is valid because some streams (such as .pls streams) change their url dynamically. This approach in not 100% foolproof but probably the best possible approach */
    lastUrl: string,

    // TODO make as setter
    getInitialVolume: { (): number }
}



export function createMpvHandler(args: Arguments) {

    const {
        onPlaybackstatusChanged,
        onUrlChanged,
        onTitleChanged,
        onLengthChanged,
        onPositionChanged,
        checkUrlValid,
        lastUrl,
        getInitialVolume,
    } = args


    function handleVolumeChanged(volume: number) {
        store.dispatch(volumeChanged(volume))
    }

    function handlePlaybackstatusChanged(playbackStatus: AdvancedPlaybackStatus) {
        onPlaybackstatusChanged(playbackStatus)
        store.dispatch(playbackStatusChanged(playbackStatus))
    }

    function handleUrlChanged(url: string) {
        onUrlChanged(url)
        store.dispatch(urlChanged(url))
    }

    const mpvHandler = createMpvApi({
        onPlaybackstatusChanged: handlePlaybackstatusChanged,
        onUrlChanged: handleUrlChanged,
        onVolumeChanged: handleVolumeChanged,
        onTitleChanged,
        onLengthChanged,
        onPositionChanged,
        checkUrlValid,
        lastUrl,
        getInitialVolume,
    })

    watchSelector(() => getState().mpv.url, (newValue) => {
        global.log('setUrl called')
        mpvHandler.setUrl(newValue)
    })

    return mpvHandler

}