import { initConfig } from './services/Config';
import { initMpvHandler } from './services/mpv/MpvHandler';
import { initPolyfills } from './polyfill';
import { addAppletRemovedFromPanelCleanup, createRadioAppletContainer } from './ui/RadioApplet/RadioAppletContainer';

export function main(): imports.ui.applet.Applet {


    global.log('main.js called')

    // order must be retained!
    initPolyfills()
    initConfig()
    initMpvHandler()

    return createRadioAppletContainer()

}



