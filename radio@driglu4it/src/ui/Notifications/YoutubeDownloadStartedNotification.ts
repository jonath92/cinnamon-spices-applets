import { createBasicNotification } from "./NotificationBase";

interface Arguments {
    title: string,
    onCancelClicked: () => void
}

export function notifyYoutubeDownloadStarted(args: Arguments) {

    const {
        title,
        onCancelClicked
    } = args

    createBasicNotification({
        notificationText: `Downloading ${title} ...`,
        buttons: [
            {
                text: 'Cancel',
                onClick: onCancelClicked
            }
        ]
    })
}