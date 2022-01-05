
import { createAppletContainer, getAppletTooltipPosition } from "../../lib/AppletContainer"
import { mpvHandler } from "../../services/mpv/MpvHandler"
import { createRadioAppletLabel } from "./RadioAppletLabel"
import { createRadioAppletTooltip } from "./RadioAppletTooltip"
import { createRadioAppletIcon } from "./RadioAppletIcon"
import { VOLUME_DELTA } from "../../consts"
import { createRadioPopupMenu } from "../RadioPopupMenu/RadioPopupMenu"
import { installMpvWithMpris } from "../../services/mpv/CheckInstallation"
import { notify } from "../Notifications/GenericNotification"
import { createYoutubeDownloadIcon } from "./YoutubeDownloadIcon"

const { ScrollDirection } = imports.gi.Clutter;

const cleanupFunctions: (() => void)[] = []

export function addAppletRemovedFromPanelCleanup(cleanupFunc: () => void){
    cleanupFunctions.push(cleanupFunc)
}

export function createRadioAppletContainer() {

    let installationInProgress = false

    // the cleanupFunctions surrives on Applet Reload and therefore must be emptied !
    while (cleanupFunctions.length) cleanupFunctions.pop() 
    
    const appletContainer = createAppletContainer({
        onMiddleClick: () => mpvHandler.togglePlayPause(),
        onMoved: () => {
            // Needed to hide error onDrag
            appletContainer.actor.disconnect(hoverSignalId)
            global.log('on moved called')
            mpvHandler.deactivateAllListener()
            // popupMenu.destroy()
            cleanupFunctions.forEach(cleanup => cleanup())
        },
        onRemoved: handleAppletRemoved,
        onClick: handleClick,
        onRightClick: () => {
            // popupMenu?.close()
            appletTooltip?.hide()
        },
        onScroll: handleScroll
    });

    [createRadioAppletIcon(), createYoutubeDownloadIcon(), createRadioAppletLabel()].forEach(widget => {
        appletContainer.actor.add_child(widget)
    })

    const appletTooltip = createRadioAppletTooltip()

    const popupMenu = createRadioPopupMenu({ launcher: appletContainer.actor })

    popupMenu.connect('notify::visible', () => {
        popupMenu.visible && appletTooltip.hide()
    })

    function handleAppletRemoved() {
        global.log('on Removed called')
        mpvHandler?.deactivateAllListener()
        mpvHandler?.stop()

        cleanupFunctions.forEach(cleanup => cleanup())
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

    const hoverSignalId = appletContainer.actor.connect('notify::hover', () => {

        appletTooltip.visible = appletContainer.actor.hover && !popupMenu.visible

        if (!appletTooltip.visible) return

        const newPos = getAppletTooltipPosition({
            appletTooltip
        })

        appletTooltip.set_position(...newPos)

    })


    return appletContainer
}