
import { createConfig } from "../../Config"
import { createAppletContainer } from "../../lib/AppletContainer"
import { createMpvHandler } from "../../mpv/MpvHandler"
import { createAppletLabel } from "./AppletLabel"
import { createAppletTooltip } from "./AppletTooltip"
import { createRadioAppletIcon } from "./RadioAppletIcon"

interface Props {
    configs: ReturnType<typeof createConfig>,
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createRadioAppletContainer(props: Props) {

    const { configs, mpvHandler } = props

    const appletContainer = createAppletContainer({
        icon: createRadioAppletIcon({configs, mpvHandler}), 
        label: createAppletLabel({configs, mpvHandler}), 
        onMiddleClick: () => mpvHandler.togglePlayPause(),
        onAppletMoved: () => mpvHandler.deactivateAllListener(), 
        onAppletRemoved: () => {}, 
        onClick: () => {}, 
        onRightClick: () => {}, 
        onScroll: () => {}
    })

    // for some weird reasion, it is doesn't work to create the tooltip here but it works when calling in index.ts :-/
    //createAppletTooltip({mpvHandler, appletContainer})
    
    return appletContainer

}