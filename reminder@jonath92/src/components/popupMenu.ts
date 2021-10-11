import { createPopupMenu } from "cinnamonpopup";
import { addCleanupFunction } from "./AppletContainer";
import { createCalendar } from "./Calendar";
import { createCardContainer } from "./CardContainer";
import { DummyButton } from "./DummyButton";

const { BoxLayout, Bin, Button } = imports.gi.St

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

    const dummy = new DummyButton()

    container.add_child(createCardContainer())

    const calendarContainer = new Bin({
        child: calendar,
        x_expand: false,
        y_expand: false
    })

    container.add_child(dummy)

    container.add_child(calendarContainer)

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
