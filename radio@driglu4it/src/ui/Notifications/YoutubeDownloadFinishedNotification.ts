import { createBasicNotification } from "./NotificationBase";

const { spawnCommandLine } = imports.misc.util

interface Arguments {
    downloadPath: string,
    fileAlreadExist?: boolean
}

export function notifyYoutubeDownloadFinished(args: Arguments) {

    const {
        downloadPath,
        fileAlreadExist = false
    } = args

    const notificationText = fileAlreadExist ?
        'Downloaded Song not saved as a file with the same name already exists' :
        `Download finished. File saved to ${downloadPath}`


    createBasicNotification({
        notificationText,
        isMarkup: true,
        transient: false,
        buttons: [
            {
                text: 'Play',
                onClick: () => spawnCommandLine(`xdg-open '${downloadPath}'`)
            }
        ]
    })
}