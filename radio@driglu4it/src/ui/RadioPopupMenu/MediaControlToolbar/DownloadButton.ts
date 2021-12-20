import { configs } from "../../../services/Config";
import { DOWNLOAD_ICON_NAME } from "../../../consts";
import { mpvHandler } from "../../../services/mpv/MpvHandler";
import { notifyYoutubeDownloadFailed } from "../../Notifications/YoutubeDownloadFailedNotification";
import { notifyYoutubeDownloadFinished } from "../../Notifications/YoutubeDownloadFinishedNotification";
import { notifyYoutubeDownloadStarted } from "../../Notifications/YoutubeDownloadStartedNotification";
import { createControlBtn } from "./ControlBtn";
import { downloadSongFromYoutube } from "../../../services/YoutubeDownloadManager";


export function createDownloadButton() {

    const { getCurrentTitle } = mpvHandler

    const {
        settingsObject
    } = configs

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