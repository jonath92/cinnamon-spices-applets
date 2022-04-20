const { Widget, Bin, BoxLayout, Align, Label, Button } = imports.gi.St;
const { Role } = imports.gi.Atk;
const { uiGroup, layoutManager, popModal, pushModal } = imports.ui.main;
const { BindConstraint, BindCoordinate, Group, ModifierType, KEY_Escape } =
  imports.gi.Clutter;
const { Lightbox } = imports.ui.lightbox;
const { Stack, get_event_state } = imports.gi.Cinnamon;
const {
  State,
  FADE_IN_BUTTONS_TIME,
  FADE_OUT_DIALOG_TIME,
  OPEN_AND_CLOSE_TIME,
} = imports.ui.modalDialog;
const { addTween } = imports.ui.tweener;

interface DialogButton {
  label: string;
  onClick: () => void;
  /** a keyboard key - easisest to use a respective Clutter Constant, such as Clutter.KEY_Escape */
  key?: number;
  button?: imports.gi.St.Button;
}
interface ModalDialogParams {
  showBackdrop: boolean;
  buttons: DialogButton[];
}

interface ActionKeys {
  [key: number]: () => void;
}
class ModalDialog {
  public state: number;
  private _hasModal: boolean;
  private _group: imports.gi.St.Widget;
  private _actionKeys: ActionKeys = {};
  private _backgroundBin: imports.gi.St.Bin;
  private _dialogLayout: imports.gi.St.BoxLayout;
  private _lightbox: imports.ui.lightbox.Lightbox | undefined;
  private _eventBlocker: imports.gi.Clutter.Group | undefined;
  public contentLayout: imports.gi.St.BoxLayout;
  private _buttonLayout: imports.gi.St.BoxLayout;
  private _initialKeyFocus: imports.gi.St.Widget;
  private _savedKeyFocus: null | imports.gi.Clutter.Actor;

  constructor(params: ModalDialogParams) {
    const { showBackdrop, buttons } = params;

    this.state = State.CLOSED;
    this._hasModal = false;


    this._group = new Widget({
      visible: false,
      x: 0,
      y: 0,
      accessible_role: Role.DIALOG,
    });

    uiGroup.add_child(this._group);

    this._group.connect("destroy", (owner) => this._onGroupDestroy());

    this._group.connect("key-press-event", (owner, event) =>
      this._onKeyPressEvent(owner, event)
    );

    this._backgroundBin = new Bin();
    this._group.add_child(this._backgroundBin);

    this._dialogLayout = new BoxLayout({
      style_class: "modal-dialog",
      vertical: true,
    });

    if (showBackdrop) {

      const fullMonitorWidget = new Widget({
        visible: false, 
        x: 0,
        y: 0,
        accessible_role: Role.DIALOG,
      })
      

      this._lightbox = new Lightbox(this._group, {
        inhibitEvents: true,
        radialEffect: true,
      });
      this._lightbox.highlight(this._backgroundBin);

      let stack = new Stack();
      this._backgroundBin.child = stack;

      this._eventBlocker = new Group({ reactive: true });
      stack.add_child(this._eventBlocker);
      stack.add_child(this._dialogLayout);
    } else {
      this._backgroundBin.child = this._dialogLayout;
    }

    this.contentLayout = new BoxLayout({ vertical: true });
    this._dialogLayout.add(this.contentLayout, {
      x_fill: true,
      y_fill: true,
      x_align: Align.MIDDLE,
      y_align: Align.START,
    });

    this._buttonLayout = new BoxLayout({
      style_class: "modal-dialog-button-box",
      vertical: false,
    });

    this.setButtons(buttons);

    this._dialogLayout.add(this._buttonLayout, {
      expand: true,
      x_align: Align.MIDDLE,
      y_align: Align.END,
    });

    global.focus_manager.add_group(this._dialogLayout);
    this._initialKeyFocus = this._dialogLayout;
    this._savedKeyFocus = null;
  }

  public destroy() {
    this._group.destroy();
  }

