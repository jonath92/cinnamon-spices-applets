const { Label } = imports.gi.St
const { uiGroup } = imports.ui.main
// @ts-ignore
const { registerClass } = imports.gi.GObject

export function createTooltip(props?: ConstructorParameters<typeof Label>[0]) {

    const tooltip = new Label({
        name: 'Tooltip', // needed for the style
        visible: false,
        ...props
    })

    uiGroup.add_child(tooltip)

    uiGroup.connect('actor-added', () => uiGroup.set_child_above_sibling(tooltip, null))

    return tooltip
}


export const Tooltip = registerClass({
    GTypeName: 'Tooltip',
}, class extends Label {
    _init(constructProperties = {}) {
        // @ts-ignore
        super._init({
            name: 'Tooltip', // needed for the style
            visible: false,
            ...constructProperties
        })
        uiGroup.add_child(this)

        // TODO: hide tooltip on panel edit mode

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

    set y(value:number) {
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