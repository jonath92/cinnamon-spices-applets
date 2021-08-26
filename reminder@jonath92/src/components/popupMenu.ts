import { createPopupMenu } from "cinnamonpopup";
import { selectEvents, watchSelector } from "../Store";
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

    watchSelector(selectEvents, (events) => {
        global.log('events updated', JSON.stringify(events))
    })

    return {
        toggle: popupMenu.toggle
    }
}