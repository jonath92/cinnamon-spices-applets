import { createConfig } from './Config';
import { ChannelStore } from './ChannelStore';
import { AdvancedPlaybackStatus, Channel, AppletIcon } from './types';
import { createVolumeSlider } from './components/VolumeSlider';
import { createSeparatorMenuItem } from './lib/ui/PopupSeperator';
import { createMediaControlToolbar } from './components/Toolbar/MediaControlToolbar';
import { createPlayPauseButton } from './components/Toolbar/PlayPauseButton';
import { createStopBtn } from './components/Toolbar/StopButton';
import { createInfoSection } from './components/PopupMenu/InfoSection';
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
import { createMpvHandler, useMpvHandler } from './utils/mpvHandler';
import { createRadioPopupMenu } from './components/PopupMenu/PopupMenu';

const { ScrollDirection } = imports.gi.Clutter;
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

    createMpvHandler({
        onLengthChanged: hanldeLengthChanged,
        onPositionChanged: handlePositionChanged,
        onPlaybackstatusChanged: handlePlaybackstatusChanged,
    })

    const mpvHandler = useMpvHandler()

    let installationInProgress = false

    const appletIcon = createAppletIcon({
        instanceId
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

    createAppletTooltip({
        applet,
        orientation
    })

    // TODO configs should be on top
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

    const volumeSlider = createVolumeSlider({
        onVolumeChanged: (volume) => mpvHandler?.setVolume(volume)
    })

    const popupMenu = createRadioPopupMenu({ launcher: applet.actor })
    const infoSection = createInfoSection()

    //toolbar
    const playPauseBtn = createPlayPauseButton({
        onClick: () => mpvHandler.togglePlayPause()
    })

    const stopBtn = createStopBtn({
        onClick: () => mpvHandler?.stop()
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



    function handleIconTypeChanged(iconType: AppletIcon) {
        appletIcon.setIconType(iconType)
    }

    function handleStationsUpdated(stations: Channel[]) {

        const stationsChanged = channelStore.checkListChanged(stations)

        if (!stationsChanged) return

        channelStore.channelList = stations

        const lastUrlValid = channelStore.checkUrlValid(configs.lastUrl)
        if (!lastUrlValid) mpvHandler.stop()
    }

    function handlePlaybackstatusChanged(playbackstatus: AdvancedPlaybackStatus) {

        if (playbackstatus === 'Stopped') {
            radioActiveSection?.hide()
            popupMenu?.close()
        }

        if (playbackstatus !== 'Stopped' && !radioActiveSection.visible)
            radioActiveSection?.show()

        appletIcon?.setPlaybackStatus(playbackstatus)

        if (playbackstatus === 'Playing' || playbackstatus === 'Paused') {
            playPauseBtn?.setPlaybackStatus(playbackstatus)
        }

    }

    function hanldeLengthChanged(length: number) {
        seeker?.setLength(length)
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



