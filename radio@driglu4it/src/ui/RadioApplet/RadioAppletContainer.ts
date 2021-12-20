
import { createAppletContainer } from "../../lib/AppletContainer"
import { mpvHandler } from "../../mpv/MpvHandler"
import { createRadioAppletLabel } from "./RadioAppletLabel"
import { createRadioAppletTooltip } from "./RadioAppletTooltip"
import { createRadioAppletIcon } from "./RadioAppletIcon"
import { VOLUME_DELTA } from "../../consts"
import { createRadioPopupMenu } from "../RadioPopupMenu/RadioPopupMenu"
import { installMpvWithMpris } from "../../mpv/CheckInstallation"
import { notify } from "../Notifications/GenericNotification"

const { ScrollDirection } = imports.gi.Clutter;

export function createRadioAppletContainer() {

    let installationInProgress = false

    const appletContainer = createAppletContainer({
        onMiddleClick: () => mpvHandler.togglePlayPause(),
        onMoved: () => mpvHandler.deactivateAllListener(),
        onRemoved: handleAppletRemoved,
        onClick: handleClick,
        onRightClick: () => popupMenu?.close(),
        onScroll: handleScroll
    });

    [createRadioAppletIcon(), createRadioAppletLabel()].forEach(widget => {
        appletContainer.actor.add_child(widget)
    })

    createRadioAppletTooltip({ appletContainer })

    const popupMenu = createRadioPopupMenu({ launcher: appletContainer.actor })

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