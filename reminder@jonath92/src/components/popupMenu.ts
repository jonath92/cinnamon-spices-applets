import { createPopupMenu } from "cinnamonpopup";
import { CalendarEvent } from "model/CalendarEvent";
import { selectEvents, watchSelector } from "../Store";
import { createCalendar } from "./Calendar";
import { createCard } from "./Card";
import { createCardContainer } from "./CardContainer";

const { Button } = imports.gi.St

interface Arguments {
    launcher: imports.gi.St.BoxLayout
}

export function createCalendarPopupMenu(args: Arguments) {

    const {
        launcher
    } = args

    const popupMenu = createPopupMenu({ launcher })

    const cardContainer = createCardContainer()

    popupMenu.add_actor(cardContainer.actor)

   // popupMenu.set_style_class_name('calendar-background')

    watchSelector(selectEvents, renderEvents)

    function renderEvents(events: CalendarEvent[]): void {

        cardContainer.box.destroy_all_children()

        events.forEach(event => {

            const card = createCard({
                title: event.startFormated,
                body: event.subject
            })

            cardContainer.box.add_child(card)

        })
    }


    const calendar = createCalendar()
    popupMenu.add_child(calendar)


    return {
        toggle: popupMenu.toggle
    }
}