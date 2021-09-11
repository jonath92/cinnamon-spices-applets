import { initNotificationFactory, notify } from "../lib/NotificationFactory";

const { Icon, IconType } = imports.gi.St



export function createNofifier() {

    const icon = new Icon({
        icon_type: IconType.SYMBOLIC,
        icon_name: 'view-calendar',
        icon_size: 25
    })


    initNotificationFactory({
        icon
    })

    notify({
        notificationText: 'test'
    })


}