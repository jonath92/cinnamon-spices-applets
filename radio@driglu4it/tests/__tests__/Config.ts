// also useful to test: 'xlet-settings applet radio@driglu4it'

import { CONFIG_DIR_PATH, CONFIG_FILE_PATH } from "consts"

const { FileMonitorFlags, FileMonitorEvent } = imports.gi.Gio

// @ts-ignore
imports.gi.Gio.File = {
    // @ts-ignore
    new_for_path: (path: string) => {

        switch (path) {
            case CONFIG_DIR_PATH:
                return mockedSettingsDir
            case CONFIG_FILE_PATH:
                return mockedSettingsFile
            default:
                throw new Error('not mocked')
        }
    }
}

import { Settings, createDefaultSettings, createConfig } from "Config";
import { FileCreateFlags } from "../global/gi/Gio"
import { Channel } from "types"
import { cloneDeep } from "lodash"

const onIconChanged = jest.fn(() => { })
const onIconColorPlayingChanged = jest.fn(() => { })
const onIconColorPausedChanged = jest.fn(() => { })
const onChannelOnPanelChanged = jest.fn(() => { })
const onMyStationsChanged = jest.fn(() => { })

const callbacks = { onIconChanged, onIconColorPlayingChanged, onIconColorPausedChanged, onChannelOnPanelChanged, onMyStationsChanged }

const DUMMY_USER_STATIONS: Channel[] = [
    { inc: true, name: 'dummy1', url: 'dummyUrl1' },
    { inc: true, name: 'dummy2', url: 'dummyUrl2' }
]

let settingsDirExist: boolean
let settingsFileExist: boolean
let settingsFileChangedCallback: Parameters<imports.gi.Gio.FileMonitor["connect"]>[1]
let settings: Settings

const mockedSettingsFile = {
    query_exists: () => {
        return settingsFileExist
    },

    monitor_file: (fileMonitorFlag: imports.gi.Gio.FileMonitorFlags) => {
        if (fileMonitorFlag !== FileMonitorFlags.NONE)
            throw new Error('not yet mocked')

        return mockedSettingsFileMonitor
    },

    replace_contents(contents: string, etag: string, make_backup: boolean, flags: imports.gi.Gio.FileCreateFlags, cancellable: boolean) {

        if (!settingsDirExist) {
            throw new Error('No such file or directory')
        }

        if (flags !== FileCreateFlags.REPLACE_DESTINATION)
            throw new Error('not yet mocked')


        settings = JSON.parse(contents)

        settingsFileExist = true

        return [true, ' ']
    },

    load_contents() {
        if (!settingsDirExist || !settingsFileExist)
            throw new Error('No such file or directory')

        if (!settings)
            throw new Error('settings value should be set in test before loading content')

        const settingsString = JSON.stringify(settings)

        return [true, settingsString]

    }
}

const mockedSettingsDir = {
    query_exists: () => {
        return settingsDirExist
    },

    make_directory_with_parents: () => {

        // TODO: what if settingsDirExist already ture
        settingsDirExist = true
    },
}

const mockedSettingsFileMonitor = {

    connect: (changed: 'changed', cb: Parameters<imports.gi.Gio.FileMonitor["connect"]>[1]) => {
        settingsFileChangedCallback = cb
    }
}

function simulateSettingsFileChange(newSettings: Settings) {

    // the first 3 args are obviously in reality not null. 
    settingsFileChangedCallback(null, null, null, FileMonitorEvent.DELETED)
    settingsFileChangedCallback(null, null, null, FileMonitorEvent.CREATED)
    // the next callback is only executed when changed in settings dialoge
    settingsFileChangedCallback(null, null, null, FileMonitorEvent.CHANGED)

    settings = newSettings

    settingsFileChangedCallback(null, null, null, FileMonitorEvent.CHANGES_DONE_HINT)
}

afterEach(() => {
    settingsDirExist = settingsFileExist = settings = null
})

describe('initialization is working', () => {

    it('settings file created when no settings already exist', () => {
        createConfig({ ...callbacks })
        expect(settings).toEqual(createDefaultSettings())
    })
});

describe('getters working', () => {

    beforeEach(() => {
        settings = createDefaultSettings()
        settingsDirExist = true
        settingsFileExist = true
    })

    it('last url is correctly returned', () => {

        const lastUrl = "dummyUrl"
        settings["last-url"].value = lastUrl
        const configs = createConfig({ ...callbacks })

        expect(configs.getLastUrl()).toBe(lastUrl)
    })

    describe('initial volume is returned', () => {
        it('correct value returned when keep volume between sessions is true', () => {

            const lastVolume = 90

            settings['keep-volume-between-sessions'].value = true
            settings['last-volume'].value = lastVolume

            const configs = createConfig({ ...callbacks })

            expect(configs.getInitialVolume()).toBe(lastVolume)

        })

        it('correct value returned when keep volume between sessions is false', () => {

            const initialVolume = 55

            settings['keep-volume-between-sessions'].value = false
            settings['initial-volume'].value = initialVolume

            const configs = createConfig({ ...callbacks })

            expect(configs.getInitialVolume()).toBe(initialVolume)

        })
    });

    it('music download dir is correctly returned', () => {

        const musicDir = "file:///home/jonathan/Music/Radio"
        settings["music-download-dir-select"].value = musicDir
        const configs = createConfig({ ...callbacks })

        expect(configs.getMusicDownloadDir()).toBe(musicDir)

    });

    it('user stations are correclty returned', () => {

        settings.tree.value = DUMMY_USER_STATIONS
        const configs = createConfig({ ...callbacks })
        expect(configs.getUserStations()).toEqual(DUMMY_USER_STATIONS)
    })

});


describe('callbacks working', () => {

    it('onMyStationChanged get called when changing value', () => {
        createConfig({ ...callbacks })

        const newSettings = cloneDeep(settings)
        newSettings.tree.value = DUMMY_USER_STATIONS
        simulateSettingsFileChange(newSettings)

        expect(onMyStationsChanged).toBeCalledTimes(1)
        expect(onMyStationsChanged).toBeCalledWith(DUMMY_USER_STATIONS)
    })

    it('only changed settings trigger a callback', () => {
        createConfig({ ...callbacks })
        jest.clearAllMocks()

        const newSettings = cloneDeep(settings)
        newSettings.tree.value = DUMMY_USER_STATIONS
        simulateSettingsFileChange(newSettings)

        const { onMyStationsChanged, ...otherCallbacks } = callbacks

        Object.values(otherCallbacks).forEach(cb => {
            expect(cb).not.toHaveBeenCalled()
        })


    })

    it('onIconChanged get called when changing value', () => {
        createConfig({ ...callbacks })
        jest.resetAllMocks()

        const newIconValue = "FULLCOLOR"
        const newSettings = cloneDeep(settings)
        newSettings["icon-type"].value = newIconValue
        simulateSettingsFileChange(newSettings)

        expect(onIconChanged).toBeCalledWith(newIconValue)
        expect(onIconChanged).toHaveBeenCalledTimes(1)

    })

    // Assuming all other are also called ...
});