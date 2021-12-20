import { createActivWidget } from "./ActivWidget";
import { limitString } from "../functions/limitString"

const { Icon, IconType, Label, BoxLayout } = imports.gi.St
const { Point } = imports.gi.Clutter

interface Arguments {
    initialText?: string | undefined,
    iconName?: string,
    onActivated?: () => void
    maxCharNumber: number,
}

export function createIconMenuItem(args: Arguments) {

    const {
        initialText,
        maxCharNumber,
        iconName,
        onActivated
    } = args

    const icon = new Icon({
        icon_type: IconType.SYMBOLIC,
        style_class: 'popup-menu-icon',
        pivot_point: new Point({ x: 0.5, y: 0.5 })
        
    })

    const label = new Label({})

    const container = new BoxLayout({
        style_class: 'popup-menu-item'
    })

    iconName && setIconName(iconName)
    container.add_child(label)
    initialText && setText(initialText)

    function setIconName(name: string | null | undefined) {

        if (!name) {
            container.remove_child(icon)
            return
        }

        icon.icon_name = name

        if (container.get_child_at_index(0) !== icon)
            container.insert_child_at_index(icon, 0)
    }


    function setText(text: string) {
        const labelText = text || ' '
        label.set_text(limitString(labelText, maxCharNumber))
    }

    onActivated && createActivWidget({ widget: container, onActivated });

    return {
        actor: container,
        setIconName,
        setText, 
        getIcon: () => icon
    }


}