import { createPopupMenu } from "cinnamonpopup";
import { createSeparatorMenuItem } from "../lib/PopupSeperator";
import { addCleanupFunction } from "./AppletContainer";
import { createCalendar } from "./Calendar";
import { createCardContainer } from "./CardContainer";
import { DummyButton } from "./DummyButton";

const { BoxLayout, Bin, Button, Align, Label } = imports.gi.St

interface Arguments {
    launcher: imports.gi.St.BoxLayout
}

let popupMenu: ReturnType<typeof createPopupMenu> | null = null

function createSimpleItem(text: string){
    const popupMenuItem = new BoxLayout({
        style_class: 'popup-menu-item',
    })

    const label = new Label({
        text
    })

    popupMenuItem.add_child(label)

    return popupMenuItem
}



export function getCalendarPopupMenu(args: Arguments): { toggle: ReturnType<typeof createPopupMenu>["toggle"] } {

    const {
        launcher
    } = args

    if (popupMenu) {
        return { toggle: popupMenu.toggle }
    }

    popupMenu = createPopupMenu({ launcher })

    const mainContainer = new BoxLayout()
    mainContainer.add_child(createCardContainer())
    mainContainer.add_child(createCalendar())

    popupMenu.add_child(mainContainer)

    popupMenu.add_child(createSeparatorMenuItem())

    popupMenu.add_child(
        new Bin({
            x_align: Align.START, 
            child: createSimpleItem('As of:')
        })
    )

    // popupMenu.set_style_class_name('calendar-background')

    addCleanupFunction(() => {
        popupMenu?.destroy_all_children()
        popupMenu = null
    })

    return {
        toggle: popupMenu.toggle
    }
}
