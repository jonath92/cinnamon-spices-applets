import { settingsFileChanged } from "applet/slices/settingsSlice";
import { dispatch } from "applet/Store";
import { Settings, settingsFile } from "utils";

const { FileMonitorFlags, FileMonitorEvent } = imports.gi.Gio

export function monitorSettingsFile() {
    const monitor = settingsFile.monitor_file(FileMonitorFlags.NONE, null)

    monitor.connect('changed', (monitor, file, oldFile, eventType) => {
        if (eventType !== FileMonitorEvent.CHANGES_DONE_HINT) {
            return
        }
        // TODO: validate file
        // TODO: not really a string :O
        const newSettingsString = file.load_contents(null)[1]
        // @ts-ignore
        const newSettings: Settings = JSON.parse(newSettingsString)
        dispatch(settingsFileChanged(newSettings))
    })

    return monitor
}