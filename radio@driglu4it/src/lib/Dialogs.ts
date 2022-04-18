const { Widget, Bin, BoxLayout, Align, Label } = imports.gi.St;
const { Role } = imports.gi.Atk;
const { uiGroup } = imports.ui.main;
const { BindConstraint, BindCoordinate, Group } = imports.gi.Clutter;
const { Lightbox } = imports.ui.lightbox;
const { Stack } = imports.gi.Cinnamon;
const { State } = imports.ui.modalDialog;

interface ModalDialogParams {
  /**  whether the modal dialog should block Cinnamon input */
  cinnamonReactive: boolean;
  styleClass: string;
}
class ModalDialog {
  public state: number;
  private _hasModal: boolean;
  private _cinnamonReactive: boolean;
  private _group: imports.gi.St.Widget;

  constructor(params?: Partial<ModalDialogParams>) {
    this.state = State.CLOSED;
    this._hasModal = false;

    this._cinnamonReactive = params?.cinnamonReactive || false;
    this._group = new Widget({
      visible: false,
      x: 0,
      y: 0,
      accessible_role: Role.DIALOG,
    });

    uiGroup.add_actor(this._group)

    
  }
}
