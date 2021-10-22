
const { SystemNotificationSource, Notification } = imports.ui.messageTray;
const { messageTray } = imports.ui.main;

let iconFactory: () => imports.gi.St.Icon

const messageSource = new SystemNotificationSource(__meta.name)
messageTray.add(messageSource)


export function initNotificationFactory(args: {iconFactory: typeof iconFactory}) {

    const {
        iconFactory: passedIconFactory
    } = args

    iconFactory = passedIconFactory
}


export function notify(args: {notificationText: string, transient?: boolean}) {

    const {
        notificationText,
        transient = true
    } = args

    if (!iconFactory)
        global.logError('initNotificatoinManager must be called first!')

    const notification = new Notification(
        messageSource,
        __meta.name,
        notificationText,
        { icon: iconFactory(), bodyMarkup: true }
    )

    notification.setTransient(transient)

    messageSource.notify(notification)
}