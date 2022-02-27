const { BoxLayout } = imports.gi.St
const { GenericContainer, Cursor } = imports.gi.Cinnamon

const { grab_pointer, EventType, KEY_Escape, Clone, PickMode } = imports.gi.Clutter
const { uiGroup, pushModal, popModal, layoutManager, modalActorFocusStack, panelManager } = imports.ui.main
const { disable_unredirect_for_screen, enable_unredirect_for_screen } = imports.gi.Meta
let { modalCount } = imports.ui.main

const { StageInputMode, util_set_hidden_from_pick } = imports.gi.Cinnamon

type MabeDragTarget = Partial<Pick<imports.ui.dnd.DragTarget, '_delegate'>> & imports.gi.Clutter.Actor

const Gdk = imports.gi.Gdk


interface Arguments {
    onClick: () => void,
    onScroll: (scrollDirection: imports.gi.Clutter.ScrollDirection) => void,
    onMiddleClick: () => void,
    onRightClick: () => void,
}

// let modalCount = 0

let IS_DRAGGING = false

const getDropTargetAtPosition = (props: { stage: imports.gi.Clutter.Stage, xPos: number, yPos: number }): imports.gi.Clutter.Actor | undefined => {

    const { stage, xPos, yPos } = props

    const getDropTargetinAncestors = (actor: imports.gi.Clutter.Actor): imports.gi.Clutter.Actor | undefined => {
        if (['panelLeft', 'panelRight', 'panelCenter'].includes(actor.name)) {
            return actor
        }

        const parent = actor.get_parent()

        if (!parent) return undefined

        return getDropTargetinAncestors(parent)
    }


    return getDropTargetinAncestors(stage.get_actor_at_pos(PickMode.ALL, xPos, yPos))
}



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
    util_set_hidden_from_pick(dragActor, true);


    appletContainer.connect('key-press-event', () => {
        global.log('key press event appletContainer')
        return true
    })

    appletContainer.connect('notify::width', () => dragActor.width = appletContainer.width)
    appletContainer.connect('notify::height', () => dragActor.height = appletContainer.height)


    const display = Gdk.Display.get_default()
    const deviceManager = display?.get_device_manager()
    const pointer = deviceManager?.get_client_pointer()
    pointer?.connect('changed', () => global.log('changed pointer called'))

    global.log('position', pointer?.get_position())



    appletContainer.connect('button-press-event', (owner, event) => {
        global.log('button-press-called')


        const btnNumberCallback: Record<number, () => void> = {
            1: onClick,
            2: onMiddleClick,
            3: onRightClick
        }

        const btnNumber = event.get_button()

        panelManager.panels.forEach(panel => {
            global.log(panel.actor.width)
        })


        if (btnNumber === 1 && global.settings.get_boolean('panel-edit-mode')) {
            if (IS_DRAGGING) return true

            global.set_cursor(Cursor.DND_IN_DRAG)

            const intervalId = setInterval(() => {
                const [pointerX, pointerY] = global.get_pointer()

                dragActor.set_position(pointerX, pointerY)


                const dropTarget = getDropTargetAtPosition({ stage: dragActor.get_stage(), xPos: pointerX, yPos: pointerY })

                global.log('dropTarget', dropTarget?.name)


                // global.log('dragACtor stag', dragActor.get_stage().get_actor_at_pos(PickMode.ALL, pointerX, pointerY)?._delegate?.handleDragOver)





            }, 10)

            pushModal(dragActor)


            const handleDragCancelled = () => {
                global.log('dragCancelled called')
                dragActor.visible = false
                popModal(dragActor)
                global.unset_cursor()
                clearInterval(intervalId)

                global.stage.disconnect(keyPressEventId)
                global.stage.disconnect(keyLeaveEventId)
                IS_DRAGGING = false
            }

            const keyPressEventId = global.stage.connect('key-press-event', (actor, event) => {

                const symbol = event.get_key_symbol()
                if (symbol === KEY_Escape) {
                    handleDragCancelled()
                }
                return true
            })

            const keyLeaveEventId = global.stage.connect('button-release-event', (actor, event) => {
                handleDragCancelled()
                return true
            })



            IS_DRAGGING = true


            const [stageX, stageY] = event.get_coords()
            global.reparentActor(dragActor, uiGroup)
            dragActor.raise_top()
            dragActor.show()
            dragActor.set_position(stageX, stageY)



            return true
        }

        btnNumberCallback[btnNumber]()

        return true
    })


    // const handleDragOver = ()


    return appletContainer

}
