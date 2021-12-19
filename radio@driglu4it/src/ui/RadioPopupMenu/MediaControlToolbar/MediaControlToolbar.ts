import { createMpvHandler } from "../../../mpv/MpvHandler";
import { createPlayPauseButton } from "./PlayPauseButton";
import { createCopyButton } from './CopyButton'
import { createStopBtn } from "./StopButton";

const { BoxLayout } = imports.gi.St
const { ActorAlign } = imports.gi.Clutter

interface Arguments {
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export const createMediaControlToolbar = (args: Arguments) => {

    const {
        mpvHandler
    } = args

    const toolbar = new BoxLayout({
        style_class: "radio-applet-media-control-toolbar", // todo is the style class needed??
        x_align: ActorAlign.CENTER
    });

    const playPauseBtn = createPlayPauseButton({
        mpvHandler
    });

    const copyBtn = createCopyButton({
        mpvHandler
    });

    const stopBtn = createStopBtn({
        mpvHandler
    });


    [playPauseBtn, copyBtn, stopBtn].forEach(btn =>
        toolbar.add_child(btn)
    )

    return toolbar
}
