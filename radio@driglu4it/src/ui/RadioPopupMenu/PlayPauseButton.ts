import { PAUSE_ICON_NAME, PLAY_ICON_NAME } from "../../consts"
import { createMpvHandler } from "../../mpv/MpvHandler"
import { PlayPause } from "../../types"
import { createControlBtn } from "./ControlBtn"

interface Arguments {
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createPlayPauseButton(args: Arguments) {

    const {
        mpvHandler: {
            getPlaybackStatus, 
            togglePlayPause, 
            addPlaybackStatusChangeHandler
        }
    } = args

    const radioStarted = () => {
        return getPlaybackStatus() === 'Playing' ||  getPlaybackStatus() === 'Loading'
    }

    const controlBtn = createControlBtn({
        iconName: PAUSE_ICON_NAME, // TOOD: this is actually ignored as set correclty in initUpdateControlBtn 
        tooltipTxt: 'Pause', // TODO: same as above
        onClick: () => togglePlayPause()
    })

    function initUpdateControlBtn(){
        if (radioStarted()){
            controlBtn.icon.set_icon_name(PAUSE_ICON_NAME)
            controlBtn.tooltip.set_text('Pause')
        } else {
            controlBtn.icon.set_icon_name(PLAY_ICON_NAME)
            controlBtn.tooltip.set_text('Play')
        }
    }



    addPlaybackStatusChangeHandler(() => {
        initUpdateControlBtn()
    })

    initUpdateControlBtn()

    return controlBtn.actor
}