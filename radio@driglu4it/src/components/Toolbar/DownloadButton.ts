import { notifyYoutubeDownloadFailed } from "../Notifications/YoutubeDownloadFailedNotification";
import { notifyYoutubeDownloadFinished } from "../Notifications/YoutubeDownloadFinishedNotification";
import { notifyYoutubeDownloadStarted } from "../Notifications/YoutubeDownloadStartedNotification";
import { createConfig } from "Config";
import { downloadSongFromYoutube } from "../../functions/downloadFromYoutube";
import { createMpvHandler } from "../../mpv/MpvHandler";
import { DOWNLOAD_ICON_NAME } from "../../consts";
import { createControlBtn } from "../../lib/IconBtn";

interface Arguments {
    // onClick: { (): void }
    mpvHandler: ReturnType<typeof createMpvHandler>
    configs: ReturnType<typeof createConfig>
}

export function createDownloadButton(args: Arguments) {

    const {
        mpvHandler, 
        configs
    } = args

    const handleBtnClicked = () => {
        const title = mpvHandler.getCurrentTitle()
        const downloadProcess = downloadSongFromYoutube({
            downloadDir: configs.musicDownloadDir,
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
    
    const downloadButton = createControlBtn({
        iconName: DOWNLOAD_ICON_NAME,
        tooltipTxt: "Download current song from Youtube",
        onClick: handleBtnClicked
    })

    
    return {
        actor: downloadButton.actor
    }

}