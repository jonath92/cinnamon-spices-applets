const {ListBoxRow, Image, Box, Align, Label, Orientation} = imports.gi.Gtk

export function createNewAccountListRow() {

    const listboxRow = new ListBoxRow({
        can_focus: true,
        width_request: 100,
        height_request: 80
    })

    const googleBox = new Box({
        can_focus: true,
        spacing: 6,
    })

    const googleImg = new Image({
        pixel_size: 40,
        icon_name: 'goa-account-google',
        icon_size: 3
    })

    const labelBox = new Box({
        halign: Align.START,
        valign: Align.CENTER,
        orientation: Orientation.VERTICAL,
    })

    labelBox.add(new Label({ label: 'Google', halign: Align.START }))


    googleBox.add(googleImg)
    googleBox.add(labelBox)

    listboxRow.add(googleBox)

    return listboxRow

}
