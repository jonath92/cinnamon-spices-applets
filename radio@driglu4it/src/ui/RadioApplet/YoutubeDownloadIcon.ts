import { createAppletIcon } from "../../lib/AppletIcon";
import { addDownloadSongStartedListener } from "../../services/YoutubeDownloadManager";

export function createYoutubeDownloadIcon() {

    const icon = createAppletIcon({
        icon_name: 'edit-download', 
        visible: false
    })

    addDownloadSongStartedListener(() => {
        global.log('this is called')
        icon.visible = true
    })

    return icon
}