  private setButtons(buttons: DialogButton[]) {
    buttons.forEach((btn, index) => {
      const { label, onClick: action, key } = buttons[index];

      const button = new Button({
        style_class: "modal-dialog-button",
        reactive: true,
        can_focus: true,
        label: label,
      });

      const isLast = buttons.length - 1 === index;
      const isFirst = index === 0;

      const x_align = isLast ? Align.END : isFirst ? Align.START : Align.MIDDLE;

      this._buttonLayout.add(button, {
        expand: true,
        x_fill: false,
        y_fill: false,
        x_align,
        y_align: Align.MIDDLE,
      });

      button.connect("clicked", action);
    });
  }

  private _onKeyPressEvent(
    object: imports.gi.St.Widget,
    keyPressEvent: imports.gi.Clutter.KeyEvent
  ) {
    let modifiers = get_event_state(keyPressEvent);
    let ctrlAltMask = ModifierType.CONTROL_MASK | ModifierType.MOD1_MASK;
    let symbol = keyPressEvent.get_key_symbol();
    if (symbol === KEY_Escape && !(modifiers & ctrlAltMask)) {
      this.close();
      return false;
    }

    let action = this._actionKeys[symbol];

    if (action) action();
    return false;
  }

  private _onGroupDestroy() {
    //this.emit('destroy');
  }

  private _fadeOpen() {
    let monitor = layoutManager.currentMonitor;

    this._backgroundBin.set_position(monitor.x, monitor.y);
    this._backgroundBin.set_size(monitor.width, monitor.height);

    this.state = State.OPENING;

    this._dialogLayout.opacity = 255;
    if (this._lightbox) this._lightbox.show();
    this._group.opacity = 0;
    this._group.show();
    addTween(this._group, {
      opacity: 255,
      time: OPEN_AND_CLOSE_TIME,
      transition: "easeOutQuad",
      onComplete: () => {
        this.state = State.OPENED;
        // this.emit("opened");
      },
    });
  }

  public setInitialKeyFocus(actor: imports.gi.St.Widget) {
    this._initialKeyFocus = actor;
  }

  public open(timestamp?: number) {
    if (this.state == State.OPENED || this.state == State.OPENING) return true;

    if (!this.pushModal(timestamp)) return false;

    this._fadeOpen();
    return true;
  }

  public close(timestamp?: number) {
    if (this.state == State.CLOSED || this.state == State.CLOSING) return;

    this.state = State.CLOSING;
    this.popModal(timestamp);
    this._savedKeyFocus = null;

    addTween(this._group, {
      opacity: 0,
      time: OPEN_AND_CLOSE_TIME,
      transition: "easeOutQuad",
      onComplete: () => {
        this.state = State.CLOSED;
        this._group.hide();
      },
    });
  }

  public popModal(timestamp?: number) {
    if (!this._hasModal) return;

    let focus = global.stage.key_focus;
    if (focus && this._group.contains(focus)) this._savedKeyFocus = focus;
    else this._savedKeyFocus = null;
    popModal(this._group, timestamp);
    global.gdk_screen.get_display().sync();
    this._hasModal = false;

    this._eventBlocker?.raise_top();
  }

  public pushModal(timestamp?: number) {
    if (this._hasModal) return true;
    if (!pushModal(this._group, timestamp)) return false;

    this._hasModal = true;
    if (this._savedKeyFocus) {
      this._savedKeyFocus.grab_key_focus();
      this._savedKeyFocus = null;
    } else this._initialKeyFocus.grab_key_focus();

    this._eventBlocker?.lower_bottom();
    return true;
  }

  public _fadeOutDialog(timestamp?: number) {
    if (this.state == State.CLOSED || this.state == State.CLOSING) return;

    if (this.state == State.FADED_OUT) return;

    this.popModal(timestamp);
    addTween(this._dialogLayout, {
      opacity: 0,
      time: FADE_OUT_DIALOG_TIME,
      transition: "easeOutQuad",
      onComplete: () => {
        this.state = State.FADED_OUT;
      },
    });
  }
}

export class ConfirmDialog extends ModalDialog {
  constructor(label: string, callback: () => void) {
    super({
      showBackdrop: true,
      buttons: [
        {
          label: "No",
          onClick: () => this.destroy(),
        },
        {
          label: "Yes",
          onClick: () => {
            this.destroy();
            callback();
          },
        },
      ],
    });

    this.contentLayout.add(
      new Label({
        text: "Confirm",
        style_class: "confirm-dialog-title",
        important: true,
      })
    );
    this.contentLayout.add(new Label({ text: label }));
  }
}
