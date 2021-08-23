import { ReminderApplet } from "./Applet";
import { createPopupMenu } from 'cinnamonpopup'
import { createCardContainer } from "./CardContainer";
import { createCard } from "./Card";
import { DateTime } from "luxon";
import { initNotificationFactory, notify } from "./NotificationFactory";
import { createOffice365Handler } from "./office365Handler";
const { Icon, IconType, Align } = imports.gi.St

const { get_home_dir } = imports.gi.GLib;
const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${__meta.uuid}`;
const { new_for_path } = imports.gi.Gio.File

interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}

interface Settings {
    refresh_token?: string, 
    auth_code?: string
}

export function main(args: Arguments) {
    const {
        orientation,
        panelHeight: panel_height,
        instanceId: instance_id
    } = args

    const reminderApplet = new ReminderApplet(orientation, panel_height, instance_id)
    const emittedReminders: string[] = []



    initNotificationFactory({
        icon: new Icon({
            icon_type: IconType.SYMBOLIC,
            icon_name: 'view-calendar',
            icon_size: 25
        })
    })

    const refreshToken = loadRefreshTokenFromSettings()

    const { 
        getTodayEvents 
    } = createOffice365Handler({
        onRefreshTokenChanged: (refreshToken) => { }, // TODO, 
        refreshToken
    })


    reminderApplet.on_applet_clicked = handleAppletClicked

    const popupMenu = createPopupMenu({ launcher: reminderApplet.actor })
    const cardContainer = createCardContainer()
    popupMenu.add_actor(cardContainer.actor)

    function handleAppletClicked() {
        popupMenu.toggle()
    }



    loadSettings((settings) => {
        const { 
            getTodayEvents 
        } = createOffice365Handler({
            onRefreshTokenChanged: (refreshToken) => { }, // TODO, 
            refreshToken
        })

        updateMenu()
        setInterval(updateMenu, 60000)

    })

    // TODO: what is with all day events

    // https://moment.github.io/luxon/#/?id=luxon
    async function updateMenu() {
        const todayEvents = await getTodayEvents()

        cardContainer.box.destroy_all_children()

        todayEvents.forEach(event => {

            const eventStart = DateTime.fromISO(event.start.dateTime + 'Z')
            const eventStartFormated = eventStart.toLocaleString(DateTime.TIME_SIMPLE)

            const card = createCard({
                title: eventStartFormated,
                body: event.subject
            })

            cardContainer.box.add_child(card)

            const reminderStartTime = eventStart.minus({
                minutes: event.reminderMinutesBeforeStart
            })

            if (reminderStartTime <= DateTime.now() && !emittedReminders.includes(event.id)) {

                // What is this? Why is \n needed instead of <br> ?
                const notificationText = `<b>${eventStartFormated}</b>\n\n${event.subject}`

                notify({
                    notificationText,
                    transient: false
                })

                emittedReminders.push(event.id)
            }
        })

    }


    function loadSettings(setingsLoadedCb: (settings: Settings) => void) {
        global.log('loadSettings called')
        const SETTINGS_PATH = CONFIG_DIR + '/settings.json'
        let settings: Settings

        const settingsFile = new_for_path(SETTINGS_PATH)
        settingsFile.load_contents_async(null, (source_object, res) => {

            global.log('load contents async cb called')

            const [success, contents] = settingsFile.load_contents_finish(res)

            // @ts-ignore
            const settings: Settings = JSON.parse(contents.toString())

            setingsLoadedCb(settings)

        })

    }



    // TODO this should be async. I guess currently the event loop would be blocked when the settings file not exists
    function loadRefreshTokenFromSettings() {
        const SETTINGS_PATH = CONFIG_DIR + '/settings.json'
        let settings: Settings

        try {
            const settingsFile = new_for_path(SETTINGS_PATH)
            const [success, contents] = settingsFile.load_contents(null)
            settings = JSON.parse(contents)
        } catch (error) {
            throw new Error(`couldn't load settings file`)
        }

        const refreshToken = settings.refresh_token

        if (!refreshToken) throw new Error('refresh Token is undefined')

        return refreshToken
    }


    return reminderApplet

}