import { STOP_ICON_NAME } from "../../../consts";
import { createMpvHandler } from "../../../mpv/MpvHandler";
import { createControlBtn } from "./ControlBtn";

interface Arguments {
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createStopBtn(args: Arguments) {

    const {
        mpvHandler: {
            stop
        }
    } = args

    const stopBtn = createControlBtn({
        iconName: STOP_ICON_NAME,
        tooltipTxt: "Stop",
        onClick: stop
    });

    return stopBtn.actor
}