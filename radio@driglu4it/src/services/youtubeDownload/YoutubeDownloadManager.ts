import { APPLET_SITE } from "../../consts";
import { notifyError } from "../../lib/notify";
import { YoutubeClis } from "../../types";
import { notifyYoutubeDownloadFinished } from "../../ui/Notifications/YoutubeDownloadFinishedNotification";
import { notifyYoutubeDownloadStarted } from "../../ui/Notifications/YoutubeDownloadStartedNotification";
import { configs } from "../Config";
import { mpvHandler } from "../mpv/MpvHandler";
import { downloadWithYoutubeDl } from "./YoutubeDl";
import { downloadWithYtDlp } from "./YtDlp";
const { spawnCommandLine } = imports.misc.util


const { get_tmp_dir, get_home_dir } = imports.gi.GLib
const { File, FileCopyFlags } = imports.gi.Gio

export interface YoutubeDownloadServiceProps {
    downloadDir: string
    title: string
    onFinished: () => void,
    onSuccess: (downloadPath: string) => void,
    onError: (errorMessage: string, downloadCommand: string) => void
}

export interface YoutubeDownloadServiceReturnType {
    cancel: () => void
}

interface DownloadingSong {
    title: string,
    cancelDownload: () => void
}

const notifyYoutubeDownloadFailed = (props: { youtubeCli: YoutubeClis, errorMessage: string }) => {

    const { youtubeCli, errorMessage } = props

    notifyError(`Couldn't download Song from Youtube due to an Error. Make Sure you have the newest version of ${youtubeCli} installed. 
    \n<b>Important:</b> Don't use apt for the installation but follow the installation instruction given on the Radio Applet Site in the Cinnamon Store instead`, errorMessage, {
        additionalBtns: [
            {
                text: 'View Installation Instruction',
                onClick: () => spawnCommandLine(`xdg-open ${APPLET_SITE} `)
            }
        ]
    })
}

export let downloadingSongs: DownloadingSong[] = []

const downloadingSongsChangedListener: ((downloadingSongs: DownloadingSong[]) => void)[] = []

export function downloadSongFromYoutube() {

    const title = mpvHandler.getCurrentTitle()
    const downloadDir = configs.settingsObject.musicDownloadDir
    const youtubeCli = configs.settingsObject.youtubeCli

    const music_dir_absolut = downloadDir.charAt(0) === '~' ?
        downloadDir.replace('~', get_home_dir()) : downloadDir

    if (!title) return

    const sameSongIsDownloading = downloadingSongs.find(downloadingSong => {
        return downloadingSong.title === title
    })

    if (sameSongIsDownloading)
        return

    const downloadProps: YoutubeDownloadServiceProps = {
        title,
        downloadDir: get_tmp_dir(),
        onError: (errorMessage, downloadCommand: string,) => {
            notifyYoutubeDownloadFailed({ youtubeCli, errorMessage: `The following error occured at youtube download attempt: ${errorMessage}. The used download Command was: ${downloadCommand}` })
        },
        onFinished: () => {
            downloadingSongs = downloadingSongs.filter(downloadingSong => downloadingSong.title !== title)
            downloadingSongsChangedListener.forEach(listener => listener(downloadingSongs))
        },
        onSuccess: (downloadPath) => {
            const tmpFile = File.new_for_path(downloadPath)
            const fileName = tmpFile.get_basename()
            const targetPath = `${music_dir_absolut}/${fileName}`
            const targetFile = File.parse_name(targetPath)

            if (targetFile.query_exists(null)) {
                notifyYoutubeDownloadFinished({ downloadPath: targetPath, fileAlreadExist: true })
                return
            }

            try {
                // @ts-ignore
                tmpFile.move(File.parse_name(targetPath), FileCopyFlags.BACKUP, null, null)
                notifyYoutubeDownloadFinished({ downloadPath: targetPath })

            } catch (error) {
                const errorMessage = error instanceof imports.gi.GLib.Error ? error.message : 'Unknown Error Type'
                notifyYoutubeDownloadFailed({ youtubeCli, errorMessage: `Failed to copy download from tmp dir. The following error occurred: ${errorMessage}` })
            }

        }
    }

    const { cancel } = youtubeCli === 'youtube-dl' ?
        downloadWithYoutubeDl(downloadProps) :
        downloadWithYtDlp(downloadProps)

    notifyYoutubeDownloadStarted({
        title, onCancelClicked: cancel
    })

    downloadingSongs.push({ title, cancelDownload: cancel })
    downloadingSongsChangedListener.forEach(listener => listener(downloadingSongs))
}


export function addDownloadingSongsChangeListener(callback: (downloadingSongs: DownloadingSong[]) => void) {
    downloadingSongsChangedListener.push(callback)
}
