import { notifyYoutubeDownloadFailed } from "../../ui/Notifications/YoutubeDownloadFailedNotification";
import { notifyYoutubeDownloadFinished } from "../../ui/Notifications/YoutubeDownloadFinishedNotification";
import { notifyYoutubeDownloadStarted } from "../../ui/Notifications/YoutubeDownloadStartedNotification";
import { configs } from "../Config";
import { mpvHandler } from "../mpv/MpvHandler";
import { downloadWithYoutubeDl } from "./YoutubeDl";
import { downloadWithYtDlp } from "./YtDlp";

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

export let downloadingSongs: DownloadingSong[] = []

const downloadingSongsChangedListener: ((downloadingSongs: DownloadingSong[]) => void)[] = []

export function downloadSongFromYoutube() {

    const title = mpvHandler.getCurrentTitle()
    const downloadDir = configs.settingsObject.musicDownloadDir

    let music_dir_absolut = downloadDir

    if (music_dir_absolut.charAt(0) === '~') {
        music_dir_absolut = downloadDir.replace('~', get_home_dir())
    }

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
            global.logError(`The following error occured at youtube download attempt: ${errorMessage}. The used download Command was: ${downloadCommand}`)
            notifyYoutubeDownloadFailed()
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
            
            if (targetFile.query_exists(null)){
                notifyYoutubeDownloadFinished({ downloadPath: targetPath, fileAlreadExist: true })
                return
            }

            // @ts-ignore
            tmpFile.move(File.parse_name(targetPath), FileCopyFlags.BACKUP, null, null)

            notifyYoutubeDownloadFinished({ downloadPath: targetPath })

            // try {


            // } catch (error) {

            //     // if ((error as string).startsWith('Error moving file')){
            //     //     global.log('file exist')
            //     // }
            //     // TODO handle this one
            //     // JS ERROR: Gio.IOErrorEnum: Error moving file /tmp/Elton John, Dua Lipa - Cold Heart (PNAU Remix) (Official Video).mp3: File exists
            // }

        }
    }

    const { cancel } = configs.settingsObject.youtubeCli === 'youtube-dl' ?
        downloadWithYoutubeDl(downloadProps) :
        downloadWithYtDlp(downloadProps)

    notifyYoutubeDownloadStarted({ title, onCancelClicked: () => cancel() })
    downloadingSongs.push({ title, cancelDownload: cancel })
    downloadingSongsChangedListener.forEach(listener => listener(downloadingSongs))
}


export function addDownloadingSongsChangeListener(callback: (downloadingSongs: DownloadingSong[]) => void) {
    downloadingSongsChangedListener.push(callback)
}
