import { isEqual, merge } from "lodash"
import { CONFIG_FILE_PATH } from "./consts"

const { File, FileMonitorFlags, FileCreateFlags } = imports.gi.Gio
const { get_file_contents_utf8_sync } = imports.gi.Cinnamon

interface Widget {
    type: 'checkbox' | 'colorchooser' | 'combobox' | 'list' | 'spinbutton' | 'generic' | 'filechooser' | 'custom',
    description?: string,
    value?: any,
    dependency?: string,
    tooltip?: string
}

interface FileChooser extends Widget {
    type: 'filechooser',
    /** whether to show a drop-down list for file select. By default set to false and a button is shown which imo looks ugly */
    "select-dir": boolean
}

interface Combobox extends Widget {
    type: 'combobox',
    options: any,
    value: string
}

interface ColorChooser extends Widget {
    type: 'colorchooser',
    value: string
}

interface Checkbox extends Widget {
    type: 'checkbox',
    value: boolean
}
interface Spinnbutton extends Widget {
    type: 'spinbutton',
    value: number,
    min: number,
    max: number,
    step: number,
}

interface CustomWidget extends Widget {
    type: 'custom',
    file: string,
    widget: string
}

interface WatchedWidgets {
    'tree': any,
    'icon-type': Combobox,
    'color-on': ColorChooser,
    'color-paused': ColorChooser,
    'channel-on-panel': Checkbox,
    'keep-volume-between-sessions': Checkbox,
    'initial-volume': Spinnbutton,
    'music-download-dir-select': FileChooser
}

interface Widgets extends WatchedWidgets {
    'last-volume': Widget,
    'last-url': Widget,
    'radio-search-widget': CustomWidget
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
    'volume-section': Section,
    'youtube-section': Section
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

interface Layout extends Pages, Sections {
    type: "layout",
    height: number,
    width: number,
    pages: (keyof Pages)[]
}

interface Settings extends Widgets {
    "layout1": Layout
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


    function handleSettingsFileChanged(montior: imports.gi.Gio.FileMonitor, file: imports.gi.Gio.File, otherFile: imports.gi.Gio.File, eventType: imports.gi.Gio.FileMonitorEvent) {

        global.log(`eventType: ${eventType}`)

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

    function setLastUrl(lastUrl: string) {
        fullsettings["last-url"].value = lastUrl
        saveSettingsToFile()
    }

    function getLastUrl() {
        return fullsettings["last-url"].value
    }


    return { monitor, setLastUrl, getLastUrl }

}

function createDefaultSettings(): [WatchedWidgets, Settings] {

    const widgets: Widgets = {
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
            value: 'Symbolic',
            options: {
                "Symbolic": "SYMBOLIC",
                "Full Color": "FULLCOLOR",
                "Bicolor": "BICOLOR"
            },
        },
        'color-on': {
            type: "colorchooser",
            value: "#27ae60",
            dependency: "icon-type=SYMBOLIC",
            description: "Color of symbolic icon when playing a radio station",
        },
        'color-paused': {
            type: "colorchooser",
            value: "#9fe1e7",
            dependency: `icon - type=SYMBOLIC`,
            description: "Color of symbolic icon while a radio station is paused",
        },
        'channel-on-panel': {
            type: 'checkbox',
            description: "Show current radio station on the panel",
            value: false
        },
        'keep-volume-between-sessions': {
            type: 'checkbox',
            description: "Remember volume after stopping the radio",
            value: true
        },
        "initial-volume": {
            type: 'spinbutton',
            value: 50,
            min: 5,
            max: 100,
            step: 5,
            description: 'Initial volume',
            tooltip: '"The initial volume is applied when clicking on a radio stream and no other radio stream is already running',
            dependency: 'keep-volume-between-sessions!=true'
        },
        "last-volume": {
            type: "generic",
            value: 80
        },
        "last-url": {
            type: "generic",
            value: null
        },
        "music-download-dir-select": {
            type: 'filechooser',
            description: 'Download directory',
            tooltip: "Songs downloaded from Youtube will be saved to this directory.",
            value: '~/Music/Radio',
            "select-dir": true
        },
        "radio-search-widget": {
            type: 'custom',
            file: 'RadioSearchWidget.py',
            widget: 'RadioSearchWidget'
        }
    }


    const sections: Sections = {
        "station-list-section": {
            type: "section",
            title: "List of stations",
            keys: [
                "tree"
            ]
        },
        "find-station-section": {
            type: "section",
            title: "Search Radio station",
            keys: [
                "radio-search-widget"
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
                "keep-volume-between-sessions", "initial-volume"
            ]
        },
        "youtube-section": {
            type: "section",
            title: 'Youtube Download',
            keys: [
                "music-download-dir-select"
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

    const fullSettings: Settings = {
        "layout1": {
            type: 'layout',
            height: 600,
            width: 800,
            pages: Object.keys(pages) as (keyof Pages)[],
            ...pages,
            ...sections
        },
        ...widgets,
    }

    return [widgets, fullSettings]
}

function loadSettingsFile(): Settings {

    try {
        return JSON.parse(get_file_contents_utf8_sync(CONFIG_FILE_PATH))
    } catch (error) {
        return null
    }
}


