import { createConfig } from "Config"
import { createMpvHandler } from "mpv/MpvHandler"
import { RADIO_SYMBOLIC_ICON_NAME, LOADING_ICON_NAME } from "../../consts"
import { AdvancedPlaybackStatus } from "../../types"

const { Icon, IconType: IconTypeEnum } = imports.gi.St
const { panelManager } = imports.ui.main
const { getAppletDefinition } = imports.ui.appletManager;

interface Arguments {
    configs: ReturnType<typeof createConfig>,
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createAppletIcon(args: Arguments) {

    const {
        configs: {
            settingsObject,
            addIconTypeChangeHandler,
            addColorPlayingChangeHandler,
            addColorPausedChangeHandler
        },
        mpvHandler: {
            getPlaybackStatus,
            addPlaybackStatusChangeHandler
        }
    } = args

    const appletDefinition = getAppletDefinition({
        applet_id: __meta.instanceId,
    })

    const locationLabel = appletDefinition.location_label

    const panel = panelManager.panels.find(panel =>
        panel?.panelId === appletDefinition.panelId
    ) as imports.ui.panel.Panel

    const icon = new Icon({})

    function getStyle(props: { playbackStatus: AdvancedPlaybackStatus }): string {
        const { playbackStatus: playbackstatus } = props

        if (playbackstatus === 'Paused')
            return `color: ${settingsObject.symbolicIconColorWhenPaused}`

        if (playbackstatus === 'Playing')
            return `color: ${settingsObject.symbolicIconColorWhenPlaying}`

        return ' '
    }

    function getIconName(props: { isLoading: boolean }): string {
        const { isLoading } = props
        const defaultIconType = settingsObject.iconType

        if (isLoading) return LOADING_ICON_NAME
        if (defaultIconType === 'SYMBOLIC') return RADIO_SYMBOLIC_ICON_NAME
        return `radioapplet-${defaultIconType.toLowerCase()}`
    }

    function setRefreshIcon(): void {

        const playbackStatus = getPlaybackStatus()
        const defaultIconType = settingsObject.iconType
        const useSymbolicIcon = defaultIconType === 'SYMBOLIC' || playbackStatus === 'Loading'

        const [iconTypeEnum, style_class] = useSymbolicIcon ?
            [IconTypeEnum.SYMBOLIC, 'system-status-icon'] :
            [IconTypeEnum.FULLCOLOR,  'applet-icon']

        icon.icon_name = getIconName({isLoading: playbackStatus === 'Loading'})
        icon.icon_type = iconTypeEnum
        icon.style_class = style_class
        icon.icon_size = panel.getPanelZoneIconSize(locationLabel, iconTypeEnum)
        icon.style = getStyle({ playbackStatus })
    }

    panel.connect('icon-size-changed', () => setRefreshIcon())

    addIconTypeChangeHandler(() => setRefreshIcon())
    addPlaybackStatusChangeHandler(() => setRefreshIcon())
    addColorPlayingChangeHandler(() => setRefreshIcon())
    addColorPausedChangeHandler(() => setRefreshIcon())

    setRefreshIcon()

    return icon

}