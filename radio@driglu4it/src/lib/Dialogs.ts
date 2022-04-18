
const { Widget, Bin, BoxLayout} = imports.gi.St
const { Role } = imports.gi.Atk
const { uiGroup } = imports.ui.main
const { BindConstraint, BindCoordinate } = imports.gi.Clutter

const Lightbox = imports.ui.lightbox;

export function createBaseDialog() {

    const group = new Widget({
        visible: false,
        x: 0,
        y: 0,
        accessible_role: Role.DIALOG
    })

    uiGroup.add_child(group)

    const constraint = new BindConstraint({
        source: global.stage,
        coordinate: BindCoordinate.POSITION | BindCoordinate.SIZE
    })

    group.add_constraint(constraint)

    const backgroundBin = new Bin()
    group.add_child(backgroundBin)

    group.add_child(backgroundBin)

    const dialogLayout = new BoxLayout({
        style_class: 'modal-dialog', 
        vertical: true
    })

    const lightBox = 


}