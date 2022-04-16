const { SystemNotificationSource, Notification } = imports.ui.messageTray;
const { messageTray } = imports.ui.main;
const { Icon, IconType } = imports.gi.St

import { RADIO_SYMBOLIC_ICON_NAME } from "../../consts";

const messageSource = new SystemNotificationSource('Radio Applet')
messageTray.add(messageSource)

interface NotificationBtn {
    text: string
    onClick: () => void
}

interface NotifyOptions {
    isMarkup?: boolean
    transient?: boolean
    buttons?: NotificationBtn[]
}

export function notify(text: string, options?: NotifyOptions) {

    const {
        isMarkup = false,
        transient = true,
        buttons
    } = options || {}

    const icon = new Icon({
        icon_type: IconType.SYMBOLIC,
        icon_name: RADIO_SYMBOLIC_ICON_NAME,
        icon_size: 25
    })

    const notification = new Notification(
        messageSource,
        __meta.name,
        text,
        { icon })

    notification.setTransient(transient)

    if (buttons) {
        buttons.forEach(({ text }) => {
            notification.addButton(text, text)
        })

        notification.connect('action-invoked', (_, id) => {
            const clickedBtn = buttons.find(({ text }) => text === id)
            clickedBtn?.onClick()
        })
    }

    // workaround to remove the underline of the downloadPath
    isMarkup && notification["_bodyUrlHighlighter"].actor.clutter_text.set_markup(text)

    messageSource.notify(notification)
}