import { configs, initConfig } from './services/Config';
import { initMpvHandler } from './services/mpv/MpvHandler';
import { initPolyfills } from './polyfill';
import { createRadioAppletContainer } from './ui/RadioApplet/RadioAppletContainer';
import { createRadioAppletIcon } from './ui/RadioApplet/RadioAppletIcon';
import { createRadioAppletContainerNew } from './ui/RadioApplet/RadioAppletContainerNew';
import { createRadioPopupMenu } from './ui/RadioPopupMenu/RadioPopupMenu';
const { Applet, AllowedLayout } = imports.ui.applet
const { GenericContainer, util_set_hidden_from_pick, Cursor } = imports.gi.Cinnamon
const { BoxLayout } = imports.gi.St
const Lang = imports.lang
const Tweener = imports.ui.tweener;
const { source_remove } = imports.gi.GLib
const { pushModal, popModal, uiGroup } = imports.ui.main

const { grab_pointer, EventType, ungrab_pointer, Actor, KEY_Escape } = imports.gi.Clutter


declare global {
    // added during build (see webpack.config.js)
    interface Meta {
        instanceId: number
        orientation: imports.gi.St.Side // TODO: needed??
        panel: imports.ui.panel.Panel
        locationLabel: imports.ui.appletManager.LocationLabel
        monitor: imports.ui.layout.Monitor
    }
}

let eventHandlerActor: null | imports.gi.Clutter.Actor = null
let currentDraggable: null | _Draggable = null

function _getEventHandlerActor() {
    if (!eventHandlerActor) {
        eventHandlerActor = new Actor({ width: 0, height: 0 });
        uiGroup.add_actor(eventHandlerActor);
        // We connect to 'event' rather than 'captured-event' because the capturing phase doesn't happen
        // when you've grabbed the pointer.
        eventHandlerActor.connect('event',
            function (actor, event) {
                return currentDraggable?._onEvent(actor, event);
            });
    }
    return eventHandlerActor;
}



function makeDraggable(actor: imports.gi.St.BoxLayout) {
    return new _Draggable(actor)
}

class _Draggable {

    public inhibit: boolean
    public actor: imports.gi.St.BoxLayout
    public target: null
    public buttonPressEventId: number
    public destroyEventId: number
    private _buttonDown: boolean
    private _dragInProgress: boolean
    private _animationInProgress: boolean
    private _dragCancellable: boolean
    private _eventsGrabbed: boolean
    private _onEventId: number | null
    private _dragStartX: number | null = null
    private _dragStartY: number | null = null
    private _actorDestroyed: boolean | null = null
    private _restoreOnSuccess: boolean
    private __dragActorMaxSize: undefined
    private _dragActorOpacity: undefined
    private _overrideX: undefined
    private _overrideY: undefined
    private _dragActor: undefined | imports.gi.St.BoxLayout // or imports.gi.Clutter.Actor??
    private _updateHoverId: undefined | number = undefined
    private _dragX: number | undefined = undefined
    private _dragY: number | undefined = undefined


    // finished
    constructor(actor: imports.gi.St.BoxLayout) {

        const params = {
            manualMode: false,
            restoreOnSuccess: false,
            overrideX: undefined,
            overrideY: undefined,
            dragActorMaxSize: undefined,
            dragActorOpacity: undefined
        }

        this.inhibit = false // Use the inhibit flag to temporarily disable an object from being draggable

        this.actor = actor

        this.target = null
        this.buttonPressEventId = this.actor.connect('button-press-event', (actor, event) => this._onButtonPress(actor, event))
        this.destroyEventId = this.actor.connect('destroy', () => {
            this._actorDestroyed = true

            if (this._dragInProgress && this._dragCancellable) {
                this._cancelDrag(global.get_current_time())
            }
            //this.disconnectAll();
        });
        this._onEventId = null;

        this._restoreOnSuccess = false
        this.__dragActorMaxSize = undefined
        this._dragActorOpacity = undefined
        this._overrideY = undefined
        this._overrideX = undefined

        this._buttonDown = false; // The mouse button has been pressed and has not yet been released.
        this._dragInProgress = false; // The drag has been started, and has not been dropped or cancelled yet.
        this._animationInProgress = false; // The drag is over and the item is in the process of animating to its original position (snapping back or reverting).
        this._dragCancellable = true;

        this._eventsGrabbed = false;

    }

    // finished
    _onButtonPress(actor: imports.gi.St.BoxLayout, event: imports.gi.Clutter.ButtonEvent
    ) {

        if (this.inhibit)
            return false;

        if (event.get_button() != 1)
            return false;

        if (Tweener.getTweenCount(actor))
            return false

        this._buttonDown = true;
        this._grabActor();

        const [stageX, stageY] = event.get_coords()
        this._dragStartX = stageX
        this._dragStartY = stageY

        return false
    }
    // finished
    private _grabActor() {
        grab_pointer(this.actor)
        this._onEventId = this.actor.connect('event', (actor, event) => this._onEvent(actor, event))
    }

