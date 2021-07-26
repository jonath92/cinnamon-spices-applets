// import * as _ from 'lodash'; now possible
import { createConfig } from './Config';
import { ChannelStore } from './ChannelStore';
import { createChannelList } from './components/ChannelList/ChannelList';
import { AdvancedPlaybackStatus, Channel, AppletIcon } from './types';
import { createVolumeSlider } from './components/VolumeSlider';
import { createPopupMenu } from './lib/ui/PopupMenu';
import { createSeparatorMenuItem } from './lib/ui/PopupSeperator';
import { createMediaControlToolbar } from './components/Toolbar/MediaControlToolbar';
import { createPlayPauseButton } from './components/Toolbar/PlayPauseButton';
import { createStopBtn } from './components/Toolbar/StopButton';
import { createInfoSection } from './components/InfoSection';
import { createDownloadButton } from './components/Toolbar/DownloadButton';
import { createCopyButton } from './components/Toolbar/CopyButton';
import { downloadSongFromYoutube } from './lib/functions/downloadFromYoutube';
import { installMpvWithMpris } from './utils/CheckMpvInstallation';
import { copyText } from './lib/functions/copyText';
import { createApplet } from './components/Applet/Applet';
import { createAppletIcon } from './components/Applet/AppletIcon';
import { createAppletLabel } from './components/Applet/AppletLabel';
import { createAppletTooltip } from './components/Applet/AppletTooltip';
import { notifyYoutubeDownloadFinished } from './components/Notifications/YoutubeDownloadFinishedNotification';
import { notifyYoutubeDownloadStarted } from './components/Notifications/YoutubeDownloadStartedNotification';
import { notifyYoutubeDownloadFailed } from './components/Notifications/YoutubeDownloadFailedNotification';
import { notify } from './components/Notifications/GenericNotification';
import { createSeeker } from './components/Seeker';
import { VOLUME_DELTA } from './consts';
import { initPolyfills } from './polyfill';
import { createMpvHandler } from './utils/mpvHandler';

