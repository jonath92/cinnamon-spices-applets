import { createConfig } from './Config';
import { createMpvHandler } from './mpv/MpvHandler';
import { createVolumeSlider } from './ui/VolumeSlider';
import { createPopupMenu } from 'cinnamonpopup';

import { downloadSongFromYoutube } from './functions/downloadFromYoutube';
import { installMpvWithMpris } from './mpv/CheckInstallation';
import { notifyYoutubeDownloadFinished } from './ui/Notifications/YoutubeDownloadFinishedNotification';
import { notifyYoutubeDownloadStarted } from './ui/Notifications/YoutubeDownloadStartedNotification';
import { notifyYoutubeDownloadFailed } from './ui/Notifications/YoutubeDownloadFailedNotification';
import { notify } from './ui/Notifications/GenericNotification';
import { createSeeker } from './ui/Seeker';
import { initPolyfills } from './polyfill';
import { createRadioAppletContainer } from './ui/RadioApplet/RadioAppletContainer';


export function main(): imports.ui.applet.Applet {


    initPolyfills()

    // this is a workaround for now. Optimally the lastVolume should be saved persistently each time the volume is changed but this lead to significant performance issue on scrolling at the moment. However this shouldn't be the case as it is no problem to log the volume each time the volume changes (so it is a problem in the config implementation). As a workaround the volume is only saved persistently when the radio stops but the volume obviously can't be received anymore from dbus when the player has been already stopped ... 
    let lastVolume: number

    const configs = createConfig()

    const mpvHandler = createMpvHandler({
        onLengthChanged: hanldeLengthChanged,
        onPositionChanged: handlePositionChanged,
        // onPlaybackstatusChanged: handlePlaybackstatusChanged,
        configs
    })

    const appletContainer = createRadioAppletContainer({configs, mpvHandler})


    const volumeSlider = createVolumeSlider({
        onVolumeChanged: (volume) => mpvHandler?.setVolume(volume)
    })

    const seeker = createSeeker({
        onPositionChanged: (value) => mpvHandler?.setPosition(value)
    })


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

    return appletContainer

}



