// also useful to test: 'xlet-settings applet radio@driglu4it'

import { CONFIG_DIR_PATH, CONFIG_FILE_PATH } from "consts"

const { FileMonitorFlags } = imports.gi.Gio

// @ts-ignore
imports.gi.Gio.File = {
    // @ts-ignore
    new_for_path: (path: string) => {

        switch (path) {
            case CONFIG_DIR_PATH:
                return mockedSettingsDir
            case CONFIG_FILE_PATH:
                return mockedSettingsFile
        }
    }
}

import { Settings, createDefaultSettings, createConfig2 } from "Config2";
import { FileCreateFlags } from "../global/gi/Gio"

const onIconChanged = jest.fn(() => { })
const onIconColorPlayingChanged = jest.fn(() => { })
const onIconColorPausedChanged = jest.fn(() => { })
const onChannelOnPanelChanged = jest.fn(() => { })
const onMyStationsChanged = jest.fn(() => { })

const callbacks = { onIconChanged, onIconColorPlayingChanged, onIconColorPausedChanged, onChannelOnPanelChanged, onMyStationsChanged }

let settingsDirExist: boolean
let settingsFileExist: boolean
let settingsFileChangedCallback: Parameters<imports.gi.Gio.FileMonitor["connect"]>[1]
let settings: Settings

const mockedSettingsFile = {
    query_exists: () => {
        // TODO: what if settingsDirExist === false?
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

afterEach(() => {
    settingsDirExist = settingsFileExist = settings = null
})

describe('initialization is working', () => {

    it('settings file created when no settings already exist', () => {
        createConfig2({ ...callbacks })
        expect(settings).toEqual(createDefaultSettings())
    })
});

describe('getters working', () => {

    beforeEach(() => {
        settings = createDefaultSettings()
        settingsDirExist = true
        settingsFileExist = true

    })

    it('last url is returned', () => {

        const lastUrl = "dummyUrl"
        settings["last-url"].value = lastUrl
        const configs = createConfig2({ ...callbacks })

        expect(configs.getLastUrl()).toBe(lastUrl)
    })

    describe('initial volume is returned', () => {
        it('correct value returned when keep volume between sessions is set', () => {

            const lastVolume = 90

            settings['keep-volume-between-sessions'].value = true
            settings['last-volume'].value = lastVolume

            const configs = createConfig2({ ...callbacks })

            expect(configs.getInitialVolume()).toBe(lastVolume)

        })
    });
});