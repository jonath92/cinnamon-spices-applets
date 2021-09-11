import { createPopupMenu } from "cinnamonpopup";
import { DateTime } from "luxon";
import { CalendarEvent } from "model/CalendarEvent";
import { selectEvents, watchSelector } from "../Store";
import { createCard } from "./Card";
import { createCardContainer } from "./CardContainer";

interface Arguments {
    launcher: imports.gi.St.BoxLayout
}

export function createCalendarPopupMenu(args: Arguments){

    const {
        launcher
    } = args

    const popupMenu = createPopupMenu({launcher})

    const cardContainer = createCardContainer()

    popupMenu.add_actor(cardContainer.actor)

    watchSelector(selectEvents, renderEvents)


    function renderEvents(events: CalendarEvent[]): void {
        
        cardContainer.box.destroy_all_children()

        // TODO: not working
        // const sorted = events.sort((firstEl, secondEl) => {
        //     return firstEl.startUTC <= secondEl.startUTC ? -1 : 1 
        // })

        // global.log('sorted: ', sorted)

        events.forEach(event => {
            const eventStartFormated = event.startUTC.toLocaleString(DateTime.TIME_SIMPLE)
        
            const card = createCard({
                title: eventStartFormated, 
                body: event.subject
            })

            cardContainer.box.add_child(card)
        
        })
    } 

    return {
        toggle: popupMenu.toggle
    }
}