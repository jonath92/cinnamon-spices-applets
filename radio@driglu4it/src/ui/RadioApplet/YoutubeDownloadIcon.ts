import { createAppletIcon } from "../../lib/AppletIcon";
import { addDownloadingSongsChangeListener } from "../../services/YoutubeDownloadManager";

export function createYoutubeDownloadIcon() {

    const icon = createAppletIcon({
        icon_name: 'edit-download', 
        visible: false
    })

    addDownloadingSongsChangeListener((downloadingSongs) => {
        downloadingSongs.length === 0 ? icon.visible = true : icon.visible = false
    })

    return icon
}