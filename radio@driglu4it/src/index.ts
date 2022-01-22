import { configs, initConfig } from './services/Config';
import { initMpvHandler } from './services/mpv/MpvHandler';
import { initPolyfills } from './polyfill';
import { createRadioAppletContainer } from './ui/RadioApplet/RadioAppletContainer';
import { createRadioAppletIcon } from './ui/RadioApplet/RadioAppletIcon';
import { createRadioAppletContainerNew } from './ui/RadioApplet/RadioAppletContainerNew';
import { createRadioPopupMenu } from './ui/RadioPopupMenu/RadioPopupMenu';
const { Applet, AllowedLayout } = imports.ui.applet
const { GenericContainer, util_set_hidden_from_pick, Cursor, util_get_transformed_allocation } = imports.gi.Cinnamon
const { BoxLayout } = imports.gi.St
const Lang = imports.lang
const Tweener = imports.ui.tweener;
const { source_remove } = imports.gi.GLib
const { pushModal, popModal, uiGroup } = imports.ui.main

const { grab_pointer, EventType, ungrab_pointer, Actor, KEY_Escape, PickMode } = imports.gi.Clutter
const { DragMotionResult, DragDropResult, SCALE_ANIMATION_TIME, SNAP_BACK_ANIMATION_TIME, REVERT_ANIMATION_TIME, DRAG_CURSOR_MAP } = imports.ui.dnd

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

const { Settings } = imports.gi.Gtk
const { idle_add, PRIORITY_DEFAULT } = imports.gi.GLib





let eventHandlerActor: null | imports.gi.Clutter.Actor = null
let currentDraggable: null | _Draggable = null

function _getEventHandlerActor() {
    if (!eventHandlerActor) {
        eventHandlerActor = new Actor({ width: 0, height: 0 });
        uiGroup.add_actor(eventHandlerActor);
        // We connect to 'event' rather than 'captured-event' because the capturing phase doesn't happen
        // when you've grabbed the pointer.
        // @ts-ignore
        eventHandlerActor.connect('event', () => currentDraggable?._onEvent(actor, event))
    }
    return eventHandlerActor;
}

interface DraggableActor extends imports.gi.St.Widget {
    _delegate?: {
        getDragActor: () => imports.gi.St.Widget
        getDragActorSource: () => imports.gi.St.BoxLayout
    }
}

function makeDraggable(actor: DraggableActor) {
    return new _Draggable(actor)
}

interface DragTarget extends imports.gi.St.Widget {
    _delegate: {
        handleDragOver: (source: imports.ui.applet.Applet | imports.ui.desklet.Desklet, actor: imports.gi.Clutter.Actor, x: number, y: number, time: number) => imports.ui.dnd.DragMotionResult
        handleDragOut?: () => void
        acceptDrop: (source: imports.ui.applet.Applet | imports.ui.desklet.Desklet, actor: imports.gi.Clutter.Actor, x: number, y: number, time: number) => boolean
    }
}


class _Draggable {

    public inhibit: boolean
    public actor: DraggableActor
    public target: null | DragTarget
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
    private _dragActor: undefined | imports.gi.St.Widget
    private _updateHoverId: undefined | number = undefined
    private _dragX: number | undefined = undefined
    private _dragY: number | undefined = undefined
    private _dragOrigParent: undefined | imports.gi.Clutter.Actor
    private _dragActorSource: undefined | imports.gi.St.Widget
    private _dragOffsetX: undefined | number
    private _dragOffsetY: undefined | number
    private _dragOrigX: undefined | number
    private _dragOrigY: undefined | number
    private _dragOrigScale: undefined | number
    private _dragOrigOpacity: undefined | number
    private _snapBackX: undefined | number
    private _snapBackY: undefined | number
    private _snapBackScale: undefined | number
    private _dragActorMaxSize: undefined
    private recentDropTarget: undefined | null | DragTarget


