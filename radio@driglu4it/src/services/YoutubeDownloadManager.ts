import { notifyYoutubeDownloadFailed } from "../ui/Notifications/YoutubeDownloadFailedNotification";
import { notifyYoutubeDownloadFinished } from "../ui/Notifications/YoutubeDownloadFinishedNotification";
import { notifyYoutubeDownloadStarted } from "../ui/Notifications/YoutubeDownloadStartedNotification";
import { configs } from "./Config";
import { mpvHandler } from "./mpv/MpvHandler";

const { spawnCommandLineAsyncIO } = imports.misc.util;
const { get_home_dir } = imports.gi.GLib;

export let currentDownloadingSongs: string[] = []

const currentDownloadingSongsChangedListener: ((downloadingSongs: string[]) => void)[] = []

export function downloadSongFromYoutube() {

    const title = mpvHandler.getCurrentTitle()
    const downloadDir = configs.settingsObject.musicDownloadDir

    if (!title) return

    const sameSongIsDownloading = currentDownloadingSongs.find(downloadingTitle => {
        return downloadingTitle === title
    })

    if (sameSongIsDownloading)
        return

    notifyYoutubeDownloadStarted({ title, onCancelClicked: () => cancel() })
    currentDownloadingSongs.push(title)
    currentDownloadingSongsChangedListener.forEach(listener => listener(currentDownloadingSongs))

    let hasBeenCancelled = false

    // When using the default value of the settings, the dir starts with ~ what can't be understand when executing command. 
    // After changing the value in the configs dialogue, the value starts with file:// what youtube-dl can't handle. Saving to network directories (e.g. ftp) doesn't work 
    const music_dir_absolut =
        downloadDir.replace('~', get_home_dir()).replace('file://', '')

    // ytsearch option found here https://askubuntu.com/a/731511/1013434 (not given in the youtube-dl docs ...)
    const downloadCommand = `youtube-dl --output "${music_dir_absolut}/%(title)s.%(ext)s" --extract-audio --audio-format mp3 ytsearch1:"${title.replaceAll('"', '\\\"')}" --add-metadata --embed-thumbnail`

    const process = spawnCommandLineAsyncIO(downloadCommand, (stdout, stderr) => {

        currentDownloadingSongs = currentDownloadingSongs.filter(downloadingTitle => downloadingTitle !== title)
        currentDownloadingSongsChangedListener.forEach(listener => listener(currentDownloadingSongs))

        if (hasBeenCancelled) {
            hasBeenCancelled = false
            return
        }

        if (stderr) {
            global.logError(`The following error occured at youtube download attempt: ${stderr}. The used download Command was: ${downloadCommand}`)
            notifyYoutubeDownloadFailed()
        }

        if (stdout) {
            const downloadPath = getDownloadPath(stdout)

            if (!downloadPath) throw new Error('File not saved')
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

export function addDownloadingSongsChangeListener(callback: (downloadingSongs: string[]) => void) {
    currentDownloadingSongsChangedListener.push(callback)
}
