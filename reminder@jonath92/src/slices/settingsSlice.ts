import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CONFIG_DIR } from '../consts'

const { new_for_path } = imports.gi.Gio.File
const { FileCreateFlags } = imports.gi.Gio

const SETTINGS_PATH = CONFIG_DIR + '/settings.json'
const ByteArray = imports.byteArray
const settingsFile = new_for_path(SETTINGS_PATH)

interface SettingsState {
    refreshToken?: string,
    authCode?: string
}


function loadSettingsFromFile(): SettingsState {

    let settings: SettingsState = {}

    try {
        const [success, contents] = settingsFile.load_contents(null)
        settings = JSON.parse(ByteArray.toString(contents))
    } catch (error) {
        global.logWarning(`couldn't load settings file. The following error occured: ${JSON.stringify(error)}`)
    }

    return settings
}


function saveSettingsToFile(state: SettingsState) {
    try {
        settingsFile.replace_contents(
            JSON.stringify(state, null, 3),
            null,
            false,
            FileCreateFlags.REPLACE_DESTINATION, 
            null
        )
    } catch (error) {
        global.logWarning(`couldn't save new Settings. The following error occured: ${JSON.stringify(error)}`)
    }
}


const settingsSlice = createSlice({
    name: 'settings',
    initialState: loadSettingsFromFile(),
    reducers: {
        refreshTokenChanged(state, action: PayloadAction<string>) {
            global.log('refreshToken Change called')
            state.refreshToken = action.payload
            saveSettingsToFile(state)
        }
    }
})

export const {
    refreshTokenChanged
} = settingsSlice.actions

export default settingsSlice.reducer