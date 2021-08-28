
const { SystemNotificationSource, Notification } = imports.ui.messageTray;
const { messageTray } = imports.ui.main;

interface CreateNotification {
    // TODO: this should gerneate an icon
    icon: imports.gi.St.Icon
}

const messageSource = new SystemNotificationSource(__meta.name)
messageTray.add(messageSource)


let icon: imports.gi.St.Icon


export function initNotificationFactory(args: CreateNotification) {

    const {
        icon: passedIcon
    } = args

    icon = passedIcon
}


interface NotifyArguments {
    notificationText: string,
    transient?: boolean
}

export function notify(args: NotifyArguments) {

    const {
        notificationText,
        transient = true
    } = args

    if (!icon)
        global.logError('initNotificatoinManager must be called first!')

    const notification = new Notification(
        messageSource,
        __meta.name,
        notificationText,
        { icon, bodyMarkup: true }
    )

    notification.setTransient(transient)

    messageSource.notify(notification)
}