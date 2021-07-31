import { createMpvApi } from '../lib/api/Mpv'
import { playbackStatusChanged, titleChanged, urlChanged, volumeChanged } from '../slices/mpvSlice'
import { getState, store, watchSelector } from '../Store'
import { AdvancedPlaybackStatus } from '../types'


interface Arguments {
    onPlaybackstatusChanged: (playbackStatus: AdvancedPlaybackStatus) => void,
    /** length in seconds */
    onLengthChanged: (length: number) => void,
    /** position in seconds */
    onPositionChanged: (position: number) => void,
    checkUrlValid: (url: string) => boolean,
    /** the lastUrl is used to determine if mpv is initially (i.e. on cinnamon restart) running for radio purposes and not for something else. It is not sufficient to get the url from a dbus interface and check if the url is valid because some streams (such as .pls streams) change their url dynamically. This approach in not 100% foolproof but probably the best possible approach */
    lastUrl: string,
}



export function createMpvHandler(args: Arguments) {

    const {
        onPlaybackstatusChanged,
        onLengthChanged,
        onPositionChanged,
        checkUrlValid,
        lastUrl,
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

    const mpvHandler = createMpvApi({
        onPlaybackstatusChanged: handlePlaybackstatusChanged,
        onUrlChanged: handleUrlChanged,
        onVolumeChanged: handleVolumeChanged,
        onTitleChanged: handleTitleChanged,
        onLengthChanged,
        onPositionChanged,
        checkUrlValid,
        lastUrl,
        initialVolume: getState().settings.initialVolume
    })

    watchSelector(() => getState().mpv.url, (newValue) => {
        mpvHandler.setUrl(newValue)
    })

    watchSelector(() => getState().settings.initialVolume, (newValue) => {
        mpvHandler.setInitialVolume(newValue)
    })

    watchSelector(() => getState().mpv.playbackStatus, (newValue) => {
        if (newValue === 'Stopped') {
            //mpvHandler.setInitialVolume(getState().mpv.volume)
            // mpvHandler.stop()
        }
    })

    return mpvHandler

}