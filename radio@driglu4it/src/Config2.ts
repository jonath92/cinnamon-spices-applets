import { isEqual, merge } from "lodash"
import { CONFIG_FILE_PATH } from "./consts"

const { File, FileMonitorFlags, FileCreateFlags } = imports.gi.Gio
const { get_file_contents_utf8_sync } = imports.gi.Cinnamon


export function createConfig2() {


    const callbacks = new Map()

    callbacks.set('tree', () => { global.log('channelList Changed') })
    callbacks.set('icon-type', () => global.log('icon type changed'))

    const settingsFile = File.new_for_path(CONFIG_FILE_PATH)
    const monitor = settingsFile.monitor_file(FileMonitorFlags.NONE, null)

    let settings = createDefaultSettings()

    if (settingsFile.query_exists(null)) {
        const userSettings = loadSettingsFile()

        settings = {
            ...settings, ...userSettings
        }
    } else {
        saveSettingsToFile()
    }

    // TODO if not exist

    let monitorId = monitor.connect('changed', handleSettingsFileChanged)

    function handleSettingsFileChanged() {
        const newSettings = loadSettingsFile()

        Object.entries(newSettings).forEach(([key, value]) => {

            if (!isEqual(settings[key], value)) {
                callbacks.get(key)?.()
            }
        })

        settings = newSettings
        saveSettingsToFile()
    }

    function saveSettingsToFile() {
        if (monitorId) monitor.disconnect(monitorId) // prevent endless loop

        const [sucess, tag] = settingsFile.replace_contents(
            JSON.stringify(settings),
            null,
            false,
            FileCreateFlags.REPLACE_DESTINATION,
            null
        )

        monitorId = monitor.connect('changed', handleSettingsFileChanged)
    }

    return monitor

}

function createDefaultSettings() {

    function propToString(obj: Record<string, any>, property: any) {
        return Object.keys(obj).find(key => obj[key] === property)
    }

    const keys = {
        'radio-search-widget': {
            type: 'custom',
            file: 'RadioSearchWidget.py',
            widget: 'RadioSearchWidget'
        },
        'tree': {
            type: 'list',
            height: 400,
            columns: [
                {
                    id: "inc",
                    title: "Show in list",
                    type: "boolean",
                    default: true
                },
                {
                    id: "name",
                    title: "Title",
                    type: "string"
                },
                {
                    id: "url",
                    title: "URL",
                    type: "string"
                }
            ],
            value: [
                {
                    name: "Chillout",
                    url: "http://ic7.101.ru:8000/c15_3",
                    inc: true
                },
                {
                    name: "Austrian Rock Radio",
                    url: "http://live.antenne.at/arr",
                    inc: true
                },
                {
                    name: "Deep House",
                    url: "http://yp.shoutcast.com/sbin/tunein-station.pls?id=499023",
                    inc: true
                }
            ]
        },
        'icon-type': {
            type: "combobox",
            description: "Icon type",
            options: {
                "Symbolic": "SYMBOLIC",
                "Full Color": "FULLCOLOR",
                "Bicolor": "BICOLOR"
            },
            value: 'Symbolic'
        },
        'color-on': {
            type: "colorchooser",
            dependency: "icon-type=SYMBOLIC",
            description: "Color of symbolic icon when playing a radio station",
            value: "#27ae60"
        },
        'color-paused': {
            type: "colorchooser",
            dependency: `icon - type=SYMBOLIC`,
            description: "Color of symbolic icon while a radio station is paused",
            value: "#9fe1e7"
        },
        'channel-on-panel': {
            type: 'checkbox',
            description: "Show current radio station on the panel",
            value: false
        }
    }

    const sections = {
        "find-station-section": {
            type: "section",
            title: "Search Radio station",
            keys: [
                propToString(keys, keys["radio-search-widget"])
            ]
        },
        "station-list-section": {
            type: "section",
            title: "List of stations",
            keys: [
                propToString(keys, keys.tree)
            ]
        },
        "appearance-section": {
            type: "section",
            title: "Appearance",
            keys: [
                [keys["icon-type"], keys["color-on"], keys["color-paused"], keys["channel-on-panel"]].map(key => propToString(keys, key))
            ]
        }
    }

    const pages = {
        'search-page': {
            type: 'page',
            title: 'Find Station',
            sections: [
                propToString(sections, sections["find-station-section"])
            ]
        }
    }

    const defaultSettings = {
        "layout": {
            type: 'layout',
            height: 600,
            width: 800,
            pages: [
                Object.keys(pages)
            ],
            ...pages
        },
        ...keys
    }

    return defaultSettings
}

function loadSettingsFile() {
    return JSON.parse(get_file_contents_utf8_sync(CONFIG_FILE_PATH))
}

