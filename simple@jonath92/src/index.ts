import * as _ from 'lodash';
import { createAppletIcon } from './ui/Applet/AppletIcon';
import { createApplet } from './ui/Applet/Applet';
import { createMpvHandler } from './mpv/MpvHandler';
import { createConfig } from './Config';
import { createAppletLabel } from './ui/Applet/AppletLabel';
import { createAppletTooltip } from './ui/Applet/AppletTooltip';
import { ChannelStore } from './ChannelStore';
import { createChannelList } from './ui/ChannelList/ChannelList';


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



export function main(args: Arguments): imports.ui.applet.Applet {
    const {
        orientation,
        panelHeight,
        instanceId
    } = args

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
        onClick: () => global.log(_.join(['Hello', 'webpack'], ' ')),
        onScroll: () => { },
        onMiddleClick: () => { },
        onAppletMoved: () => { },
        onAppletRemoved: () => { },
        onRightClick: () => { },
    })

    const appletTooltip = createAppletTooltip({
        applet,
        orientation
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

    const channelStore = new ChannelStore(configs.userStations)

	const channelList = createChannelList({
		stationNames: channelStore.activatedChannelNames,
		onChannelClicked: () => {}
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



