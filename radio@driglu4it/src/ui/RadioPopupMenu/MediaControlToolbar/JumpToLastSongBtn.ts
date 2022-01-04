import { mpvHandler } from "../../../services/mpv/MpvHandler";
import { createControlBtn } from "./ControlBtn";
import { COPY_ICON_NAME } from "../../../consts";

export function createJumpToLastSongBtn() {
    const { jumpToLastTitle } = mpvHandler

    const controlBtn = createControlBtn({
        iconName: COPY_ICON_NAME, 
        tooltipTxt: 'jump to last Song', 
        // TODO: it should be throttled
        onClick: jumpToLastTitle
    })

    return controlBtn.actor
}