    // finished
    constructor(actor: DraggableActor) {

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
        // @ts-ignore
        this.buttonPressEventId = this.actor.connect('button-press-event', (actor, event) => this._onButtonPress(actor, event))
        // @ts-ignore
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
        // @ts-ignore
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
     * 
     * //finished
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

        // @ts-ignore
        this.emit('drag-begin', time);
        if (this._onEventId)
            this._ungrabActor();
        this._grabEvents();
        global.set_cursor(Cursor.DND_IN_DRAG);

        this._dragX = this._dragStartX = stageX;
        this._dragY = this._dragStartY = stageY;

        if (this.actor._delegate !== undefined) {
            this._dragActor = this.actor._delegate.getDragActor();
            global.reparentActor(this._dragActor, uiGroup);
            this._dragActor.raise_top();
            util_set_hidden_from_pick(this._dragActor, true);

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
                if (sourceX && stageX > sourceX && stageX <= sourceX + this._dragActor.width && sourceY &&
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
            if (!scaledWidth) scaledWidth = 0
            if (!scaledHeight) scaledHeight = 0
            this._dragActor.set_scale(scaledWidth / this.actor.width,
                scaledHeight / this.actor.height);

            let [actorStageX, actorStageY] = this.actor.get_transformed_position();
            this._dragOffsetX = actorStageX || 0 - this._dragStartX;
            this._dragOffsetY = actorStageY || 0 - this._dragStartY;

            global.reparentActor(this._dragActor, uiGroup);
            this._dragActor.raise_top();
            util_set_hidden_from_pick(this._dragActor, true);
        }

        this._dragOrigOpacity = this._dragActor.opacity;
        if (this._dragActorOpacity != undefined)
            this._dragActor.opacity = this._dragActorOpacity;

        this._snapBackX = this._dragStartX + this._dragOffsetX;
        this._snapBackY = this._dragStartY + this._dragOffsetY;
        this._snapBackScale = this._dragActor.scale_x;

        if (this._dragActorMaxSize != undefined) {
            let [scaledWidth, scaledHeight] = this._dragActor.get_transformed_size();
            let currentSize = Math.max(scaledWidth || 0, scaledHeight || 0);
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

    // finished
    private _maybeStartDrag(event: imports.gi.Clutter.Event) {
        let [stageX, stageY] = event.get_coords();

        // See if the user has moved the mouse enough to trigger a drag
        // @ts-ignore
        let threshold = Settings.get_default().gtk_dnd_drag_threshold;
        if ((Math.abs(stageX - (this._dragStartX || 0)) > threshold ||
            Math.abs(stageY - (this._dragStartY || 0)) > threshold)) {
            this.startDrag(stageX, stageY, event.get_time());
            this._updateDragPosition(event);
        }

        return true;
    }

    // finished
    private _updateDragHover() {
        this._updateHoverId = 0;
        let target: DragTarget | null | imports.gi.Clutter.Actor = null;
        let result = null;

        let x = this._overrideX == undefined ? this._dragX : this._overrideX
        let y = this._overrideY == undefined ? this._dragY : this._overrideY

        if (this.recentDropTarget) {
            let allocation = util_get_transformed_allocation(this.recentDropTarget);

            // @ts-ignore
            if (x < allocation.x1 || x > allocation.x2 || y < allocation.y1 || y > allocation.y2 && this.recentDropTarget?._delegate?.handleDragOut) {
                //@ts-ignore
                this.recentDropTarget._delegate.handleDragOut();
                this.recentDropTarget = null;
            }
        }


        let stage = this._dragActor?.get_stage();
        if (!stage) {
            return;
        }
        target = stage.get_actor_at_pos(PickMode.ALL, x || 0, y || 0) as DragTarget;

        while (target) {
            // @ts-ignore
            if (target._delegate && target._delegate.handleDragOver && this.actor._delegate) {
                // @ts-ignore
                let [r, targX, targY] = target.transform_stage_point(x, y);
                // We currently loop through all parents on drag-over even if one of the children has handled it.
                // We can check the return value of the function and break the loop if it's true if we don't want
                // to continue checking the parents.
                // @ts-ignore
                result = target._delegate.handleDragOver(this.actor._delegate,
                    this._dragActor,
                    targX,
                    targY,
                    0);
                if (result == DragMotionResult.MOVE_DROP || result == DragMotionResult.COPY_DROP) {
                    // @ts-ignore
                    if (target._delegate.handleDragOut) this.recentDropTarget = target;
                    break;
                }
            }
            target = target.get_parent();
        }
        // @ts-ignore
        if (result in DRAG_CURSOR_MAP) global.set_cursor(DRAG_CURSOR_MAP[result]);
        else global.set_cursor(Cursor.DND_IN_DRAG);
        return false;
    }

    // finished
    private _queueUpdateDragHover() {
        if (this._updateHoverId)
            return;
        // @ts-ignore
        this._updateHoverId = idle_add(PRIORITY_DEFAULT, () => this._updateDragHover);
    }

    // finished
    private _updateDragPosition(event: imports.gi.Clutter.Event) {
        let [stageX, stageY] = event.get_coords();
        this._dragX = stageX;
        this._dragY = stageY;

        this._setDragActorPosition();

        this._queueUpdateDragHover();
        return true;
    }

    // finished
    private _setDragActorPosition() {

        if (this._dragActor) {
            this._dragActor.x = this._overrideX == undefined ?
                this._dragX || 0 + (this._dragOffsetX || 0) : this._overrideX;

            this._dragActor.y = this._overrideY == undefined ?
                this._dragY || 0 + (this._dragOffsetY || 0) : this._overrideY;
        }
    }

    // finished
    private _dragActorDropped(event: imports.gi.Clutter.Event) {
        let [dropX, dropY] = event.get_coords();
        let target: null | DragTarget | imports.gi.Clutter.Actor = null;

        if (this._overrideX != undefined) dropX = this._overrideX;
        if (this._overrideY != undefined) dropY = this._overrideY;


        target = this._dragActor?.get_stage().get_actor_at_pos(PickMode.ALL,
            dropX, dropY) as DragTarget;

        // We call observers only once per motion with the innermost
        // target actor. If necessary, the observer can walk the
        // parent itself.
        let dropEvent = {
            dropActor: this._dragActor,
            targetActor: target,
            clutterEvent: event
        };

        // At this point it is too late to cancel a drag by destroying
        // the actor, the fate of which is decided by acceptDrop and its
        // side-effects
        this._dragCancellable = false;

        while (target) {
            // @ts-ignore
            if (target._delegate && target._delegate.acceptDrop) {
                let [r, targX, targY] = target.transform_stage_point(dropX, dropY);
                // @ts-ignore
                if (target._delegate.acceptDrop(this.actor._delegate,
                    this._dragActor,
                    targX,
                    targY,
                    event.get_time())) {
                    // If it accepted the drop without taking the actor,
                    // handle it ourselves.
                    if (!this._dragActor?.is_finalized() && this._dragActor?.get_parent() === uiGroup) {
                        if (this._restoreOnSuccess) {
                            this._restoreDragActor(event.get_time());
                            return true;
                        } else
                            this._dragActor.destroy();
                    }

                    this._dragInProgress = false;
                    global.unset_cursor();
                    // @ts-ignore
                    this.emit('drag-end', event.get_time(), true);
                    this._dragComplete();
                    return true;
                }
            }
            target = target.get_parent();
        }

        this._cancelDrag(event.get_time());

        return true;
    }


    // finish
    private _getRestoreLocation() {
        let x: number | null | undefined, y: number | null | undefined, scale: number | undefined;

        if (this._dragActorSource && this._dragActorSource.visible) {
            // Snap the clone back to its source
            [x, y] = this._dragActorSource.get_transformed_position();
            let [sourceScaledWidth, sourceScaledHeight] = this._dragActorSource.get_transformed_size();
            scale = this._dragActor?.width || 0 / (sourceScaledWidth || 0);
        } else if (this._dragOrigParent) {
            // Snap the actor back to its original position within
            // its parent, adjusting for the fact that the parent
            // may have been moved or scaled
            let [parentX, parentY] = this._dragOrigParent.get_transformed_position();
            let [parentWidth, parentHeight] = this._dragOrigParent.get_size();
            let [parentScaledWidth, parentScaledHeight] = this._dragOrigParent.get_transformed_size();
            let parentScale = 1.0;
            if (parentWidth != 0)
                parentScale = (parentScaledWidth || 0) / (parentWidth || 0);

            x = parentX || 0 + parentScale * (this._dragOrigX || 0);
            y = (parentY || 0) + parentScale * (this._dragOrigY || 0);
            scale = (this._dragOrigScale || 0) * parentScale;
        } else {
            // Snap back actor to its original stage position
            x = this._snapBackX;
            y = this._snapBackY;
            scale = this._snapBackScale;
        }

        return [x, y, scale];
    }
    // finish
    private _cancelDrag(eventTime: number) {
        // @ts-ignore
        this.emit('drag-cancelled', eventTime);
        this._dragInProgress = false;
        let [snapBackX, snapBackY, snapBackScale] = this._getRestoreLocation();

        if (this._actorDestroyed) {
            global.unset_cursor();
            if (!this._buttonDown)
                this._dragComplete();
            // @ts-ignore
            this.emit('drag-end', eventTime, false);
            if (!this._dragOrigParent)
                this._dragActor?.destroy();

            return;
        }

        this._animationInProgress = true;

        if (this._dragActor) {
            // No target, so snap back
            Tweener.addTween(this._dragActor,
                {
                    x: snapBackX,
                    y: snapBackY,
                    scale_x: snapBackScale,
                    scale_y: snapBackScale,
                    opacity: this._dragOrigOpacity,
                    time: SNAP_BACK_ANIMATION_TIME,
                    transition: 'easeOutQuad',
                    onComplete: this._onAnimationComplete,
                    onCompleteScope: this,
                    onCompleteParams: [this._dragActor, eventTime]
                });
        }

    }

    private _restoreDragActor(eventTime: number) {
        this._dragInProgress = false;
        let [restoreX, restoreY, restoreScale] = this._getRestoreLocation();

        // fade the actor back in at its original location
        this._dragActor?.set_position(restoreX || 0, restoreY || 0);
        this._dragActor?.set_scale(restoreScale || 0, restoreScale || 0);
        if (this._dragActor) {
            this._dragActor.opacity = 0;

            this._animationInProgress = true;
            Tweener.addTween(this._dragActor,
                {
                    opacity: this._dragOrigOpacity,
                    time: REVERT_ANIMATION_TIME,
                    transition: 'easeOutQuad',
                    onComplete: this._onAnimationComplete,
                    onCompleteScope: this,
                    onCompleteParams: [this._dragActor, eventTime]
                });
        }


    }

    private _onAnimationComplete(dragActor: imports.gi.Clutter.Actor, eventTime: number) {
        if (this._dragOrigParent) {
            global.reparentActor(dragActor, this._dragOrigParent);
            dragActor.set_scale(this._dragOrigScale || 0, this._dragOrigScale || 0);
            dragActor.set_position(this._dragOrigX || 0, this._dragOrigY || 0);
        } else {
            dragActor.destroy();
        }
        global.unset_cursor();
        // @ts-ignore
        this.emit('drag-end', eventTime, false);

        this._animationInProgress = false;
        if (!this._buttonDown)
            this._dragComplete();
    }

    private _dragComplete() {
        if (!this._actorDestroyed && !this._dragActor?.is_finalized() && this._dragActor)
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



}

export function main() {

    // @ts-ignore


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



