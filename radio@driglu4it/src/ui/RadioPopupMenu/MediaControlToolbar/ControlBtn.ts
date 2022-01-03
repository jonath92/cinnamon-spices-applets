import { createActivWidget } from "../../../lib/ActivWidget";
import { createTooltip } from "../../../lib/Tooltip";

const { Button, Icon, IconType } = imports.gi.St;
const { Tooltip } = imports.ui.tooltips;

interface Arguments {
    iconName?: string,
    tooltipTxt?: string,
    onClick: { (): void },
}

export function createControlBtn(args: Arguments) {

    const {
        iconName,
        tooltipTxt,
        onClick
    } = args

    const icon = new Icon({
        icon_type: IconType.SYMBOLIC,
        icon_name: iconName || '',
        style_class: 'popup-menu-icon' // this specifies the icon-size
    })

    const btn = new Button({
        reactive: true,
        can_focus: true,
        // It is challenging to get a reasonable style on all themes. I have tried using the 'sound-player-overlay' class but didn't get it working. However might be possible anyway.  
        style_class: "popup-menu-item",
        style: "width:20px; padding:10px!important",
        child: icon
    })

    createActivWidget({
        widget: btn,
        onActivated: onClick
    })

    const tooltip = createTooltip({
        text: tooltipTxt || ''
    })

    btn.connect('notify::hover', () => {
        tooltip.visible = btn.hover

        const [xPos, yPos, modifier] = global.get_pointer()

        tooltip.set_position(xPos, yPos)
    })

    // const tooltip = new Tooltip(btn, tooltipTxt || '')

    return {
        actor: btn,
        icon,
        tooltip
    }
}