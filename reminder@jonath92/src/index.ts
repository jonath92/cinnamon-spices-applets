import { initNotificationFactory } from "./lib/NotificationFactory";
import { initCalendarEventEmitter } from "./services/CalendarEventPollingService";
import { createNotifyService } from "services/CalendarEventsNotifyService";
import { createAppletBox } from "components/AppletContainer";

const { Icon, IconType } = imports.gi.St

export interface AppletArguments {
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
}

export function main(args: AppletArguments): imports.ui.applet.Applet {

    global.log('main called')


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

    const appletBox = createAppletBox(args)

    createNotifyService()

    return appletBox
}