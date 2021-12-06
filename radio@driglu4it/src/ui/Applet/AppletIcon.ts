import { createConfig } from "Config"
import { createMpvHandler } from "mpv/MpvHandler"
import { RADIO_SYMBOLIC_ICON_NAME, LOADING_ICON_NAME } from "../../consts"
import { AdvancedPlaybackStatus, AppletIcon, PlayPause } from "../../types"

const { Icon, IconType } = imports.gi.St
const { IconType: IconTypeEnum } = imports.gi.St
const { panelManager } = imports.ui.main
const { getAppletDefinition } = imports.ui.appletManager;

interface Arguments {
    instanceId: number,
    configs: ReturnType<typeof createConfig>,
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createAppletIcon(args: Arguments) {

    const {
        instanceId,
        configs,
        mpvHandler: mpvPlayer
    } = args

    const {
        settingsObject,
        addIconTypeChangeHandler,
        addColorPlayingChangeHandler,
        addColorPausedChangeHandler
    } = configs

    const { symbolicIconColorWhenPaused, symbolicIconColorWhenPlaying } = settingsObject
    const { getPlaybackStatus, addPlaybackStatusChangeHandler } = mpvPlayer

    const playbackStatusStyleMap = new Map<AdvancedPlaybackStatus, string>([
        ['Stopped', ' '],
        ['Loading', ' '],
        ['Paused', `color: ${symbolicIconColorWhenPaused}`],
        ['Playing', `color: ${symbolicIconColorWhenPlaying}`]
    ])

    const appletDefinition = getAppletDefinition({
        applet_id: instanceId,
    })

    const locationLabel = appletDefinition.location_label

    const panel = panelManager.panels.find(panel =>
        panel?.panelId === appletDefinition.panelId
    ) as imports.ui.panel.Panel

    const icon = new Icon({})

    function setRefreshIcon() {

        const playbackStatus = getPlaybackStatus()
        const defaultIconType = settingsObject.iconType

        const useSymbolicIcon = defaultIconType === 'SYMBOLIC' || playbackStatus === 'Loading'

        const [iconTypeEnum, iconName, style_class] = useSymbolicIcon ?
            [IconTypeEnum.SYMBOLIC, RADIO_SYMBOLIC_ICON_NAME, 'system-status-icon'] :
            [IconTypeEnum.FULLCOLOR, `radioapplet-${defaultIconType.toLowerCase()}`, 'applet-icon']

        icon.icon_name = iconName
        icon.icon_type = iconTypeEnum
        icon.style_class = style_class
        icon.icon_size = panel.getPanelZoneIconSize(locationLabel, iconTypeEnum)
        icon.style = playbackStatusStyleMap.get(playbackStatus)!

    }

    panel.connect('icon-size-changed', () => setRefreshIcon())

    addIconTypeChangeHandler(() => setRefreshIcon())
    addPlaybackStatusChangeHandler(() => setRefreshIcon())
    addColorPlayingChangeHandler(() => setRefreshIcon())
    addColorPausedChangeHandler(() => setRefreshIcon())

    return icon

}