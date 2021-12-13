import { createConfig } from './Config';
import { ChannelStore } from './ChannelStore';
import { createChannelList } from './ui/ChannelList/ChannelList';
import { AdvancedPlaybackStatus, Channel, AppletIcon } from './types';
import { createMpvHandler } from './mpv/MpvHandler';
import { createVolumeSlider } from './ui/VolumeSlider';
import { createPopupMenu } from 'cinnamonpopup';
import { createSeparatorMenuItem } from './lib/PopupSeperator';
import { createMediaControlToolbar } from './ui/Toolbar/MediaControlToolbar';
import { createPlayPauseButton } from './ui/Toolbar/PlayPauseButton';
import { createStopBtn } from './ui/Toolbar/StopButton';
import { createInfoSection } from './ui/InfoSection';
import { createDownloadButton } from './ui/Toolbar/DownloadButton';
import { createCopyButton } from './ui/Toolbar/CopyButton';
import { downloadSongFromYoutube } from './functions/downloadFromYoutube';
import { installMpvWithMpris } from './mpv/CheckInstallation';
import { copyText } from './functions/copyText';
import { createAppletContainer } from './lib/AppletContainer';
import { createRadioAppletIcon } from './ui/Applet/RadioAppletIcon';
import { createAppletLabel } from './ui/Applet/AppletLabel';
import { createAppletTooltip } from './ui/Applet/AppletTooltip';
import { notifyYoutubeDownloadFinished } from './ui/Notifications/YoutubeDownloadFinishedNotification';
import { notifyYoutubeDownloadStarted } from './ui/Notifications/YoutubeDownloadStartedNotification';
import { notifyYoutubeDownloadFailed } from './ui/Notifications/YoutubeDownloadFailedNotification';
import { notify } from './ui/Notifications/GenericNotification';
import { createSeeker } from './ui/Seeker';
import { VOLUME_DELTA } from './consts';
import { initPolyfills } from './polyfill';

const { BoxLayout } = imports.gi.St
const { ScrollDirection } = imports.gi.Clutter;

interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}

