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

import { createConfig2 } from "Config2";

const onIconChanged = jest.fn(() => { })
const onIconColorPlayingChanged = jest.fn(() => { })
const onIconColorPausedChanged = jest.fn(() => { })
const onChannelOnPanelChanged = jest.fn(() => { })
const onMyStationsChanged = jest.fn(() => { })

let settingsDirExist: boolean
let settingsFileExist: boolean
let settingsFileChangedCallback: Parameters<imports.gi.Gio.FileMonitor["connect"]>[1]

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
        // TODO: improve
        return [true, ' ']
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

describe('initialization is working', () => {

    it('no error', () => {
        const config2 = createConfig2({
            onChannelOnPanelChanged,
            onIconChanged,
            onIconColorPausedChanged,
            onIconColorPlayingChanged,
            onMyStationsChanged
        })
    })

});