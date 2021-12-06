import { createConfig } from "Config"
import { RADIO_SYMBOLIC_ICON_NAME, LOADING_ICON_NAME } from "../../consts"
import { AdvancedPlaybackStatus, AppletIcon } from "../../types"

const { Icon, IconType } = imports.gi.St
const { IconType: IconTypeEnum } = imports.gi.St
const { panelManager } = imports.ui.main
const { getAppletDefinition } = imports.ui.appletManager;

interface Arguments {
    instanceId: number,
    initialPlaybackStatus: AdvancedPlaybackStatus,
    configs: ReturnType<typeof createConfig>, 
}

export function createAppletIcon(args: Arguments) {

    const {
        instanceId,
        initialPlaybackStatus,
        configs
    } = args

    const { 
        settingsObject, 
        addIconTypeChangeHandler, 
        addColorPlayingChangeHandler, 
        addColorPausedChangeHandler 
    } = configs

    const appletDefinition = getAppletDefinition({
        applet_id: instanceId,
    })

    const locationLabel = appletDefinition.location_label

    const panel = panelManager.panels.find(panel =>
        panel?.panelId === appletDefinition.panelId
    ) as imports.ui.panel.Panel

    let playbackStatus: AdvancedPlaybackStatus

    const playbackStatusStyleMap = new Map<AdvancedPlaybackStatus, string>([
        ['Stopped', ' '],
        ['Loading', ' ']
    ])

    const icon = new Icon({})

    let normalIconType: AppletIcon


    // the icon type passed from outside is overriten when the playbackstatus is 'loading' 
    function setIconTypeInternal(iconTypeEnum: imports.gi.St.IconType, iconName: string) {
        icon.style_class = iconTypeEnum === IconTypeEnum.SYMBOLIC ?
            'system-status-icon' : 'applet-icon'

        icon.icon_name = iconName
        icon.icon_type = iconTypeEnum
        icon.icon_size = panel.getPanelZoneIconSize(locationLabel, iconTypeEnum)
    }


    function setIconType(iconType: AppletIcon) {

        if (!iconType) return

        const [iconTypeEnum, iconName] = iconType === 'SYMBOLIC' ? 
            [IconTypeEnum.SYMBOLIC, RADIO_SYMBOLIC_ICON_NAME] : 
            [IconTypeEnum.FULLCOLOR, `radioapplet-${iconType.toLowerCase()}`]

        setIconTypeInternal(iconTypeEnum, iconName)
    }

    function updateIconSize() {
        const iconSize = panel.getPanelZoneIconSize(locationLabel, icon.icon_type)
        icon.icon_size = iconSize
    }

    function setColorWhenPaused(color: string) {
        playbackStatusStyleMap.set('Paused', `color: ${color}`)

        if (playbackStatus) setPlaybackStatus(playbackStatus)
    }

    function setColorWhenPlaying(color: string) {

        playbackStatusStyleMap.set('Playing', `color: ${color}`)

        if (playbackStatus) setPlaybackStatus(playbackStatus)
    }

    function setPlaybackStatus(newPlaybackStatus: AdvancedPlaybackStatus) {

        playbackStatus = newPlaybackStatus
        const style = playbackStatusStyleMap.get(playbackStatus)


        if (newPlaybackStatus === 'Loading') {
            setIconTypeInternal(IconTypeEnum.SYMBOLIC, LOADING_ICON_NAME)
        } else {
            setIconType(normalIconType)
        }

        if (!style) return

        icon.set_style(style)
    }

    panel.connect('icon-size-changed', () => updateIconSize())

    addIconTypeChangeHandler((newValue) => setIconType(newValue))
    addColorPlayingChangeHandler((newValue) => setColorWhenPlaying(newValue))
    addColorPausedChangeHandler((newValue) => setColorWhenPaused(newValue))

    
    setColorWhenPlaying(settingsObject.symbolicIconColorWhenPlaying)
    setColorWhenPaused(settingsObject.symbolicIconColorWhenPaused)
    setPlaybackStatus(initialPlaybackStatus)



    return {
        actor: icon,
        setPlaybackStatus,
    }

}