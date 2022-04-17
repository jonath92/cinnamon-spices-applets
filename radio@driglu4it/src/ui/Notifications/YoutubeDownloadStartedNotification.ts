import { notify } from "../../lib/notify";

interface Arguments {
    title: string,
    onCancelClicked: () => void
}

export function notifyYoutubeDownloadStarted(args: Arguments) {

    const {
        title,
        onCancelClicked
    } = args

    notify(
        `Downloading ${title} ...`,
        {
            buttons: [
                {
                    text: 'Cancel',
                    onClick: onCancelClicked
                }
            ]
        }
    )
}