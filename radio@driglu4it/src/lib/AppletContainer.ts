const { Applet, AllowedLayout } = imports.ui.applet
const { EventType } = imports.gi.Clutter
const { panelManager } = imports.ui.main
const { getAppletDefinition } = imports.ui.appletManager;
const { PanelLoc } = imports.ui.panel
const { Side } = imports.gi.St

interface Arguments {
    icon: imports.gi.St.Icon,
    label: imports.gi.St.Label,
    onClick: () => void,
    onScroll: (scrollDirection: imports.gi.Clutter.ScrollDirection) => void,
    onMiddleClick: () => void,
    onRightClick: () => void,
    onAppletMoved: () => void,
    onAppletRemoved: () => void
}

export function createAppletContainer(args: Arguments) {

    const {
        icon,
        label,
        onClick,
        onScroll,
        onMiddleClick,
        onAppletMoved,
        onAppletRemoved,
        onRightClick
    } = args

    const appletDefinition = getAppletDefinition({
        applet_id: __meta.instanceId,
    })

    const panel = panelManager.panels.find(panel =>
        panel?.panelId === appletDefinition.panelId
    ) as imports.ui.panel.Panel

    const panelLocOrientationMap = new Map<imports.ui.panel.PanelLoc, imports.gi.St.Side>([
        [ PanelLoc.bottom, Side.BOTTOM ],
        [ PanelLoc.left, Side.LEFT ],
        [ PanelLoc.right, Side.RIGHT ],
        [ PanelLoc.top, Side.TOP ]
    ])

    const orientation = panelLocOrientationMap.get(panel.panelPosition) as imports.gi.St.Side

    const applet = new Applet(__meta.orientation, panel.height, __meta.instanceId);

    let appletReloaded = false;

    [icon, label].forEach(widget => {
        applet.actor.add_child(widget)
    })

    applet.on_applet_clicked = onClick
    applet.on_applet_middle_clicked = onMiddleClick
    applet.setAllowedLayout(AllowedLayout.BOTH)

    applet.on_applet_reloaded = function () {
        appletReloaded = true
    }

    applet.on_applet_removed_from_panel = function () {
        appletReloaded ? onAppletMoved() : onAppletRemoved()
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