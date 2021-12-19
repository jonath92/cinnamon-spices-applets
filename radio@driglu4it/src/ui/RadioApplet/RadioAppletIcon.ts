import { createAppletIcon } from "../../lib/AppletIcon"
import { createMpvHandler } from "../../mpv/MpvHandler"
import { RADIO_SYMBOLIC_ICON_NAME, LOADING_ICON_NAME } from "../../consts"
import { AdvancedPlaybackStatus } from "../../types"
import { configs } from "../../Config"

const { IconType } = imports.gi.St

interface Arguments {
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createRadioAppletIcon(args: Arguments) {

    const {
        mpvHandler: {
            getPlaybackStatus,
            addPlaybackStatusChangeHandler
        }
    } = args

    const {
        settingsObject,
        addIconTypeChangeHandler,
        addColorPlayingChangeHandler,
        addColorPausedChangeHandler
    } = configs

    function getIconType() {
        return settingsObject.iconType === 'SYMBOLIC' ?
            IconType.SYMBOLIC : IconType.FULLCOLOR
    }

    const { actor: icon, setIconType } = createAppletIcon({
        iconType: getIconType()
    })

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

        icon.icon_name = getIconName({ isLoading: playbackStatus === 'Loading' })
        icon.style = getStyle({ playbackStatus })
    }


    addIconTypeChangeHandler(() => {
        setIconType(getIconType())
        setRefreshIcon()
    })

    addPlaybackStatusChangeHandler(() => setRefreshIcon())
    addColorPlayingChangeHandler(() => setRefreshIcon())
    addColorPausedChangeHandler(() => setRefreshIcon())

    setRefreshIcon()

    return icon

}