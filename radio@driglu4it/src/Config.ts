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


export const createConfig = (instanceId: number) => {

    // all settings are saved to this object
    const settingsObject = {} as Omit<Settings, 'initialVolume'>

    const appletSettings = new AppletSettings(settingsObject, __meta.uuid, instanceId)

    const iconTypeChangeHandler: ChangeHandler<AppletIcon> [] = []
    const colorPlayingChangeHander: ChangeHandler<string> [] = []
    const colorPausedHandler: ChangeHandler<string> [] = []

    let channelOnPanelHandler: ChangeHandler<boolean> | undefined
    let keepVolumeHandler: ChangeHandler<boolean> | undefined
    let stationsHandler: ChangeHandler<Channel[]> | undefined

    appletSettings.bind<AppletIcon>('icon-type', 'iconType', 
        (...arg) => iconTypeChangeHandler.forEach(changeHandler => changeHandler(...arg)))

    appletSettings.bind<string>('color-on', 'symbolicIconColorWhenPlaying', 
        (...arg) => colorPlayingChangeHander.forEach(changeHandler => changeHandler(...arg)))

    appletSettings.bind<string>('color-paused', 'symbolicIconColorWhenPaused', 
        (...arg) => colorPausedHandler.forEach(changeHandler => changeHandler(...arg)))

    appletSettings.bind<boolean>('channel-on-panel', 'channelNameOnPanel', 
        (...arg) => channelOnPanelHandler?.(...arg))

    appletSettings.bind<boolean>('keep-volume-between-sessions', 'keepVolume', 
        (...arg) => keepVolumeHandler?.(...arg))

    appletSettings.bind('initial-volume', 'customInitVolume')
    appletSettings.bind('last-volume', 'lastVolume')
    appletSettings.bind<Channel[]>('tree', 'userStations', 
        (...arg) => stationsHandler?.(...arg))
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

        setChannelOnPanelChangeHandler: (newChannelOnPanelChangeHandler: ChangeHandler<boolean>) => {
            channelOnPanelHandler = newChannelOnPanelChangeHandler
        }, 

        setStationsListChangeHandler: (newStationHandler: ChangeHandler<Channel[]>) => {
            stationsHandler = newStationHandler
        }


        // setIcon

    }

}


