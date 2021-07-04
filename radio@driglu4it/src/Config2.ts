import { isEqual, merge } from "lodash"
import { CONFIG_FILE_PATH } from "./consts"

const { File, FileMonitorFlags, FileCreateFlags } = imports.gi.Gio
const { get_file_contents_utf8_sync } = imports.gi.Cinnamon

interface Widget {
    type: 'checkbox' | 'colorchooser' | 'combobox' | 'list',
    description: string,
    dependency?: string
}

interface Combobox extends Widget {
    type: 'combobox',
    options: any,
    value: string
}

interface ColorChooser {
    type: 'colorchooser',
    value: string
}

interface Checkbox {
    type: 'checkbox',
    value: boolean
}


interface WatchedWidgets {
    'tree': any,
    'icon-type': Combobox,
    'color-on': ColorChooser,
    'color-paused': ColorChooser,
    'channel-on-panel': Checkbox,
    'keep-volume-between-sessions': Checkbox
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
    'appearance-section': Section,
    'volume-section': Section
}

interface Page {
    type: 'page',
    title: string,
    sections: (keyof Sections)[]
}

interface Pages {
    'search-page': Page,
    'my-stations-page': Page,
    'preferences-page': Page
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

    const watchedWidgets: WatchedWidgets = {
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
        },
        'keep-volume-between-sessions': {
            type: 'checkbox',

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
        },
        "volume-section": {
            type: "section",
            title: 'Volume',
            keys: [

            ]
        }
    }

    const pages: Pages = {
        'search-page': {
            type: 'page',
            title: 'Find Station',
            sections: [
                'find-station-section'
            ]
        },
        'my-stations-page': {
            type: 'page',
            title: 'My Stations',
            sections: [
                "station-list-section"
            ]
        },
        'preferences-page': {
            type: 'page',
            title: 'Preferences',
            sections: [
                "appearance-section"
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
            ...pages,
            ...sections
        },
        ...watchedWidgets,
        ...searchWidget
    }

    return [watchedWidgets, fullSettings]
}

function loadSettingsFile() {

    try {
        return JSON.parse(get_file_contents_utf8_sync(CONFIG_FILE_PATH))
    } catch (error) {
        return null
    }
}


