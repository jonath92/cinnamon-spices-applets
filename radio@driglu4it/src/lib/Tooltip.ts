const { Label } = imports.gi.St
const { uiGroup } = imports.ui.main

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