const { ScrollDirection } = imports.gi.Clutter;
const { getAppletDefinition } = imports.ui.appletManager;
const { panelManager } = imports.ui.main
const { BoxLayout } = imports.gi.St

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

    initPolyfills()

    // this is a workaround for now. Optimally the lastVolume should be saved persistently each time the volume is changed but this lead to significant performance issue on scrolling at the moment. However this shouldn't be the case as it is no problem to log the volume each time the volume changes (so it is a problem in the config implementation). As a workaround the volume is only saved persistently when the radio stops but the volume obviously can't be received anymore from dbus when the player has been already stopped ... 
    let lastVolume: number
    let mpvHandler: ReturnType<typeof createMpvHandler>

    let installationInProgress = false

    const appletDefinition = getAppletDefinition({
        applet_id: instanceId,
    })

    const panel = panelManager.panels.find(panel =>
        panel?.panelId === appletDefinition.panelId
    )

    panel.connect('icon-size-changed', () => appletIcon.updateIconSize())

    const appletIcon = createAppletIcon({
        locationLabel: appletDefinition.location_label,
        panel
    })

    const appletLabel = createAppletLabel()

    const applet = createApplet({
        icon: appletIcon.actor,
        label: appletLabel.actor,
        instanceId,
        orientation,
        panelHeight,
        onClick: handleAppletClicked,
        onScroll: handleScroll,
        onMiddleClick: () => mpvHandler?.togglePlayPause(),
        onAppletMoved: () => mpvHandler?.deactivateAllListener(),
        onAppletRemoved: handleAppletRemoved,
        onRightClick: () => popupMenu?.close()
    })

    const appletTooltip = createAppletTooltip({
        applet,
        orientation
    })

    const configs = createConfig({
        uuid: __meta.uuid,
        instanceId,

        onIconChanged: handleIconTypeChanged,
        onIconColorPlayingChanged: (color) => {
            appletIcon.setColorWhenPlaying(color)
        },
        onIconColorPausedChanged: (color) => {
            appletIcon.setColorWhenPaused(color)
        },
        onChannelOnPanelChanged: (channelOnPanel) => {
            appletLabel.setVisibility(channelOnPanel)
        },
        onMyStationsChanged: handleStationsUpdated,
    })

    const channelStore = new ChannelStore(configs.userStations)

    const channelList = createChannelList({
        stationNames: channelStore.activatedChannelNames,
        onChannelClicked: handleChannelClicked
    })

    const volumeSlider = createVolumeSlider({
        onVolumeChanged: (volume) => mpvHandler?.setVolume(volume)
    })

    const popupMenu = createPopupMenu({ launcher: applet.actor })
    const infoSection = createInfoSection()

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
        onClick: () => copyText(mpvHandler.getCurrentTitle())
    })

    const mediaControlToolbar = createMediaControlToolbar({
        controlBtns: [playPauseBtn.actor, downloadBtn.actor, copyBtn.actor, stopBtn.actor]
    })

    const seeker = createSeeker({
        onPositionChanged: (value) => mpvHandler?.setPosition(value)
    })

    const radioActiveSection = new BoxLayout({
        vertical: true,
        visible: false
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

    mpvHandler = createMpvHandler({
        getInitialVolume: () => { return configs.initialVolume },
        onVolumeChanged: handleVolumeChanged,
        onLengthChanged: hanldeLengthChanged,
        onPositionChanged: handlePositionChanged,
        checkUrlValid: (url) => channelStore.checkUrlValid(url),
        onTitleChanged: handleTitleChanged,
        onPlaybackstatusChanged: handlePlaybackstatusChanged,
        lastUrl: configs.lastUrl,
        onUrlChanged: handleUrlChanged
    })

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
        mpvHandler.setUrl(channelUrl)
    }

    function handleTitleChanged(title: string) {
        infoSection.setSongTitle(title)
    }

    function handleVolumeChanged(volume: number | null) {
        lastVolume = volume
    }

    function handleIconTypeChanged(iconType: AppletIcon) {
        appletIcon.setIconType(iconType)
    }

    function handleStationsUpdated(stations: Channel[]) {

        const stationsChanged = channelStore.checkListChanged(stations)

        if (!stationsChanged) return

        channelStore.channelList = stations
        channelList.setStationNames(channelStore.activatedChannelNames)

        const lastUrlValid = channelStore.checkUrlValid(configs.lastUrl)
        if (!lastUrlValid) mpvHandler.stop()
    }

    function handlePlaybackstatusChanged(playbackstatus: AdvancedPlaybackStatus) {

        if (playbackstatus === 'Stopped') {
            radioActiveSection.hide()
            configs.lastVolume = lastVolume
            configs.lastUrl = null
            appletLabel.setText(null)
            appletTooltip.setDefaultTooltip()
            popupMenu.close()
        }

        if (playbackstatus !== 'Stopped' && !radioActiveSection.visible)
            radioActiveSection.show()

        channelList.setPlaybackStatus(playbackstatus)
        appletIcon.setPlaybackStatus(playbackstatus)

        if (playbackstatus === 'Playing' || playbackstatus === 'Paused') {
            playPauseBtn.setPlaybackStatus(playbackstatus)
        }

    }

    function handleUrlChanged(url: string) {

        const channelName = url ? channelStore.getChannelName(url) : null

        appletLabel.setText(channelName)

        channelList.setCurrentChannel(channelName)
        infoSection.setChannel(channelName)
        configs.lastUrl = url
    }

    function hanldeLengthChanged(length: number) {
        seeker.setLength(length)
    }

    function handlePositionChanged(position: number) {
        seeker?.setPosition(position)
    }

    function handleDownloadBtnClicked() {

        const title = mpvHandler.getCurrentTitle()

        const downloadProcess = downloadSongFromYoutube({
            downloadDir: configs.musicDownloadDir,
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



