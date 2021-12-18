import { createConfig } from './Config';
import { createChannelList } from './ui/ChannelList/ChannelList';
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
import { createRadioAppletIcon } from './ui/RadioApplet/RadioAppletIcon';
import { createRadioAppletLabel } from './ui/RadioApplet/RadioAppletLabel';
import { createRadioAppletTooltip } from './ui/RadioApplet/RadioAppletTooltip';
import { notifyYoutubeDownloadFinished } from './ui/Notifications/YoutubeDownloadFinishedNotification';
import { notifyYoutubeDownloadStarted } from './ui/Notifications/YoutubeDownloadStartedNotification';
import { notifyYoutubeDownloadFailed } from './ui/Notifications/YoutubeDownloadFailedNotification';
import { notify } from './ui/Notifications/GenericNotification';
import { createSeeker } from './ui/Seeker';
import { VOLUME_DELTA } from './consts';
import { initPolyfills } from './polyfill';
import { createRadioAppletContainer } from './ui/RadioApplet/RadioAppletContainer';

const { BoxLayout } = imports.gi.St

// TODO: remove the args fully
interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}

export function main(args: Arguments): imports.ui.applet.Applet {
    const {
        orientation,
        instanceId
    } = args



    initPolyfills()

    // this is a workaround for now. Optimally the lastVolume should be saved persistently each time the volume is changed but this lead to significant performance issue on scrolling at the moment. However this shouldn't be the case as it is no problem to log the volume each time the volume changes (so it is a problem in the config implementation). As a workaround the volume is only saved persistently when the radio stops but the volume obviously can't be received anymore from dbus when the player has been already stopped ... 
    let lastVolume: number

    let installationInProgress = false

    const configs = createConfig(instanceId)

    const {
        settingsObject: configNew,
        addStationsListChangeHandler: setStationsHandler,
    } = configs

    const mpvHandler = createMpvHandler({
        onVolumeChanged: handleVolumeChanged,
        onLengthChanged: hanldeLengthChanged,
        onPositionChanged: handlePositionChanged,
        onTitleChanged: handleTitleChanged,
        // onPlaybackstatusChanged: handlePlaybackstatusChanged,
        configs
    })

    const appletContainer = createRadioAppletContainer({configs, mpvHandler})

    const initialChannelName = mpvHandler.getCurrentChannel()
    const initialPlaybackStatus = mpvHandler.getPlaybackStatus()


    const appletIcon = createRadioAppletIcon({
        configs,
        mpvHandler
    })

    const appletLabel = createRadioAppletLabel({
        configs,
        mpvHandler
    })

    // const appletContainer = createAppletContainer({
    //     icon: appletIcon,
    //     label: appletLabel,
    //     onClick: handleAppletClicked,
    //     onScroll: handleScroll,
    //     onMiddleClick: () => mpvHandler.togglePlayPause(),
    //     onMoved: () => mpvHandler.deactivateAllListener(),
    //     onRemoved: handleAppletRemoved,
    //     onRightClick: () => popupMenu?.close()
    // })

    const popupMenu = createPopupMenu({ launcher: appletContainer.actor })

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

    // popupMenu.add_child(radioActiveSection)



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



    function handleTitleChanged(title: string) {
        infoSection.setSongTitle(title)
    }

    function handleVolumeChanged(volume: number) {
        volumeSlider.setVolume(volume)

        lastVolume = volume
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

    return appletContainer

}



