import { createPlayPauseButton } from "./PlayPauseButton";
import { createCopyButton } from './CopyButton'
import { createStopBtn } from "./StopButton";
import { createDownloadButton } from "./DownloadButton";
import { createJumpToLastSongBtn } from "./JumpToLastSongBtn";

const { BoxLayout } = imports.gi.St
const { ActorAlign } = imports.gi.Clutter

export const createMediaControlToolbar = () => {

    const toolbar = new BoxLayout({
        style_class: "radio-applet-media-control-toolbar", // todo is the style class needed??
        x_align: ActorAlign.CENTER
    });


    [
        createPlayPauseButton(), 
        createDownloadButton(), 
        createCopyButton(), 
        createStopBtn(), 
        createJumpToLastSongBtn()
    ].forEach(btn =>
        toolbar.add_child(btn)
    )

    return toolbar
}