    // finished
    private _ungrabActor() {
        if (!this._onEventId)
            return;

        ungrab_pointer();
        this.actor.disconnect(this._onEventId);
        this._onEventId = null;
    }

    // finished
    private _grabEvents() {
        if (!this._eventsGrabbed) {
            this._eventsGrabbed = pushModal(_getEventHandlerActor());
            if (this._eventsGrabbed)
                grab_pointer(_getEventHandlerActor());
        }
    }

    // finished
    private _ungrabEvents() {
        if (this._eventsGrabbed) {
            ungrab_pointer();
            popModal(_getEventHandlerActor());
            this._eventsGrabbed = false;
        }
    }

    // must be public because it is accessed from the function "_getEventHandlerActor" outside of this class
    // finished
    public _onEvent(actor: imports.gi.Clutter.Actor, event: imports.gi.Clutter.Event) {
        // We intercept BUTTON_RELEASE event to know that the button was released in case we
        // didn't start the drag, to drop the draggable in case the drag was in progress, and
        // to complete the drag and ensure that whatever happens to be under the pointer does
        // not get triggered if the drag was cancelled with Esc.
        if (event.type() == EventType.BUTTON_RELEASE) {
            this._buttonDown = false;
            if (this._dragInProgress) {
                return this._dragActorDropped(event);
            } else if (this._dragActor != null && !this._animationInProgress) {
                // Drag must have been cancelled with Esc.
                // Check if escaped drag was from a desklet
                // @ts-ignore
                if (this.target?._delegate.acceptDrop) {
                    // @ts-ignore
                    this.target?._delegate.cancelDrag(this.actor._delegate, this._dragActor);
                }
                this._dragComplete();
                return true;
            } else {
                // Drag has never started.
                this._ungrabActor();
                return false;
            }
            // We intercept MOTION event to figure out if the drag has started and to draw
            // this._dragActor under the pointer when dragging is in progress
        } else if (event.type() == EventType.MOTION) {
            if (this._dragInProgress) {
                return this._updateDragPosition(event);
            } else if (this._dragActor == null) {
                return this._maybeStartDrag(event);
            }
            // We intercept KEY_PRESS event so that we can process Esc key press to cancel
            // dragging and ignore all other key presses.
        } else if (event.type() == EventType.KEY_PRESS && this._dragInProgress) {
            let symbol = event.get_key_symbol();
            if (symbol === KEY_Escape) {
                this._cancelDrag(event.get_time());
                return true;
            }
        }

        return false;

    }

    /**
     * fakeRelease:
     *
     * Fake a release event.
     * Must be called if you want to intercept release events on draggable
     * actors for other purposes (for example if you're using
     * PopupMenu.ignoreRelease())
     * // finished
     */
    private fakeRelease() {
        this._buttonDown = false;
        this._ungrabActor();
    }

