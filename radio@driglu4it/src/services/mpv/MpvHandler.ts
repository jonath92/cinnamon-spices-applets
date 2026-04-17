import { PlayPause, AdvancedPlaybackStatus, ChangeHandler } from '../../types'
import { MAX_VOLUME, MEDIA_PLAYER_2_NAME, MEDIA_PLAYER_2_PLAYER_NAME, MPV_MPRIS_BUS_NAME, MPV_CVC_NAME, MPV_IPC_SOCKET_PATH } from '../../consts'
import { MprisMediaPlayerDbus } from '../../types';
import { configs } from '../Config';
import { createMpvIpcClient, MpvIpcClient } from './MpvIpcClient';
import { createMprisService, MprisService, MprisMetadata } from './MprisService';

const { getDBus, getDBusProxyWithOwner } = imports.misc.interfaces
const { spawnCommandLine } = imports.misc.util;
const { MixerControl } = imports.gi.Cvc;
const GLib = imports.gi.GLib;

export type MpvHandler = ReturnType<typeof createMpvHandler>

export let mpvHandler: MpvHandler

export const initMpvHandler = () => {

    if (mpvHandler) {
        global.logWarning('mpvHandler already initiallized')
        return
    }

    mpvHandler = createMpvHandler()
}

function createMpvHandler() {

    const {
        settingsObject,
        getInitialVolume,
        addStationsListChangeHandler
    } = configs

    const lastUrl = settingsObject.lastUrl

    let lastVolume: number

    const dbus = getDBus()

    const control = new MixerControl({ name: __meta.name })
    let cvcStream: imports.gi.Cvc.MixerStream
    let isLoading: boolean = false

    let ipcClient: MpvIpcClient | null = null
    let mprisService: MprisService | null = null
    let ipcConnectTimerId: number = 0
    let mpvRunning = false
    let currentPlaybackStatus: PlayPause | 'Stopped' = 'Stopped'
    let currentVolumeFraction: number = 0.5
    let currentTitle: string | undefined
    let currentTrackId: string = '/org/mpris/MediaPlayer2/TrackList/NoTrack'

    const playbackStatusChangeHandler: ChangeHandler<AdvancedPlaybackStatus>[] = []
    const channelNameChangeHandler: ChangeHandler<string>[] = []
    const volumeChangeHandler: ChangeHandler<number>[] = []
    const titleChangeHandler: ChangeHandler<string>[] = []
    const lengthChangeHandler: ChangeHandler<number>[] = []
    const positionChangeHandler: ChangeHandler<number>[] = []

    control.open()
    control.connect('stream-added', (ctrl, id) => {

        const addedStream = control.lookup_stream_id(id)

        if (addedStream?.name !== MPV_CVC_NAME)
            return

        cvcStream = addedStream

        cvcStream.connect('notify::volume', () => {
            handleCvcVolumeChanged()
        })
    })

    let currentUrl: string | null = lastUrl

    let currentLength: number = 0
    let currentPosition: number = 0
    let positionTimerId: ReturnType<typeof setInterval> | null = null

    let bufferExceeded = false

    // On startup, try to connect to an already-running mpv instance
    if (lastUrl) {
        tryConnectIpc()
    }

    function tryConnectIpc(): void {
        if (ipcClient) return

        if (!GLib.file_test(MPV_IPC_SOCKET_PATH, GLib.FileTest.EXISTS)) {
            return
        }

        try {
            ipcClient = createMpvIpcClient(MPV_IPC_SOCKET_PATH)
        } catch {
            return
        }

        mpvRunning = true

        // Start the MPRIS D-Bus service
        mprisService = createMprisService({
            onPlay() { ipcClient?.setProperty('pause', false) },
            onPause() { ipcClient?.setProperty('pause', true) },
            onPlayPause() {
                ipcClient?.getProperty<boolean>('pause').then(paused => {
                    ipcClient?.setProperty('pause', !paused)
                })
            },
            onStop() { ipcClient?.sendCommand(['stop']) },
            onNext() { /* single-track radio – no-op */ },
            onPrevious() { /* single-track radio – no-op */ },
            onSeek(offset) {
                ipcClient?.sendCommand(['seek', offset / 1_000_000, 'relative'])
            },
            onSetPosition(_trackId, position) {
                ipcClient?.sendCommand(['seek', position / 1_000_000, 'absolute'])
            },
            onOpenUri(uri) {
                ipcClient?.sendCommand(['loadfile', uri, 'replace'])
            },
            onQuit() { ipcClient?.sendCommand(['quit']) },
            onSetVolume(fraction) {
                ipcClient?.setProperty('volume', fraction * 100)
            },
            onSetLoopStatus(status) {
                const loopFile = status === 'Track' ? 'inf' : 'no'
                ipcClient?.setProperty('loop-file', loopFile)
            },
        })

        // Observe mpv properties via IPC
        ipcClient.observeProperty(1, 'pause')
        ipcClient.observeProperty(2, 'media-title')
        ipcClient.observeProperty(3, 'volume')
        ipcClient.observeProperty(4, 'duration')
        ipcClient.observeProperty(5, 'time-pos')
        ipcClient.observeProperty(6, 'path')
        ipcClient.observeProperty(7, 'metadata')

        let trackCounter = 0

        ipcClient.onPropertyChange((name, data) => {
            if (name === 'pause') {
                const newStatus: PlayPause = data ? 'Paused' : 'Playing'
                if (newStatus !== currentPlaybackStatus) {
                    currentPlaybackStatus = newStatus
                    mprisService?.updateState({ playbackStatus: newStatus })

                    if (!isLoading) {
                        playbackStatusChangeHandler.forEach(h => h(newStatus))
                    }
                    if (newStatus === 'Paused') {
                        stopPositionTimer()
                    } else {
                        startPositionTimer()
                    }
                }
            } else if (name === 'media-title') {
                const title = data != null ? String(data) : undefined
                currentTitle = title
                const metadata: MprisMetadata = {
                    'mpris:trackid': currentTrackId,
                    'xesam:title': title,
                    'xesam:url': currentUrl || undefined,
                    'mpris:length': currentLength * 1_000_000,
                }
                mprisService?.updateState({ metadata })
                if (title) {
                    titleChangeHandler.forEach(h => h(title))
                }
            } else if (name === 'volume') {
                if (data != null) {
                    handleMpvVolumeChanged(Number(data))
                }
            } else if (name === 'duration') {
                const durationSeconds = data != null ? Math.round(Number(data)) : 0
                handleLengthChanged(durationSeconds * 1_000_000)
            } else if (name === 'time-pos') {
                if (data != null) {
                    currentPosition = Math.round(Number(data))
                    mprisService?.updateState({ position: currentPosition * 1_000_000 })
                }
            } else if (name === 'path') {
                const url = data != null ? String(data) : null
                if (url && url !== currentUrl) {
                    const newUrlValid = checkUrlValid(url)
                    if (newUrlValid) {
                        trackCounter++
                        currentTrackId = `/org/mpris/MediaPlayer2/track/${trackCounter}`
                        handleUrlChanged(url)
                    }
                }
            }
        })

        ipcClient.onEvent((event) => {
            if (event.event === 'shutdown') {
                handleMpvStopped()
            } else if (event.event === 'end-file') {
                // end-file with reason 'error' or 'eof' while idle means mpv
                // finished a track but is still alive (--idle=yes).  Only quit
                // events mean the process is gone.  A 'redirect' reason means
                // loadfile replaced the track – totally normal for channel switch.
                const reason = event.reason
                if (reason === 'quit') {
                    handleMpvStopped()
                } else if (reason === 'stop') {
                    // User hit stop – mpv goes idle, update UI state
                    handleMpvIdleStopped()
                }
                // For other reasons (error, eof, redirect) mpv stays alive
                // in idle mode – do nothing.
            }
        })

        pauseAllOtherMediaPlayers()

        // Fetch initial state
        ipcClient.getProperty<boolean>('pause').then(paused => {
            currentPlaybackStatus = paused ? 'Paused' : 'Playing'
            mprisService?.updateState({ playbackStatus: currentPlaybackStatus })
            if (!paused) startPositionTimer()
            playbackStatusChangeHandler.forEach(h => h(getPlaybackStatus()))
        }).catch(() => {})

        ipcClient.getProperty<number>('volume').then(vol => {
            if (vol != null) handleMpvVolumeChanged(vol)
        }).catch(() => {})

        ipcClient.getProperty<string>('media-title').then(title => {
            if (title) {
                currentTitle = title
                titleChangeHandler.forEach(h => h(title))
                mprisService?.updateState({
                    metadata: {
                        'mpris:trackid': currentTrackId,
                        'xesam:title': title,
                        'xesam:url': currentUrl || undefined,
                        'mpris:length': currentLength * 1_000_000,
                    },
                })
            }
        }).catch(() => {})

        ipcClient.getProperty<number>('duration').then(dur => {
            if (dur != null) {
                currentLength = Math.round(dur)
                lengthChangeHandler.forEach(h => h(currentLength))
            }
        }).catch(() => {})
    }

    function handleMpvStopped(): void {
        isLoading = false
        currentLength = 0
        currentPosition = 0
        currentPlaybackStatus = 'Stopped'
        currentTitle = undefined
        stopPositionTimer()

        if (ipcClient) {
            ipcClient.destroy()
            ipcClient = null
        }
        if (mprisService) {
            mprisService.destroy()
            mprisService = null
        }

        mpvRunning = false
        currentUrl = null

        playbackStatusChangeHandler.forEach(handler => handler('Stopped'))
        settingsObject.lastVolume = lastVolume
    }

    /** mpv went idle after a 'stop' command but the process is still alive */
    function handleMpvIdleStopped(): void {
        isLoading = false
        currentLength = 0
        currentPosition = 0
        currentPlaybackStatus = 'Stopped'
        currentTitle = undefined
        stopPositionTimer()

        mprisService?.updateState({ playbackStatus: 'Stopped' })
        playbackStatusChangeHandler.forEach(handler => handler('Stopped'))
        settingsObject.lastVolume = lastVolume
    }

    function deactivateAllListener(): void {
        if (ipcConnectTimerId) {
            GLib.source_remove(ipcConnectTimerId)
            ipcConnectTimerId = 0
        }
        if (ipcClient) {
            ipcClient.destroy()
            ipcClient = null
        }
        if (mprisService) {
            mprisService.destroy()
            mprisService = null
        }
    }

    function checkUrlValid(channelUrl: string): boolean {
        return settingsObject.userStations.some(cnl => cnl.url === channelUrl && cnl.inc)
    }

    /** @param length in microseconds */
    function handleLengthChanged(length: number): void {

        const lengthInSeconds = microSecondsToRoundedSeconds(length);

        lengthChangeHandler.forEach(handler => handler(lengthInSeconds))
        const startLoading = (length === 0);
        const finishedLoading = length !== 0 && currentLength === 0;

        currentLength = lengthInSeconds;

        // Update MPRIS metadata with new length
        mprisService?.updateState({
            metadata: {
                'mpris:trackid': currentTrackId,
                'xesam:title': currentTitle,
                'xesam:url': currentUrl || undefined,
                'mpris:length': length,
            },
        })

        if (startLoading) {
            isLoading = true
            playbackStatusChangeHandler.forEach(handler => handler('Loading'))
        }

        if (finishedLoading || bufferExceeded) {
            isLoading = false
            const position = finishedLoading ? 0 : getPosition()
            handlePositionChanged(position)
            playbackStatusChangeHandler.forEach(handler => handler(getPlaybackStatus()))
            bufferExceeded = false
        }
    }

    /**  @param position in seconds! */
    function handlePositionChanged(position: number): void {
        currentPosition = position
        stopPositionTimer()
        positionChangeHandler.forEach(handler => handler(position))
        startPositionTimer()
    }

    function startPositionTimer(): void {

        if (getPlaybackStatus() !== 'Playing') return

        positionTimerId = setInterval(() => {

            const position = Math.min(getPosition(), currentLength)
            positionChangeHandler.forEach(handler => handler(position))

            if (position === currentLength && currentLength > 0) {
                isLoading = true
                playbackStatusChangeHandler.forEach(handler => handler('Loading'))
                bufferExceeded = true
                stopPositionTimer()
            }
        }, 1000)
    }

    function stopPositionTimer(): void {

        if (!positionTimerId) return

        clearInterval(positionTimerId)
        positionTimerId = null
    }

    function handleUrlChanged(newUrl: string): void {
        currentUrl = newUrl
        settingsObject.lastUrl = newUrl
        handleLengthChanged(0)

        if (positionTimerId) stopPositionTimer()
        positionChangeHandler.forEach(handler => handler(0))

        const currentChannelName = getCurrentChannelName()

        if (!currentChannelName) return

        channelNameChangeHandler.forEach(changeHandler => changeHandler(currentChannelName))
    }

    function handleMpvVolumeChanged(mpvVolume: number): void {
        // mpvVolume is 0-100 from mpv's perspective
        const normalizedVolume = Math.round(Math.min(mpvVolume, MAX_VOLUME))

        if (normalizedVolume > MAX_VOLUME) {
            ipcClient?.setProperty('volume', MAX_VOLUME)
            return
        }

        currentVolumeFraction = normalizedVolume / 100
        mprisService?.updateState({ volume: currentVolumeFraction })
        setCvcVolume(normalizedVolume)
        volumeChangeHandler.forEach(changeHandler => changeHandler(normalizedVolume))
        lastVolume = normalizedVolume
    }

    function handleCvcVolumeChanged(): void {
        const normalizedVolume = Math.round(cvcStream.volume / control.get_vol_max_norm() * 100)
        setVolume(normalizedVolume)
    }

    function getLength(): number {
        return currentLength
    }

    function getPosition(): number {
        if (getPlaybackStatus() === 'Stopped') return 0
        return currentPosition
    }

    function setUrl(url: string): void {

        if (getPlaybackStatus() === 'Stopped') {

            // Check if mpv is already running (idle mode)
            if (!mpvRunning) {
                let initialVolume = getInitialVolume()

                if (initialVolume == null) {
                    global.logWarning('initial Volume was null or undefined. Applying 50 as a fallback solution to prevent radio stop working')
                    initialVolume = 50
                }

                const command = `mpv --config=no --no-video --audio-client-name="Radio++" --input-ipc-server=${MPV_IPC_SOCKET_PATH} --scripts-append=${__meta.path}/mpv-reconnect.lua --idle=yes ${url} --volume=${initialVolume}`
                spawnCommandLine(command)

                // Wait for mpv to create the socket, then connect
                waitForSocket()
                return
            }
        }

        // mpv already running, load new URL via IPC
        ipcClient?.sendCommand(['loadfile', url, 'replace'])
        ipcClient?.setProperty('pause', false)
    }

    function waitForSocket(): void {
        if (ipcConnectTimerId) return

        let attempts = 0
        ipcConnectTimerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
            attempts++
            if (GLib.file_test(MPV_IPC_SOCKET_PATH, GLib.FileTest.EXISTS)) {
                try {
                    tryConnectIpc()
                    ipcConnectTimerId = 0
                    return GLib.SOURCE_REMOVE
                } catch {
                    // socket exists but not ready yet
                }
            }
            if (attempts > 25) { // 5 seconds
                ipcConnectTimerId = 0
                return GLib.SOURCE_REMOVE
            }
            return GLib.SOURCE_CONTINUE
        })
    }

    function increaseDecreaseVolume(volumeChange: number): void {

        const currentVolume = getVolume()

        if (currentVolume == null) return

        const newVolume = Math.min(
            MAX_VOLUME,
            Math.max(0, currentVolume + volumeChange)
        )

        setVolume(newVolume)
    }

    /** @param newVolume volume in percent */
    function setVolume(newVolume: number): void {

        if (getVolume() === newVolume || getPlaybackStatus() === 'Stopped') return

        ipcClient?.setProperty('volume', newVolume)
    }

    /** @param newVolume volume in percent */
    function setCvcVolume(newVolume: number): void {
        const newStreamVolume = newVolume / 100 * control.get_vol_max_norm()

        if (!cvcStream) return

        if (cvcStream.volume === newStreamVolume) return

        cvcStream.is_muted && cvcStream.change_is_muted(false)
        cvcStream.volume = newStreamVolume
        cvcStream.push_volume()
    }

    function togglePlayPause(): void {
        if (getPlaybackStatus() === "Stopped") return

        ipcClient?.getProperty<boolean>('pause').then(paused => {
            ipcClient?.setProperty('pause', !paused)
        })
    }

    function stop(): void {
        if (getPlaybackStatus() === "Stopped") return

        ipcClient?.sendCommand(['stop'])
    }

    function getCurrentTitle(): string | undefined {
        if (getPlaybackStatus() === "Stopped") return
        return currentTitle
    }

    function pauseAllOtherMediaPlayers(): void {
        dbus.ListNamesSync()[0].forEach((busName: string) => {

            if (!busName.includes(MEDIA_PLAYER_2_NAME) || busName === MPV_MPRIS_BUS_NAME)
                return

            const nonMpvMediaServerPlayer = getDBusProxyWithOwner(MEDIA_PLAYER_2_PLAYER_NAME, busName) as MprisMediaPlayerDbus

            nonMpvMediaServerPlayer.PauseSync()
        })
    }

    function getPlaybackStatus(): AdvancedPlaybackStatus {
        if (isLoading) return 'Loading'
        if (!mpvRunning) return 'Stopped'
        return currentPlaybackStatus
    }

    /** Volume in Percent */
    function getVolume(props?: { dimension?: 'percent' | 'fraction' }): number | null {
        if (getPlaybackStatus() === 'Stopped') return null
        return (props?.dimension === 'fraction') ? currentVolumeFraction : Math.round(currentVolumeFraction * 100)
    }

    function microSecondsToRoundedSeconds(microSeconds: number): number {
        const seconds = microSeconds / 1_000_000
        const secondsRounded = Math.round(seconds)
        return secondsRounded
    }

    /** @param newPosition in seconds */
    function setPosition(newPosition: number): void {
        const clampedSeconds = Math.min(newPosition, currentLength)
        ipcClient?.sendCommand(['seek', clampedSeconds, 'absolute'])
    }

    function getCurrentChannelName(): string | undefined {
        if (getPlaybackStatus() === 'Stopped') return

        const currentChannel = currentUrl ? settingsObject.userStations.find(cnl => cnl.url === currentUrl) : undefined

        return currentChannel?.name
    }

    addStationsListChangeHandler(() => {

        if (!currentUrl) return

        const currentStationValid = checkUrlValid(currentUrl)

        if (!currentStationValid) stop()

    })

    return {
        increaseDecreaseVolume,
        setVolume,
        setUrl,
        togglePlayPause,
        stop,
        getCurrentTitle,
        setPosition,
        deactivateAllListener,
        getPlaybackStatus,
        getVolume,
        getLength,
        getPosition,
        getCurrentChannelName,


        addPlaybackStatusChangeHandler: (changeHandler: ChangeHandler<AdvancedPlaybackStatus>) => {
            playbackStatusChangeHandler.push(changeHandler)
        },

        addChannelChangeHandler: (changeHandler: ChangeHandler<string>) => {
            channelNameChangeHandler.push(changeHandler)
        },

        addVolumeChangeHandler: (changeHandler: ChangeHandler<number>) => {
            volumeChangeHandler.push(changeHandler)
        },

        addTitleChangeHandler: (changeHandler: ChangeHandler<string>) => {
            titleChangeHandler.push(changeHandler)
        },

        addLengthChangeHandler: (changeHandler: ChangeHandler<number | undefined>) => {
            lengthChangeHandler.push(changeHandler)
        },

        addPositionChangeHandler: (changeHandler: ChangeHandler<number>) => {
            positionChangeHandler.push(changeHandler)
        },

        // The dbus proxy must be kept alive to prevent GC from killing signal listeners
        dbus
    }
}