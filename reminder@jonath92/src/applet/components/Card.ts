const { Button, Table, BoxLayout, Label, Bin } = imports.gi.St
const { WrapMode } = imports.gi.Pango
const { spawnCommandLine } = imports.misc.util

interface Arguments {
    title: string,
    body: string,
    onlineMeetingUrl: string | null
}

export function createCard(args: Arguments) {

    const {
        title,
        body,
        onlineMeetingUrl
    } = args

    const button = new Button({
        style_class: 'notification-applet-padding',
    })

    // @ts-ignore
    button.connect('button-press-event', () => {
        spawnCommandLine(`xdg-open ${onlineMeetingUrl}`)
    })

    const table = new Table({
        name: 'notification',
        reactive: true
    })

    button.set_child(table)

    const titleLabel = new Label()

    titleLabel.clutter_text.line_wrap = true
    titleLabel.clutter_text.line_wrap_mode = WrapMode.WORD_CHAR

    table.add(titleLabel, {
        row: 0,
        col: 1,
    })

    titleLabel.clutter_text.set_markup(`<b>${title}</b>`)


    const contentLabel = new Label()
    contentLabel.clutter_text.set_markup(body)

    table.add(contentLabel, {
        row: 1,
        col: 1,
        col_span: 1
    })

    return button

}