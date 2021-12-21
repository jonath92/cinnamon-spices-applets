import { notifyYoutubeDownloadFailed } from "../../ui/Notifications/YoutubeDownloadFailedNotification";
import { notifyYoutubeDownloadFinished } from "../../ui/Notifications/YoutubeDownloadFinishedNotification";
import { configs } from "../Config";
import { downloadingSongs, YoutubeDownloadServiceProps } from "./YoutubeDownloadManager";
const { get_home_dir } = imports.gi.GLib;
const { spawnCommandLineAsyncIO } = imports.misc.util;


export function downloadWithYoutubeDl(props: YoutubeDownloadServiceProps) {
    const { downloadDir, title, onFinished, onSuccess } = props

    let hasBeenCancelled = false

    // ytsearch option found here https://askubuntu.com/a/731511/1013434 (not given in the youtube-dl docs ...)
    const downloadCommand = `youtube-dl --output "${downloadDir}/%(title)s.%(ext)s" --extract-audio --audio-format mp3 ytsearch1:"${title.replaceAll('"', '\\\"')}" --add-metadata --embed-thumbnail`


    const process = spawnCommandLineAsyncIO(downloadCommand, (stdout, stderr) => {

        onFinished()

        if (hasBeenCancelled) {
            hasBeenCancelled = false
            return
        }

        if (stderr) {
            global.logError(`The following error occured at youtube download attempt: ${stderr}. The used download Command was: ${downloadCommand}`)
            notifyYoutubeDownloadFailed()
            return
        }

        if (stdout) {
            const downloadPath = getDownloadPath(stdout)

            if (!downloadPath) {
                global.logError('downloadPath could not be determined from stdout. Most likely the download has failed')
                notifyYoutubeDownloadFailed()
                return
            }

            onSuccess(downloadPath)
            notifyYoutubeDownloadFinished({ downloadPath })

        }
    })


    function cancel() {
        hasBeenCancelled = true
        // it seems to be no problem to call this even after the process has already finished
        process.force_exit()
    }

    return { cancel }

}

function getDownloadPath(stdout: string) {
    const arrayOfLines = stdout.match(/[^\r\n]+/g);

    // there is only one line in stdout which gives the path of the downloaded mp3. This start with [ffmpeg] Destination ...
    const searchString = '[ffmpeg] Destination: '

    return arrayOfLines?.find(line => line.includes(searchString))
        ?.split(searchString)[1]
}