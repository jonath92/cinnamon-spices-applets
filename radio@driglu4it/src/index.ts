import { initConfig } from './Config';
import { createMpvHandler } from './mpv/MpvHandler';
import { createVolumeSlider } from './ui/VolumeSlider';
import { createSeeker } from './ui/Seeker';
import { initPolyfills } from './polyfill';
import { createRadioAppletContainer } from './ui/RadioApplet/RadioAppletContainer';


export function main(): imports.ui.applet.Applet {


    initPolyfills()
    initConfig()

    const mpvHandler = createMpvHandler()

    const appletContainer = createRadioAppletContainer({mpvHandler})


    const volumeSlider = createVolumeSlider({
        onVolumeChanged: (volume) => mpvHandler?.setVolume(volume)
    })

    const seeker = createSeeker({
        onPositionChanged: (value) => mpvHandler?.setPosition(value)
    })


    function handleVolumeChanged(volume: number) {
        volumeSlider.setVolume(volume)
    }


    function handleLengthChanged(length: number) {
        seeker.setLength(length)
    }

    function handlePositionChanged(position: number) {
        seeker?.setPosition(position)
    }

    return appletContainer

}



