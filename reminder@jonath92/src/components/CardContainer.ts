const { BoxLayout, ScrollView, Align } = imports.gi.St
const { PolicyType } = imports.gi.Gtk

// TODO: rename. It is actually just a scrollbox or what the hell??
export function createCardContainer() {
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

    return {
        /** the container which should be used to add it as child to a parent Actor */
        actor: container,
        /** the container which should be used to add children  */
        box
    }
}