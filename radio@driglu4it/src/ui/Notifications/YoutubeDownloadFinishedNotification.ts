import { notify } from "./NotificationBase";

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

    notify(
        fileAlreadExist ?
            'Downloaded Song not saved as a file with the same name already exists' :
            `Download finished. File saved to ${downloadPath}`,
        {
            isMarkup: true,
            transient: false,
            buttons: [
                {
                    text: 'Play',
                    onClick: () => spawnCommandLine(`xdg-open '${downloadPath}'`)
                }
            ]
        }
    )
}