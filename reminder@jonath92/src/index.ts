import { initNotificationFactory } from "./lib/NotificationFactory";
import { initCalendarEventEmitter } from "./services/CalendarEventPollingService";
import { createCalendarPopupMenu } from "./components/popupMenu";
import { createNotifyService } from "services/CalendarEventsNotifyService";
import { createAppletLabel } from "components/AppletLabel";
const { Icon, IconType, BoxLayout } = imports.gi.St

const { AllowedLayout } = imports.ui.applet

interface Arguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}
type ValueOf<T> = T[keyof T];


export function main(args: Arguments) {
    const {
        orientation,
        panelHeight: panel_height,
        instanceId: instance_id
    } = args

    initCalendarEventEmitter()

    initNotificationFactory({
        iconFactory: () => {
            return new Icon({
                icon_type: IconType.SYMBOLIC,
                icon_name: 'view-calendar',
                icon_size: 25
            })
        }
    })

    const actor = new BoxLayout({ style_class: 'applet-box', reactive: true, track_hover: true })
    const popupMenu = createCalendarPopupMenu({ launcher: actor })

    actor.connect('button-press-event', popupMenu.toggle) 


    actor.add_child(createAppletLabel())

    createNotifyService()


    return {
        actor,
        _addStyleClass: () => { },
        finalizeContextMenu: () => { },
        on_applet_added_to_panel_internal: () => { },
        getAllowedLayout: ():   ValueOf<typeof AllowedLayout> => AllowedLayout.BOTH
        
    }
}