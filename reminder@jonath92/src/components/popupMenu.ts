import { createPopupMenu } from "cinnamonpopup";
import { CalendarEvent } from "model/CalendarEvent";
import { selectEvents, watchSelector } from "../Store";
import { addCleanupFunction } from "./AppletContainer";
import { createCalendar } from "./Calendar";
import { createCard } from "./Card";
import { createCardContainer } from "./CardContainer";

const { BoxLayout, Bin } = imports.gi.St

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

    const cardContainer = createCardContainer()
    const calendar = createCalendar()

    const container = new BoxLayout()

    container.add_child(cardContainer.actor)

    const calendarContainer = new Bin({
        child: calendar,
        x_expand: false,
        y_expand: false
    })

    container.add_child(calendarContainer)

    popupMenu.add_child(container)

    // popupMenu.set_style_class_name('calendar-background')

    // TODO: add this in cardContainer!!
    watchSelector(selectEvents, renderEvents)

    function renderEvents(events: CalendarEvent[]): void {

        cardContainer.box.destroy_all_children()

        events.forEach(event => {

            const card = createCard({
                title: event.startFormated,
                body: event.subject,
                onlineMeetingUrl: event.onlineMeetingUrl
            })

            cardContainer.box.add_child(card)

        })
    }

    addCleanupFunction(() => {
        popupMenu?.destroy_all_children()
        popupMenu = null
    })

    return {
        toggle: popupMenu.toggle
    }
}
