import { throttle } from "lodash"
import { CONFIG_DIR_PATH, CONFIG_FILE_PATH } from "./consts"
import { Channel, IconType } from "./types"

const { File, FileMonitorFlags, FileCreateFlags, FileMonitorEvent } = imports.gi.Gio

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
    value: IconType
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

interface ListColumn {
    id: string,
    title: string,
    type: 'boolean' | 'string',
    default?: boolean
}

interface ListWidget extends Widget {
    type: 'list',
    height: number,
    columns: ListColumn[],
    value: Channel[]
}

interface WatchedWidgets {
    'tree': ListWidget,
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

export interface Settings extends Widgets {
    "layout1": Layout
}

interface Arguments {
    onIconChanged: (iconType: IconType) => void,
    onIconColorPlayingChanged: (color: string) => void,
    onIconColorPausedChanged: (color: string) => void,
    onChannelOnPanelChanged: (channelOnPanel: boolean) => void,
    onMyStationsChanged: (stations: Channel[]) => void,
}


export function createConfig(args: Arguments) {

    const {
        onChannelOnPanelChanged,
        onIconChanged,
        onIconColorPausedChanged,
        onIconColorPlayingChanged,
        onMyStationsChanged
    } = args

    const watchedWidgets: (keyof WatchedWidgets)[] = ["tree", "icon-type", "color-on", "color-paused", "channel-on-panel", "keep-volume-between-sessions", "initial-volume", "music-download-dir-select"]

    const callbacks = new Map<keyof WatchedWidgets, () => void>()

    callbacks.set('tree', () => onMyStationsChanged(getUserStations()))
    callbacks.set('icon-type', () => onIconChanged(getIconType()))
    callbacks.set('color-on', () => onIconColorPlayingChanged(getColorPlaying()))
    callbacks.set('color-paused', () => onIconColorPausedChanged(getColorPaused()))
    callbacks.set('channel-on-panel', () => onChannelOnPanelChanged(getChannelOnPanel()))

    const configsDir = File.new_for_path(CONFIG_DIR_PATH)

    if (!configsDir.query_exists(null))
        configsDir.make_directory_with_parents(null)

    const settingsFile = File.new_for_path(CONFIG_FILE_PATH)
    const monitor = settingsFile.monitor_file(FileMonitorFlags.NONE, null)

    monitor.connect('changed', handleSettingsFileChanged)
    let settings = createDefaultSettings()

    // saving only every 500 ms improves performance
    const saveSettingsToFileThrottled = throttle(() => {
        const [sucess, tag] = settingsFile.replace_contents(
            JSON.stringify(settings, null, 4),
            null,
            false,
            FileCreateFlags.REPLACE_DESTINATION,
            null
        )
    }, 500)

    if (settingsFile.query_exists(null)) {
        const userSettings = loadSettingsFile()

        settings = {
            ...settings, ...userSettings
        }

    } else {
        saveSettingsToFileThrottled()
    }

    function loadSettingsFile(): Settings {

        const settingsString = settingsFile.load_contents(null)[1]
        const newSettings: Settings = JSON.parse(settingsString)
        return newSettings
    }

    function handleSettingsFileChanged(monitor: imports.gi.Gio.FileMonitor, file: imports.gi.Gio.File, otherFile: imports.gi.Gio.File, eventType: imports.gi.Gio.FileMonitorEvent) {

        if (eventType !== FileMonitorEvent.CHANGES_DONE_HINT) return
        const newSettings = loadSettingsFile()

        if (!newSettings) return

        watchedWidgets.forEach(key => {

            const newValue = newSettings[key].value

            if (settings[key].value !== newValue) {
                settings[key].value = newValue
                callbacks.get(key)?.()
            }
        })

    }


    function setLastUrl(lastUrl: string) {
        settings["last-url"].value = lastUrl
        saveSettingsToFileThrottled()
    }

    function setLastVolume(lastVolume: number) {
        settings["last-volume"].value = lastVolume
        saveSettingsToFileThrottled()
    }

    function getIconType() {
        return settings["icon-type"].value
    }

    function getLastUrl() {
        return settings["last-url"].value
    }

    function getUserStations() {
        return settings['tree'].value
    }

    function getInitialVolume() {

        const keepVolume = settings['keep-volume-between-sessions'].value
        const lastVolume = settings['last-volume'].value
        const customInitVolume = settings['initial-volume'].value

        const initialVolume = keepVolume ? lastVolume : customInitVolume

        return initialVolume
    }

    function getMusicDownloadDir() {
        return settings['music-download-dir-select'].value
    }

    function getColorPlaying() {
        return settings['color-on'].value
    }

    function getColorPaused() {
        return settings['color-paused'].value
    }

    function getChannelOnPanel() {
        return settings['channel-on-panel'].value
    }

    onIconChanged(getIconType())
    onIconColorPlayingChanged(getColorPlaying())
    onIconColorPausedChanged(getColorPaused())
    onChannelOnPanelChanged(getChannelOnPanel())

    return {
        monitor,
        setLastUrl,
        setLastVolume,
        getLastUrl,
        getUserStations,
        getInitialVolume,
        getMusicDownloadDir
    }
}

export function createDefaultSettings(): Settings {

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
            value: 'SYMBOLIC',
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
            dependency: `icon-type=SYMBOLIC`,
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

    return fullSettings
}
