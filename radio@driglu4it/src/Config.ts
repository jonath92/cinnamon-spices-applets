import { isEqual } from "lodash";
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




    appletSettings.bind<AppletIcon>('icon-type', 'iconType',
        (...arg) => iconTypeChangeHandler.forEach(changeHandler => changeHandler(...arg))
    )

    appletSettings.bind<string>('color-on', 'symbolicIconColorWhenPlaying',
        (...arg) => colorPlayingChangeHander.forEach(changeHandler => changeHandler(...arg)))

    appletSettings.bind<string>('color-paused', 'symbolicIconColorWhenPaused',
        (...arg) => colorPausedHandler.forEach(changeHandler => changeHandler(...arg)))

    appletSettings.bind<boolean>('channel-on-panel', 'channelNameOnPanel',
        (...arg) => channelOnPanelHandler.forEach(changeHandler => changeHandler(...arg)))

    appletSettings.bind<boolean>('keep-volume-between-sessions', 'keepVolume')
    appletSettings.bind<number>('initial-volume', 'customInitVolume')
    appletSettings.bind<number>('last-volume', 'lastVolume')

    appletSettings.bind<Channel[]>('tree', 'userStations',
        (newStations) => {
            // global.log('before isEqual')
            // if (isEqual(previousUserStations, newStations)) return
            // global.log('this is called')
            // global.log(`newStations:`, newStations)
            // global.log('previous', previousUserStations)
            stationsHandler.forEach(changeHandler => changeHandler(newStations))
            previousUserStations = newStations
        })

    appletSettings.bind('last-url', 'lastUrl')
    appletSettings.bind('music-download-dir-select', 'musicDownloadDir')

    // The callbacks are for some reason called each time any setting is changed which makes debugging much more difficult. Therefore we are always saving the previous settings to ensure the callbacks are only called when the values have really changed ... 
    let previousUserStations = settingsObject.userStations

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


