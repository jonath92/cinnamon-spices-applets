import { CalendarEvent } from "../model/CalendarEvent"
import { selectEvents, watchSelector } from "../Store"
import { createCard } from "./Card"

const { BoxLayout, ScrollView, Align, Bin, Label, Widget } = imports.gi.St
const { PolicyType } = imports.gi.Gtk


function createScrollContainer() {
    const container = new BoxLayout({
        vertical: true, 
        y_align: Align.START
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
        vertical: true, 
        y_align: Align.START

    })

    container.add_actor(scrollView)
    scrollView.add_actor(box)

    return {
        actor: container, 
        // add_child: box.add_child is not working. Why?
        add_child: (widget: InstanceType<typeof Widget>) => box.add_child(widget), 
        destroy_all_children: () => box.destroy_all_children() 
    }
}

const noEventLabel = new Label({
    text: 'No events today'
})

export function createCardContainer(): InstanceType<typeof Bin> {
    const outerContainer = new Bin({
        width: 250,
        x_expand: false,
        y_expand: false,
        y_align: Align.MIDDLE,
        child: noEventLabel
    })
  
    const scrollContainer = createScrollContainer()
    // TODO: also the watchSelectors musst be cleaned up or?
    watchSelector(selectEvents, renderEvents)

    function renderEvents(events: CalendarEvent[]): void {

        scrollContainer.destroy_all_children()

        if (events.length === 0){
            outerContainer.set_child(noEventLabel)
            outerContainer.y_align = Align.MIDDLE
            return
        }

        events.forEach(event => {

            const card = createCard({
                title: event.startFormated,
                body: event.subject,
                onlineMeetingUrl: event.onlineMeetingUrl
            })

            scrollContainer.add_child(card)
        })

        outerContainer.set_child(scrollContainer.actor)
        outerContainer.y_align = Align.START
    }

    return outerContainer
}