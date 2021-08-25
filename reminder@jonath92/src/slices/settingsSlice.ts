import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const { get_home_dir } = imports.gi.GLib;
const { new_for_path } = imports.gi.Gio.File

const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${__meta.uuid}`;
const SETTINGS_PATH = CONFIG_DIR + '/settings.json'
const ByteArray = imports.byteArray

interface SettingsState {
    refreshToken?: string, 
    authCode?: string
}

function loadSettingsFromFile(): SettingsState{

    let settings: SettingsState = {}

    try {
        const settingsFile = new_for_path(SETTINGS_PATH)
        const [success, contents] = settingsFile.load_contents(null)
        settings = JSON.parse(ByteArray.toString(contents))
    } catch (error) {
        global.logWarning(`couldn't load settings file. The following error occured: ${JSON.stringify(error)}`)
    }

    return settings
}

const initialState: SettingsState = loadSettingsFromFile()

const settingsSlice = createSlice({
    name: 'settings', 
    initialState: initialState, 
    reducers: {
        refreshTokenChanged(state, action: PayloadAction<string>){
            state.refreshToken = action.payload
        }
    }
})

export const {
    refreshTokenChanged
} = settingsSlice.actions

export default settingsSlice.reducer