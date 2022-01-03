import { DEFAULT_TOOLTIP_TXT } from "../../consts"
import { createTooltip } from "../../lib/Tooltip"
import { mpvHandler } from "../../services/mpv/MpvHandler"
import { addDownloadingSongsChangeListener, downloadingSongs } from "../../services/youtubeDownload/YoutubeDownloadManager"

const { PanelItemTooltip } = imports.ui.tooltips
const { markup_escape_text } = imports.gi.GLib
const { Text } = imports.gi.Clutter

interface Arguments {
    appletContainer: imports.ui.applet.Applet
}

export function createRadioAppletTooltip(args: Arguments) {

    const {
        appletContainer,
    } = args

    // const tooltip = new PanelItemTooltip(appletContainer, undefined, __meta.orientation)
    // tooltip['_tooltip'].set_style("text-align: left;")

    const tooltip = createTooltip({
        style: 'text-align: left;'
    })

    const setRefreshTooltip = () => {

        if (mpvHandler.getPlaybackStatus() === 'Stopped') {
            tooltip.set_text(DEFAULT_TOOLTIP_TXT)
            return
        }

        const lines = [
            [`<b>Volume</b>`],
            [`${mpvHandler.getVolume()?.toString()} %`],
            [],
            ['<b>Songtitle</b>'],
            [`${markup_escape_text(mpvHandler.getCurrentTitle() || '', -1)}`],
            [],
            ['<b>Station</b>'],
            [`${markup_escape_text(mpvHandler.getCurrentChannelName() || '', -1)} `],
        ];

        if (downloadingSongs.length !== 0) {
            [
                [],
                ['<b>Songs downloading:</b>'],
                ...downloadingSongs.map(downloadingSong => [markup_escape_text(downloadingSong.title, -1)])
            ].forEach(line => lines.push(line))
        }

        const markupTxt = lines.join(`\n`)

        tooltip.clutter_text.set_markup(markupTxt)

        // tooltip.set_text(markupTxt)
    };

    [
        mpvHandler.addVolumeChangeHandler,
        mpvHandler.addPlaybackStatusChangeHandler,
        mpvHandler.addTitleChangeHandler,
        mpvHandler.addChannelChangeHandler,
        addDownloadingSongsChangeListener
    ].forEach(cb => cb(setRefreshTooltip))

    setRefreshTooltip()

    return tooltip
}