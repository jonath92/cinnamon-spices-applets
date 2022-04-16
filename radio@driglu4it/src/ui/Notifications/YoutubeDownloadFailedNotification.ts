import { APPLET_SITE } from "../../consts";
import { YoutubeClis } from "../../types";
import { createBasicNotification } from "./NotificationBase";
const { spawnCommandLine } = imports.misc.util
const { get_home_dir } = imports.gi.GLib;

interface Props {
    youtubeCli: YoutubeClis
}

export function notifyYoutubeDownloadFailed(props: Props) {

    const { youtubeCli } = props

    const notificationText =
        `Couldn't download Song from Youtube due to an Error. Make Sure you have the newest version of ${youtubeCli} installed. 
        \n<b>Important:</b> Don't use apt for the installation but follow the installation instruction given on the Radio Applet Site in the Cinnamon Store instead
        \nFor more information see the logs`

    createBasicNotification({
        notificationText,
        isMarkup: true,
        transient: false,
        buttons: [
            {
                text: 'View Installation Instruction',
                onClick: () => spawnCommandLine(`xdg-open ${APPLET_SITE} `)
            },
            {
                text: 'View Logs',
                onClick: () => spawnCommandLine(`xdg-open ${get_home_dir()}/.xsession-errors`)
            }
        ]
    })

}