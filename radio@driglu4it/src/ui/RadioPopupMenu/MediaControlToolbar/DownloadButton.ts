import { DOWNLOAD_ICON_NAME } from "../../../consts";
import { createControlBtn } from "./ControlBtn";
import { downloadSongFromYoutube } from "../../../services/YoutubeDownloadManager";


export function createDownloadButton() {

    const downloadButton = createControlBtn({
        iconName: DOWNLOAD_ICON_NAME,
        tooltipTxt: "Download current song from Youtube",
        onClick: downloadSongFromYoutube
    })

    return downloadButton.actor
}