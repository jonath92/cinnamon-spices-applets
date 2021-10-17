import { createPopupMenu } from "cinnamonpopup";
import { addCleanupFunction } from "./AppletContainer";
import { createCalendar } from "./Calendar";
import { createCardContainer } from "./CardContainer";
import { DummyButton } from "./DummyButton";

const { BoxLayout, Bin, Button, Align, Label } = imports.gi.St

interface Arguments {
    launcher: imports.gi.St.BoxLayout
}

let popupMenu: ReturnType<typeof createPopupMenu> | null = null

export function getCalendarPopupMenu(args: Arguments): { toggle: ReturnType<typeof createPopupMenu>["toggle"] } {

    const {
        launcher
    } = args

    if (popupMenu) {
        return { toggle: popupMenu.toggle }
    }

    popupMenu = createPopupMenu({ launcher })

    const calendar = createCalendar()
    const container = new BoxLayout()
    container.add_child(createCardContainer())
    container.add_child(calendar)
    popupMenu.add_child(container)

    // popupMenu.set_style_class_name('calendar-background')

    addCleanupFunction(() => {
        popupMenu?.destroy_all_children()
        popupMenu = null
    })

    return {
        toggle: popupMenu.toggle
    }
}