    /**
     * startDrag:
     * @stageX: X coordinate of event
     * @stageY: Y coordinate of event
     * @time: Event timestamp
     *
     * Directly initiate a drag and drop operation from the given actor.
     * This function is useful to call if you've specified manualMode
     * for the draggable.
     */
    private startDrag(stageX: number, stageY: number, time: number) {
        currentDraggable = this;
        this._dragInProgress = true;

        // Special-case St.Button: the pointer grab messes with the internal
        // state, so force a reset to a reasonable state here
        if (this.actor instanceof imports.gi.St.Button) {
            this.actor.fake_release();
            this.actor.hover = false;
        }

        // this.emit('drag-begin', time);
        if (this._onEventId)
            this._ungrabActor();
        this._grabEvents();
        global.set_cursor(Cursor.DND_IN_DRAG);

        this._dragX = this._dragStartX = stageX;
        this._dragY = this._dragStartY = stageY;

        // @ts-ignore
        if (this.actor._delegate && this.actor._delegate.getDragActor) {
            this._dragActor = this.actor._delegate.getDragActor();
            global.reparentActor(this._dragActor, Main.uiGroup);
            this._dragActor.raise_top();
            Cinnamon.util_set_hidden_from_pick(this._dragActor, true);

            // Drag actor does not always have to be the same as actor. For example drag actor
            // can be an image that's part of the actor. So to perform "snap back" correctly we need
            // to know what was the drag actor source.
            if (this.actor._delegate.getDragActorSource) {
                this._dragActorSource = this.actor._delegate.getDragActorSource();
                // If the user dragged from the source, then position
                // the dragActor over it. Otherwise, center it
                // around the pointer
                let [sourceX, sourceY] = this._dragActorSource.get_transformed_position();
                let x, y;
                if (stageX > sourceX && stageX <= sourceX + this._dragActor.width &&
                    stageY > sourceY && stageY <= sourceY + this._dragActor.height) {
                    x = sourceX;
                    y = sourceY;
                } else {
                    x = stageX - this._dragActor.width / 2;
                    y = stageY - this._dragActor.height / 2;
                }
                this._dragActor.set_position(x, y);
            } else {
                this._dragActorSource = this.actor;
            }
            this._dragOrigParent = undefined;

            this._dragOffsetX = this._dragActor.x - this._dragStartX;
            this._dragOffsetY = this._dragActor.y - this._dragStartY;
        } else {
            this._dragActor = this.actor;

            this._dragActorSource = undefined;
            this._dragOrigParent = this.actor.get_parent();
            this._dragOrigX = this._dragActor.x;
            this._dragOrigY = this._dragActor.y;
            this._dragOrigScale = this._dragActor.scale_x;

            // Set the actor's scale such that it will keep the same
            // transformed size when it's reparented to the uiGroup
            let [scaledWidth, scaledHeight] = this.actor.get_transformed_size();
            this._dragActor.set_scale(scaledWidth / this.actor.width,
                scaledHeight / this.actor.height);

            let [actorStageX, actorStageY] = this.actor.get_transformed_position();
            this._dragOffsetX = actorStageX - this._dragStartX;
            this._dragOffsetY = actorStageY - this._dragStartY;

            global.reparentActor(this._dragActor, Main.uiGroup);
            this._dragActor.raise_top();
            Cinnamon.util_set_hidden_from_pick(this._dragActor, true);
        }

        this._dragOrigOpacity = this._dragActor.opacity;
        if (this._dragActorOpacity != undefined)
            this._dragActor.opacity = this._dragActorOpacity;

        this._snapBackX = this._dragStartX + this._dragOffsetX;
        this._snapBackY = this._dragStartY + this._dragOffsetY;
        this._snapBackScale = this._dragActor.scale_x;

        if (this._dragActorMaxSize != undefined) {
            let [scaledWidth, scaledHeight] = this._dragActor.get_transformed_size();
            let currentSize = Math.max(scaledWidth, scaledHeight);
            if (currentSize > this._dragActorMaxSize) {
                let scale = this._dragActorMaxSize / currentSize;
                let origScale = this._dragActor.scale_x;
                let origDragOffsetX = this._dragOffsetX;
                let origDragOffsetY = this._dragOffsetY;

                // The position of the actor changes as we scale
                // around the drag position, but we can't just tween
                // to the final position because that tween would
                // fight with updates as the user continues dragging
                // the mouse; instead we do the position computations in
                // an onUpdate() function.
                Tweener.addTween(this._dragActor,
                    {
                        scale_x: scale * origScale,
                        scale_y: scale * origScale,
                        time: SCALE_ANIMATION_TIME,
                        transition: 'easeOutQuad',
                        onUpdate: function () {
                            let currentScale = this._dragActor.scale_x / origScale;
                            this._dragOffsetX = currentScale * origDragOffsetX;
                            this._dragOffsetY = currentScale * origDragOffsetY;
                            this._setDragActorPosition();
                        },
                        onUpdateScope: this
                    });
            }
        }
    }

    private _dragActorDropped(event: imports.gi.Clutter.Event) {
        const target = this.target ? this.target : this._dragActor

    }

    private _dragComplete() {
        if (!this._actorDestroyed && !this._dragActor?.is_finalized())
            util_set_hidden_from_pick(this._dragActor, false);

        this._ungrabEvents();
        global.sync_pointer();

        if (this._updateHoverId) {
            source_remove(this._updateHoverId);
            this._updateHoverId = 0;
        }

        this._dragActor = undefined;
        currentDraggable = null;
    }


    private _cancelDrag(eventTime: number) {
        // TODO: emit drag-cancelled




    }
}

export function main() {

    global.log(global.screen_height)

    // order must be retained!
    initPolyfills()
    initConfig()
    const mpvHandler = initMpvHandler()

    let appletReloaded = false;

    const appletContainer = createRadioAppletContainerNew({
        onClick: () => popupMenu.toggle(),
        onMiddleClick: () => global.log('onMiddleClick'),
        onRightClick: () => global.log('onRigh Click'),
        onScroll: () => global.log(global.get_current_time())
    })

    const dragActor = new GenericContainer({
        style_class: 'drag-item-container'
    })

    const popupMenu = createRadioPopupMenu({ launcher: appletContainer })


    appletContainer.add_child(createRadioAppletIcon())




    return {
        actor: appletContainer,
        on_applet_reloaded: () => { },
        _onAppletRemovedFromPanel: () => { },
        // _panelLocation: null,
        on_applet_added_to_panel_internal: () => { },
        _addStyleClass: () => { },
        finalizeContextMenu: () => { },
        getAllowedLayout: () => AllowedLayout.BOTH

    }

}



