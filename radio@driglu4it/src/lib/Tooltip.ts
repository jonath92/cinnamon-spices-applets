import { addAppletRemovedFromPanelCleanup } from "../ui/RadioApplet/RadioAppletContainer"

const { Label } = imports.gi.St
const { uiGroup } = imports.ui.main
// @ts-ignore
const { registerClass } = imports.gi.GObject

export const Tooltip = registerClass({
    GTypeName: 'Tooltip',
}, class extends Label {

    private uiGroupActorAddedSignalId: number | null = null
    private panelEditSignalId: number | null = null

    _init(constructProperties = {}) {
        // @ts-ignore
        super._init({
            name: 'Tooltip', // needed for the style
            visible: false,
            ...constructProperties
        })
        uiGroup.add_child(this)

        this.uiGroupActorAddedSignalId = uiGroup.connect('actor-added', () => uiGroup.set_child_above_sibling(this, null))

        this.panelEditSignalId = global.settings.connect('changed::panel-edit-mode', () => this.visible = false)

        addAppletRemovedFromPanelCleanup(() => {
            this.destroy()
        })

    }

    destroy(): void {
        this.uiGroupActorAddedSignalId && uiGroup.disconnect(this.uiGroupActorAddedSignalId)
        this.panelEditSignalId && global.settings.disconnect(this.panelEditSignalId)
        super.disconnect
    }

    get visible() {
        return super.visible
    }

    set visible(value: boolean) {
        super.visible = global.settings.get_boolean('panel-edit-mode') ? false : value
    }

    get x() {
        return super.x
    }

    set x(value: number) {

        const { x: monitorLeft, width: monitorWidth } = __meta.monitor

        const valueLimited = Math.max(
            monitorLeft,
            Math.min(
                monitorLeft + monitorWidth - this.width,
                value
            )
        )

        // withour Math.floor, the tooltip text gets sometimes blur
        super.x = Math.floor(valueLimited)
    }

    get y() {
        return super.y
    }

    set y(value: number) {
        const { y: monitorTop, height: monitorHeight } = __meta.monitor

        const valueLimited = Math.max(
            monitorTop,
            Math.min(
                monitorTop + monitorHeight - this.height,
                value
            )
        )

        super.y = Math.floor(valueLimited)
    }

    set_x(value: number) {
        this.x = value
    }

    set_y(value: number) {
        this.y = value
    }

    set_position(x: number, y: number): void {
        this.x = x
        this.y = y
    }

}) as typeof imports.gi.St.Label