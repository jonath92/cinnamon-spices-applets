import { isEqual, merge } from "lodash"
import { CONFIG_FILE_PATH } from "./consts"

const { File, FileMonitorFlags, FileCreateFlags } = imports.gi.Gio
const { get_file_contents_utf8_sync } = imports.gi.Cinnamon

interface WatchedWidgets {
    'tree': any,
    'icon-type': any,
    'color-on': any,
    'color-paused': any,
    'channel-on-panel': any,
}

interface Widgets extends WatchedWidgets {
    'radio-search-widget': any
}

interface Section {
    type: 'section',
    title: string,
    keys: (keyof Widgets)[]
}

interface Sections {
    'find-station-section': Section,
    'station-list-section': Section,
    'appearance-section': Section
}

export function createConfig2() {

    const callbacks = new Map<keyof WatchedWidgets, () => void>()

    callbacks.set('tree', () => { global.log('channelList Changed') })
    callbacks.set('icon-type', () => global.log('icon type changed'))
    callbacks.set('color-on', () => global.log('color-on changed'))
    callbacks.set('color-paused', () => global.log('color paused changed'))
    callbacks.set('channel-on-panel', () => global.log('channel on panel changed'))

    const settingsFile = File.new_for_path(CONFIG_FILE_PATH)
    const monitor = settingsFile.monitor_file(FileMonitorFlags.NONE, null)

    let [watchedWidgets, fullsettings] = createDefaultSettings()

    if (settingsFile.query_exists(null)) {
        const userSettings = loadSettingsFile()

        fullsettings = {
            ...fullsettings, ...userSettings
        }

        Object.keys(watchedWidgets).forEach((key: keyof WatchedWidgets) => {
            if (userSettings[key]) {
                watchedWidgets[key] = userSettings[key]
            }
        })

    } else {
        saveSettingsToFile()
    }

    // TODO add type for monitor.connect
    let monitorId = monitor.connect('changed', handleSettingsFileChanged)


    function handleSettingsFileChanged() {
        const newSettings = loadSettingsFile()

        if (!newSettings) return

        Object.keys(watchedWidgets).forEach((key: keyof WatchedWidgets) => {

            if (!isEqual(watchedWidgets[key], newSettings[key])) {
                callbacks.get(key)?.()
                watchedWidgets[key] = newSettings[key]
            }
        })

        fullsettings = newSettings
        //saveSettingsToFile()
    }

    function saveSettingsToFile() {
        if (monitorId) monitor.disconnect(monitorId) // prevent endless loop

        const [sucess, tag] = settingsFile.replace_contents(
            JSON.stringify(fullsettings),
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

    const watchedSettings: WatchedWidgets = {
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

    const searchWidget = {
        'radio-search-widget': {
            type: 'custom',
            file: 'RadioSearchWidget.py',
            widget: 'RadioSearchWidget'
        }
    }

    const sections: Sections = {
        "find-station-section": {
            type: "section",
            title: "Search Radio station",
            keys: [
                "radio-search-widget"
            ]
        },
        "station-list-section": {
            type: "section",
            title: "List of stations",
            keys: [
                "tree"
            ]
        },
        "appearance-section": {
            type: "section",
            title: "Appearance",
            keys: [
                "icon-type", "color-on", "color-paused", "channel-on-panel"
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

    const fullSettings = {
        "layout": {
            type: 'layout',
            height: 600,
            width: 800,
            pages: [
                Object.keys(pages)
            ],
            ...pages
        },
        ...watchedSettings,
        ...searchWidget
    }

    return [watchedSettings, fullSettings]
}

function loadSettingsFile() {

    try {
        return JSON.parse(get_file_contents_utf8_sync(CONFIG_FILE_PATH))
    } catch (error) {
        return null
    }
}


