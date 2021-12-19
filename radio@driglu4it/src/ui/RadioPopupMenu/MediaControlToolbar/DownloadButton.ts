import { createConfig } from "../../../Config";
import { DOWNLOAD_ICON_NAME } from "../../../consts";
import { downloadSongFromYoutube } from "../../../functions/downloadFromYoutube";
import { createMpvHandler } from "../../../mpv/MpvHandler";
import { notifyYoutubeDownloadFailed } from "../../Notifications/YoutubeDownloadFailedNotification";
import { notifyYoutubeDownloadFinished } from "../../Notifications/YoutubeDownloadFinishedNotification";
import { notifyYoutubeDownloadStarted } from "../../Notifications/YoutubeDownloadStartedNotification";
import { createControlBtn } from "./ControlBtn";

interface Arguments {
    mpvHandler: ReturnType<typeof createMpvHandler>
    configs: ReturnType<typeof createConfig>
}

export function createDownloadButton(args: Arguments) {

    const {
        mpvHandler: {
            getCurrentTitle
        }, 
        configs: {
            settingsObject
        }
    } = args

    const downloadButton = createControlBtn({
        iconName: DOWNLOAD_ICON_NAME,
        tooltipTxt: "Download current song from Youtube",
        onClick: handleClick
    })

    function handleClick() {

        const title = getCurrentTitle()

        if (!title) return

        const downloadProcess = downloadSongFromYoutube({
            downloadDir: settingsObject.musicDownloadDir,
            title,
            onDownloadFinished: (path) => notifyYoutubeDownloadFinished({
                downloadPath: path
            }),
            onDownloadFailed: notifyYoutubeDownloadFailed
        })

        notifyYoutubeDownloadStarted({
            title,
            onCancelClicked: () => downloadProcess.cancel()
        })
    }

    return downloadButton.actor
}