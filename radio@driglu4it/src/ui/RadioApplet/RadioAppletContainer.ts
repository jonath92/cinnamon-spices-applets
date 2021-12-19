
import { createConfig } from "../../Config"
import { createAppletContainer } from "../../lib/AppletContainer"
import { createMpvHandler } from "../../mpv/MpvHandler"
import { createRadioAppletLabel } from "./RadioAppletLabel"
import { createRadioAppletTooltip } from "./RadioAppletTooltip"
import { createRadioAppletIcon } from "./RadioAppletIcon"
import { VOLUME_DELTA } from "../../consts"
import { createRadioPopupMenu } from "../RadioPopupMenu/RadioPopupMenu"
import { installMpvWithMpris } from "../../mpv/CheckInstallation"
import { notify } from "../Notifications/GenericNotification"

const { ScrollDirection } = imports.gi.Clutter;

interface Props {
    configs: ReturnType<typeof createConfig>,
    mpvHandler: ReturnType<typeof createMpvHandler>
}

export function createRadioAppletContainer(props: Props) {

    const { configs, mpvHandler } = props

    let installationInProgress = false

    const appletContainer = createAppletContainer({
        icon: createRadioAppletIcon({ configs, mpvHandler }),
        label: createRadioAppletLabel({ configs, mpvHandler }),
        onMiddleClick: () => mpvHandler.togglePlayPause(),
        onMoved: () => mpvHandler.deactivateAllListener(),
        onRemoved: handleAppletRemoved,
        onClick: handleClick,
        onRightClick: () => popupMenu?.close(),
        onScroll: handleScroll
    })

    createRadioAppletTooltip({ mpvHandler, appletContainer })

    const popupMenu = createRadioPopupMenu({ launcher: appletContainer.actor, mpvHandler, configs })

    function handleAppletRemoved() {
        mpvHandler?.deactivateAllListener()
        mpvHandler?.stop()
    }

    function handleScroll(scrollDirection: imports.gi.Clutter.ScrollDirection) {
        const volumeChange =
            scrollDirection === ScrollDirection.UP ? VOLUME_DELTA : -VOLUME_DELTA
        mpvHandler.increaseDecreaseVolume(volumeChange)
    }

    async function handleClick() {
        if (installationInProgress) return

        try {
            installationInProgress = true
            await installMpvWithMpris()
            popupMenu?.toggle()
        } catch (error) {
            const notificationText = "Couldn't start the applet. Make sure mpv is installed and the mpv mpris plugin saved in the configs folder."
            notify({ text: notificationText })
            global.logError(error)
        } finally {
            installationInProgress = false
        }

    }

    return appletContainer
}