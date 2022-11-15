const { new_for_path } = imports.gi.Gio.File
import { CONFIG_DIR } from './consts'

const SETTINGS_PATH = CONFIG_DIR + '/settings.json'
const ByteArray = imports.byteArray
export const settingsFile = new_for_path(SETTINGS_PATH)
const { FileCreateFlags, Cancellable, SubprocessFlags, Subprocess, IOErrorEnum, io_error_from_errno } = imports.gi.Gio
const { strerror } = imports.gi.GLib

export interface Account {
    mail: string,
    refreshToken: string,
    provider: 'Office365' | 'google' // to expand .. . 
}

export interface Settings {
    accounts: Account[]
}

export function loadSettingsFromFile(): Settings {

    let settings: Settings = { accounts: [] }

    try {
        const [success, contents] = settingsFile.load_contents(null)
        // @ts-ignore
        settings = JSON.parse(contents)
        // TODO: validate settings
    } catch (error) {
        // TODO: important. THIS WON'T WORK when caleld from a settings Widget!! 
        // global.logWarning(`couldn't load settings file. The following error occured: ${JSON.stringify(error)}`)
    }

    return settings
}


export function saveSettingsToFile(settings: Settings) {

    log(`query exists: ${settingsFile.query_exists(null)}`)

    if (!settingsFile.query_exists(null)) {
        log('this is called')
        // @ts-ignore
        settingsFile.create(FileCreateFlags.REPLACE_DESTINATION, null)
    }
    try {
        settingsFile.replace_contents(
            JSON.stringify(settings, null, 3),
            null,
            false,
            FileCreateFlags.REPLACE_DESTINATION,
            null
        )
    } catch (error) {
        // TODO: important. THIS WON'T WORK when caleld from a settings Widget!! 
        // global.logWarning(`couldn't save new Settings. The following error occured: ${JSON.stringify(error)}`)
    }
}
