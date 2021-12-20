import { notifyYoutubeDownloadFailed } from "../ui/Notifications/YoutubeDownloadFailedNotification";
import { notifyYoutubeDownloadFinished } from "../ui/Notifications/YoutubeDownloadFinishedNotification";
import { notifyYoutubeDownloadStarted } from "../ui/Notifications/YoutubeDownloadStartedNotification";
import { configs } from "./Config";
import { mpvHandler } from "./mpv/MpvHandler";

interface DownloadingSong {
    title: string,
    cancelDownload: () => void
}

const { spawnCommandLineAsyncIO } = imports.misc.util;
const { get_home_dir } = imports.gi.GLib;

export let downloadingSongs: DownloadingSong[] = []

const downloadingSongsChangedListener: ((downloadingSongs: DownloadingSong[]) => void)[] = []

export function downloadSongFromYoutube() {

    const title = mpvHandler.getCurrentTitle()
    const downloadDir = configs.settingsObject.musicDownloadDir

    if (!title) return

    const sameSongIsDownloading = downloadingSongs.find(downloadingSong => {
        return downloadingSong.title === title
    })

    if (sameSongIsDownloading)
        return

    notifyYoutubeDownloadStarted({ title, onCancelClicked: () => cancel() })
    downloadingSongs.push({ title, cancelDownload: cancel })
    downloadingSongsChangedListener.forEach(listener => listener(downloadingSongs))

    let hasBeenCancelled = false

    // When using the default value of the settings, the dir starts with ~ what can't be understand when executing command. 
    // After changing the value in the configs dialogue, the value starts with file:// what youtube-dl can't handle. Saving to network directories (e.g. ftp) doesn't work 
    const music_dir_absolut =
        downloadDir.replace('~', get_home_dir()).replace('file://', '')

    // ytsearch option found here https://askubuntu.com/a/731511/1013434 (not given in the youtube-dl docs ...)
    const downloadCommand = `youtube-dl --output "${music_dir_absolut}/%(title)s.%(ext)s" --extract-audio --audio-format mp3 ytsearch1:"${title.replaceAll('"', '\\\"')}" --add-metadata --embed-thumbnail`

    const process = spawnCommandLineAsyncIO(downloadCommand, (stdout, stderr) => {

        global.log('stdout: ', stdout)
        global.log('stderr: ', stderr)

        downloadingSongs = downloadingSongs.filter(downloadingSong => downloadingSong.title !== title)
        downloadingSongsChangedListener.forEach(listener => listener(downloadingSongs))

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

            if (!downloadPath) {
                global.logError('downloadPath could not be determined from stdout. Most likely the download has failed')
                notifyYoutubeDownloadFailed()
                return
            }

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

export function addDownloadingSongsChangeListener(callback: (downloadingSongs: DownloadingSong[]) => void) {
    downloadingSongsChangedListener.push(callback)
}
