import { Channel, AppletIcon, ChangeHandler } from "./types";
const { AppletSettings } = imports.ui.settings;

interface Settings {
    iconType: AppletIcon,
    symbolicIconColorWhenPlaying: string,
    symbolicIconColorWhenPaused: string,
    channelNameOnPanel: boolean,
    customInitVolume: number,
    keepVolume: boolean,
    lastVolume: number,
    initialVolume: number,
    userStations: Channel[]
    lastUrl: string | null,
    musicDownloadDir: string
}

// TODO: throw an error when importing without initiallized before
export let configs: ReturnType<typeof createConfig>

export const initConfig = () => {
    configs = createConfig()
}

const createConfig = () => {

    // all settings are saved to this object
    const settingsObject = {} as Omit<Settings, 'initialVolume'>
    const appletSettings = new AppletSettings(settingsObject, __meta.uuid, __meta.instanceId)

    const iconTypeChangeHandler: ChangeHandler<AppletIcon>[] = []
    const colorPlayingChangeHander: ChangeHandler<string>[] = []
    const colorPausedHandler: ChangeHandler<string>[] = []
    const channelOnPanelHandler: ChangeHandler<boolean>[] = []
    const stationsHandler: ChangeHandler<Channel[]>[] = []


    let keepVolumeHandler: ChangeHandler<boolean> | undefined

    appletSettings.bind<AppletIcon>('icon-type', 'iconType',
        (...arg) => iconTypeChangeHandler.forEach(changeHandler => changeHandler(...arg))
    )

    appletSettings.bind<string>('color-on', 'symbolicIconColorWhenPlaying',
        (...arg) => colorPlayingChangeHander.forEach(changeHandler => changeHandler(...arg)))

    appletSettings.bind<string>('color-paused', 'symbolicIconColorWhenPaused',
        (...arg) => colorPausedHandler.forEach(changeHandler => changeHandler(...arg)))

    appletSettings.bind<boolean>('channel-on-panel', 'channelNameOnPanel',
        (...arg) => channelOnPanelHandler.forEach(changeHandler => changeHandler(...arg)))

    appletSettings.bind<boolean>('keep-volume-between-sessions', 'keepVolume',
        (...arg) => keepVolumeHandler?.(...arg))

    appletSettings.bind('initial-volume', 'customInitVolume')
    appletSettings.bind('last-volume', 'lastVolume')
    appletSettings.bind<Channel[]>('tree', 'userStations',
        (...arg) => stationsHandler.forEach(changeHandler => changeHandler(...arg)))
    appletSettings.bind('last-url', 'lastUrl')
    appletSettings.bind('music-download-dir-select', 'musicDownloadDir')


    function getInitialVolume() {
        const {
            keepVolume,
            lastVolume,
            customInitVolume
        } = settingsObject

        let initialVolume = keepVolume ? lastVolume : customInitVolume

        return initialVolume
    }


    return {
        settingsObject,

        getInitialVolume,

        addIconTypeChangeHandler: (newIconTypeChangeHandler: ChangeHandler<AppletIcon>) => {
            iconTypeChangeHandler.push(newIconTypeChangeHandler)
        },

        addColorPlayingChangeHandler: (newColorPlayingChangeHandler: ChangeHandler<string>) => {
            colorPlayingChangeHander.push(newColorPlayingChangeHandler)
        },

        addColorPausedChangeHandler: (newColorPausedChangeHandler: ChangeHandler<string>) => {
            colorPausedHandler.push(newColorPausedChangeHandler)
        },

        addChannelOnPanelChangeHandler: (channelOnPanelChangeHandler: ChangeHandler<boolean>) => {
            channelOnPanelHandler.push(channelOnPanelChangeHandler)
        },

        addStationsListChangeHandler: (stationsChangeHandler: ChangeHandler<Channel[]>) => {
            stationsHandler.push(stationsChangeHandler)
        }


        // setIcon

    }

}


