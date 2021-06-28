import * as _ from 'lodash';
import { createAppletIcon } from './ui/Applet/AppletIcon';
import { createApplet } from './ui/Applet/Applet';
import { createMpvHandler } from './mpv/MpvHandler';
import { createConfig } from './Config';


const { Icon, Label, IconType } = imports.gi.St
const { getAppletDefinition } = imports.ui.appletManager;
const { panelManager } = imports.ui.main

const { AppletSettings } = imports.ui.settings;

const Applet = imports.ui.applet;

interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}



export function main(args: Arguments) {
    const {
        orientation,
        panelHeight,
        instanceId
    } = args


    const settingsObject = {}

    const appletSettings = new AppletSettings(settingsObject, __meta.uuid, instanceId)


    let mpvHandler: ReturnType<typeof createMpvHandler>

    const appletDefinition = getAppletDefinition({
        applet_id: instanceId,
    })

    const panel = panelManager.panels.find(panel =>
        panel?.panelId === appletDefinition.panelId
    )

    const appletIcon = createAppletIcon({
        locationLabel: appletDefinition.location_label,
        panel
    })

    const configs = createConfig({
        uuid: __meta.uuid,
        instanceId,

        onIconChanged: () => { },
        onIconColorPlayingChanged: (color) => {
            appletIcon.setColorWhenPlaying(color)
        },
        onIconColorPausedChanged: (color) => {
            appletIcon.setColorWhenPaused(color)
        },
        onChannelOnPanelChanged: (channelOnPanel) => {
        },
        onMyStationsChanged: () => { },
    })

    panel.connect('icon-size-changed', () => appletIcon.updateIconSize())

    const label = new Label({
        text: 'hi'
    })

    const applet = createApplet({
        icon: appletIcon.actor,
        instanceId,
        label,
        onAppletMoved: () => { },
        onAppletRemoved: () => { },
        onClick: () => global.log(_.join(['Hello', 'webpack'], ' ')),
        onMiddleClick: () => { },
        onRightClick: () => { },
        onScroll: () => { },
        orientation,
        panelHeight
    })

    mpvHandler = createMpvHandler({
        getInitialVolume: () => { return 50 },
        onVolumeChanged: () => { global.log('on volume changed called') },
        onLengthChanged: () => { },
        onPositionChanged: () => { },
        checkUrlValid: (url) => { return true },
        onTitleChanged: () => { },
        onPlaybackstatusChanged: () => { },
        lastUrl: null,
        onUrlChanged: () => { },
    })


    return applet

}


