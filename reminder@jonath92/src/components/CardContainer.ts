import { CalendarEvent } from "model/CalendarEvent"
import { selectEvents, watchSelector } from "Store"
import { createCard } from "./Card"

const { BoxLayout, ScrollView, Align } = imports.gi.St
const { PolicyType } = imports.gi.Gtk

export function createCardContainer(): InstanceType<typeof BoxLayout> {
    const container = new BoxLayout({
        vertical: true
    })

    const scrollView = new ScrollView({
        x_fill: true,
        y_fill: true,
        y_align: Align.START,
        style_class: "vfade",
        hscrollbar_policy: PolicyType.NEVER,
        vscrollbar_policy: PolicyType.AUTOMATIC,
    })

    const box = new BoxLayout({
        vertical: true
    })

    container.add_actor(scrollView)
    scrollView.add_actor(box)

    // TODO: also the watchSelectors musst be cleaned up or?
    watchSelector(selectEvents, renderEvents)

    function renderEvents(events: CalendarEvent[]): void {

        box.destroy_all_children()

        events.forEach(event => {

            const card = createCard({
                title: event.startFormated,
                body: event.subject,
                onlineMeetingUrl: event.onlineMeetingUrl
            })

            box.add_child(card)
        })
    }

    return container
}