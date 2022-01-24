const { BoxLayout } = imports.gi.St
const { GenericContainer, Cursor } = imports.gi.Cinnamon

const { grab_pointer, EventType, KEY_Escape, Clone } = imports.gi.Clutter
const { uiGroup } = imports.ui.main

const Gdk = imports.gi.Gdk

interface Arguments {
    onClick: () => void,
    onScroll: (scrollDirection: imports.gi.Clutter.ScrollDirection) => void,
    onMiddleClick: () => void,
    onRightClick: () => void,
}

let IS_DRAGGING = false

export function createRadioAppletContainerNew(args: Arguments) {

    const { onClick, onMiddleClick, onRightClick, onScroll } = args

    const appletContainer = new BoxLayout({
        style_class: 'applet-box',
        reactive: true,
        track_hover: true
    })

    const dragActor = new Clone({
        source: appletContainer,
        width: appletContainer.width,
        height: appletContainer.height,
        visible: false
    })

    appletContainer.connect('notify::width', () => dragActor.width = appletContainer.width)
    appletContainer.connect('notify::height', () => dragActor.height = appletContainer.height)


    const display = Gdk.Display.get_default()
    const deviceManager = display?.get_device_manager()
    const pointer = deviceManager?.get_client_pointer()
    pointer?.connect('changed', () => global.log('changed pointer called'))

    global.log('position', pointer?.get_position())

    const handleDrag = () => {

        IS_DRAGGING = true
        // TODO using grab_pointer is bad practise (see jsdoc)
        //grab_pointer(appletContainer)
        appletContainer.connect('event', (_, event) => {
            const eventType = event.type()
            global.log(eventType)

            if (eventType === EventType.BUTTON_RELEASE) {
                global.log('drag complete')
                return true
            }

            if (eventType === EventType.MOTION) {
                global.log('motion event called')
                global.set_cursor(Cursor.DND_IN_DRAG)

                //const pointer = global.get_pointer()


                const [stageX, stageY] = event.get_coords()
                // const dragActor = new Clone({
                //     source: appletContainer,
                //     width: appletContainer.width,
                //     height: appletContainer.height
                // })

                global.reparentActor(dragActor, uiGroup)
                dragActor.raise_top()
                dragActor.show()
                dragActor.set_position(stageX, stageY)

                const [pointerX, pointerY] = global.get_pointer()

                setInterval(() => {
                    dragActor.set_position(pointerX, pointerY)
                }, 10)

            }

            if (eventType === EventType.KEY_PRESS) {
                global.log('key pressed')
                global.log('cancel drag')
                global.unset_cursor()
            }

            return true
        })

        return true
    }



    appletContainer.connect('button-press-event', (owner, event) => {
        global.log('button-press-called')

        const btnNumberCallback: Record<number, () => void> = {
            1: onClick,
            2: onMiddleClick,
            3: onRightClick
        }

        const btnNumber = event.get_button()

        if (btnNumber === 1 && global.settings.get_boolean('panel-edit-mode')) {
            if (IS_DRAGGING) return true

            IS_DRAGGING = true

            global.set_cursor(Cursor.DND_IN_DRAG)

            const [stageX, stageY] = event.get_coords()
            global.reparentActor(dragActor, uiGroup)
            dragActor.raise_top()
            dragActor.show()
            dragActor.set_position(stageX, stageY)

            setInterval(() => {
                const [pointerX, pointerY] = global.get_pointer()

                dragActor.set_position(pointerX, pointerY)
            }, 10)

            return true
        }

        btnNumberCallback[btnNumber]()

        return true
    })



    return appletContainer

}