export function main(args: Arguments): imports.ui.applet.Applet {
    const {
        orientation,
        panelHeight,
        instanceId
    } = args

    // TODO: use the instanceId everywhere directly insteed of passing it

    initPolyfills({ instanceId })

    // this is a workaround for now. Optimally the lastVolume should be saved persistently each time the volume is changed but this lead to significant performance issue on scrolling at the moment. However this shouldn't be the case as it is no problem to log the volume each time the volume changes (so it is a problem in the config implementation). As a workaround the volume is only saved persistently when the radio stops but the volume obviously can't be received anymore from dbus when the player has been already stopped ... 
    let lastVolume: number

    let installationInProgress = false

    const configs = createConfig(instanceId)

    const {
        settingsObject: configNew,
        setStationsListChangeHandler: setStationsHandler,
    } = configs

    const mpvHandler = createMpvHandler({
        onVolumeChanged: handleVolumeChanged,
        onLengthChanged: hanldeLengthChanged,
        onPositionChanged: handlePositionChanged,
        onTitleChanged: handleTitleChanged,
        // onPlaybackstatusChanged: handlePlaybackstatusChanged,
        configs
    })

    const channelStore = new ChannelStore(configNew.userStations, mpvHandler)

    const initialChannelName = mpvHandler.getCurrentChannel()
    const initialPlaybackStatus = mpvHandler.getPlaybackStatus()

    const appletIcon = createRadioAppletIcon({
        configs,
        mpvHandler
    })

    const appletLabel = createAppletLabel({
        configs,
        mpvHandler
    })

    const applet = createAppletContainer({
        icon: appletIcon,
        label: appletLabel,
        instanceId,
        orientation,
        panelHeight,
        onClick: handleAppletClicked,
        onScroll: handleScroll,
        onMiddleClick: () => mpvHandler.togglePlayPause(),
        onAppletMoved: () => mpvHandler.deactivateAllListener(),
        onAppletRemoved: handleAppletRemoved,
        onRightClick: () => popupMenu?.close()
    })

    const popupMenu = createPopupMenu({ launcher: applet.actor })


    const appletTooltip = createAppletTooltip({
        applet,
        orientation,
        initialVolume: mpvHandler.getVolume()
    })


    const channelList = createChannelList({
        stationNames: channelStore.activatedChannelNames,
        onChannelClicked: handleChannelClicked,
        initialChannelName,
        initialPlaybackStatus
    })

    setStationsHandler(handleStationsUpdated)

    const volumeSlider = createVolumeSlider({
        onVolumeChanged: (volume) => mpvHandler?.setVolume(volume)
    })

    const infoSection = createInfoSection({
        initialChannelName,
        initialSongTitle: mpvHandler.getCurrentTitle()
    })

    //toolbar
    const playPauseBtn = createPlayPauseButton({
        onClick: () => mpvHandler.togglePlayPause()
    })

    const stopBtn = createStopBtn({
        onClick: () => mpvHandler.stop()
    })

    const downloadBtn = createDownloadButton({
        onClick: handleDownloadBtnClicked
    })

    const copyBtn = createCopyButton({
        onClick: () => {
            const currentTitle = mpvHandler.getCurrentTitle()
            currentTitle && copyText(currentTitle)
        }
    })

    const mediaControlToolbar = createMediaControlToolbar({
        controlBtns: [playPauseBtn.actor, downloadBtn.actor, copyBtn.actor, stopBtn.actor]
    })

    const seeker = createSeeker({
        onPositionChanged: (value) => mpvHandler?.setPosition(value)
    })

    const radioActiveSection = new BoxLayout({
        vertical: true,
        visible: initialPlaybackStatus !== 'Stopped'
    });

    [
        infoSection.actor,
        mediaControlToolbar,
        volumeSlider.actor,
        seeker.actor
    ].forEach(widget => {
        radioActiveSection.add_child(createSeparatorMenuItem())
        radioActiveSection.add_child(widget)
    })

    popupMenu.add_child(channelList.actor)
    popupMenu.add_child(radioActiveSection)



    // CALLBACKS

    async function handleAppletClicked() {

        if (installationInProgress) return

        try {
            installationInProgress = true
            await installMpvWithMpris()
            popupMenu.toggle()
        } catch (error) {
            const notificationText = "Couldn't start the applet. Make sure mpv is installed and the mpv mpris plugin saved in the configs folder."
            notify({ text: notificationText })
            global.logError(error)
        } finally {
            installationInProgress = false
        }
    }

    function handleAppletRemoved() {
        mpvHandler?.deactivateAllListener()
        mpvHandler?.stop()
    }


    function handleScroll(scrollDirection: imports.gi.Clutter.ScrollDirection) {
        const volumeChange =
            scrollDirection === ScrollDirection.UP ? VOLUME_DELTA : -VOLUME_DELTA
        mpvHandler.increaseDecreaseVolume(volumeChange)
    }

    function handleChannelClicked(name: string) {
        const channelUrl = channelStore.getChannelUrl(name)

        if (!channelUrl)
            return

        mpvHandler.setUrl(channelUrl)
    }

    function handleTitleChanged(title: string) {
        infoSection.setSongTitle(title)
    }

    function handleVolumeChanged(volume: number) {
        volumeSlider.setVolume(volume)
        appletTooltip.setVolume(volume)

        lastVolume = volume
    }

    function handleStationsUpdated(stations: Channel[]) {

        const stationsChanged = channelStore.checkListChanged(stations)

        if (!stationsChanged) return

        channelStore.channelList = stations
        channelList.setStationNames(channelStore.activatedChannelNames)

        const lastUrlValid = channelStore.checkUrlValid(configNew.lastUrl)
        if (!lastUrlValid) mpvHandler.stop()
    }

    function handlePlaybackstatusChanged(playbackstatus: AdvancedPlaybackStatus) {

        if (playbackstatus === 'Stopped') {
            radioActiveSection.hide()
            configNew.lastVolume = lastVolume
            configNew.lastUrl = null
            appletTooltip.setDefaultTooltip()
            popupMenu.close()
        }

        if (playbackstatus !== 'Stopped' && !radioActiveSection.visible)
            radioActiveSection.show()

        channelList.setPlaybackStatus(playbackstatus)

        if (playbackstatus === 'Playing' || playbackstatus === 'Paused') {
            playPauseBtn.setPlaybackStatus(playbackstatus)
        }

    }

    function handleUrlChanged(url: string) {

        const channelName = url ? channelStore.getChannelName(url) : null

        channelName && channelList.setCurrentChannel(channelName)
        channelName && infoSection.setChannel(channelName)
        configNew.lastUrl = url
    }

    function hanldeLengthChanged(length: number) {
        seeker.setLength(length)
    }

    function handlePositionChanged(position: number) {
        seeker?.setPosition(position)
    }

    function handleDownloadBtnClicked() {

        const title = mpvHandler.getCurrentTitle()

        if (!title) return

        const downloadProcess = downloadSongFromYoutube({
            downloadDir: configNew.musicDownloadDir,
            title,
            onDownloadFinished: (path) => notifyYoutubeDownloadFinished({
                downloadPath: path
            }),
            onDownloadFailed: notifyYoutubeDownloadFailed
        })

        notifyYoutubeDownloadStarted({
            title,
            onCancelClicked: () => downloadProcess.cancel()
        })
    }

    return applet

}



