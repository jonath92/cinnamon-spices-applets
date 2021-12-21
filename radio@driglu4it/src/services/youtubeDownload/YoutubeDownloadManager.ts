import { notifyYoutubeDownloadFailed } from "../../ui/Notifications/YoutubeDownloadFailedNotification";
import { notifyYoutubeDownloadFinished } from "../../ui/Notifications/YoutubeDownloadFinishedNotification";
import { notifyYoutubeDownloadStarted } from "../../ui/Notifications/YoutubeDownloadStartedNotification";
import { configs } from "../Config";
import { mpvHandler } from "../mpv/MpvHandler";
import { downloadWithYoutubeDl } from "./youtubeDl";

const { get_tmp_dir, get_home_dir, build_filenamev } = imports.gi.GLib
const { File, FileCopyFlags } = imports.gi.Gio

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

    const { cancel } = downloadWithYoutubeDl({
        title,
        downloadDir: get_tmp_dir(),
        onFinished: () => {
            downloadingSongs = downloadingSongs.filter(downloadingSong => downloadingSong.title !== title)
            downloadingSongsChangedListener.forEach(listener => listener(downloadingSongs))
        },
        onSuccess: (downloadPath) => {
            const tmpFile = File.new_for_path(downloadPath)
            const fileName = tmpFile.get_basename()
            global.log(`fileName`, fileName)

            try {
                // @ts-ignore
                tmpFile.move(File.parse_name(`${music_dir_absolut}/${fileName}`), FileCopyFlags.BACKUP, null, null)

            } catch (error) {
                global.log(error)
                // TODO handle this one
                // JS ERROR: Gio.IOErrorEnum: Error moving file /tmp/Elton John, Dua Lipa - Cold Heart (PNAU Remix) (Official Video).mp3: File exists
            }

            global.log(downloadPath)
        }
    })

    notifyYoutubeDownloadStarted({ title, onCancelClicked: () => cancel() })
    downloadingSongs.push({ title, cancelDownload: cancel })
    downloadingSongsChangedListener.forEach(listener => listener(downloadingSongs))
}


export function addDownloadingSongsChangeListener(callback: (downloadingSongs: DownloadingSong[]) => void) {
    downloadingSongsChangedListener.push(callback)
}
