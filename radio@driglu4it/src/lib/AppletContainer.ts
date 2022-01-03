const { Applet, AllowedLayout } = imports.ui.applet
const { EventType } = imports.gi.Clutter
const { PanelLoc } = imports.ui.panel

const { layoutManager } = imports.ui.main

interface Arguments {
    onClick: () => void,
    onScroll: (scrollDirection: imports.gi.Clutter.ScrollDirection) => void,
    onMiddleClick: () => void,
    onRightClick: () => void,
    onMoved: () => void,
    onRemoved: () => void
}

export function createAppletContainer(args: Arguments) {

    const {
        onClick,
        onScroll,
        onMiddleClick,
        onMoved,
        onRemoved,
        onRightClick
    } = args

    const applet = new Applet(__meta.orientation, __meta.panel.height, __meta.instanceId);

    let appletReloaded = false;

    applet.on_applet_clicked = () => {
        onClick()
        return true
    }

    applet.on_applet_middle_clicked = () => {
        onMiddleClick()
        return true
    }

    applet.setAllowedLayout(AllowedLayout.BOTH)

    applet.on_applet_reloaded = function () {
        appletReloaded = true
    }

    applet.on_applet_removed_from_panel = function () {
        appletReloaded ? onMoved() : onRemoved()
        appletReloaded = false
    }

    applet.actor.connect('event', (actor, event) => {
        if (event.type() !== EventType.BUTTON_PRESS) return false

        if (event.get_button() === 3) {
            onRightClick()
        }
        return false

    })

    applet.actor.connect('scroll-event', (actor, event) => {
        onScroll(event.get_scroll_direction())

        return false
    })

    return applet
}


type TooltipPos = Parameters<InstanceType<typeof imports.gi.St.Label>['set_position']>

/** * 
 * Returns the top and left position for a tooltip used for applets. This method should only be called when the pointer is placed on the applet (e.g. by connection to the hover signal). The position is calculated with the help of the pointer position and the panel the applet is placed on (e.g. on a bottom panel, the tooltip is shown above the pointer position and on top panel, the tooltip is sown below the panel )
 * 
 */
export function getAppletTooltipPosition(props: { appletTooltip: imports.gi.St.Label }): TooltipPos {

    const { appletTooltip } = props

    const [pointerX, pointerY] = global.get_pointer()

    const {
        x: monitorLeft,
        width: monitorWidth,
        y: monitorTop,
        height: monitorHeight
    } = layoutManager.findMonitorForActor(__meta.panel.actor)

    const { height: panelHeight } = __meta.panel

    const monitorRight = monitorLeft + monitorWidth
    const monitorBottom = monitorTop + monitorHeight
    const tooltipWidth = appletTooltip.width
    const tooltipHeight = appletTooltip.height

    // withour Math.floor, the tooltip text gets sometimes blur
    const xHoricontalPanels = Math.floor(Math.max(
        monitorLeft,
        Math.min(
            pointerX - tooltipWidth / 2,
            monitorRight - tooltipWidth
        )
    ))

    const yVertcialPanels = Math.floor(Math.max(
        monitorTop,
        Math.min(
            pointerY - tooltipHeight / 2,
            monitorBottom
        )
    ))

    const panelLocTooltipPos: Record<imports.ui.panel.PanelLoc, TooltipPos> = {
        [PanelLoc.top]: [xHoricontalPanels, monitorTop + panelHeight],
        [PanelLoc.bottom]: [xHoricontalPanels, monitorBottom - panelHeight - tooltipHeight],
        [PanelLoc.left]: [monitorLeft + panelHeight, yVertcialPanels],
        [PanelLoc.right]: [monitorRight - panelHeight - appletTooltip.width, yVertcialPanels]
    }

    return panelLocTooltipPos[__meta.panel.panelPosition]
}
