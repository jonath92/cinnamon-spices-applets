import { BoxLayoutChild, createBoxLayout } from "./St/BoxLayout";

const { Bin, Button, Label, Align } = imports.gi.St;
const { pushModal, uiGroup } = imports.ui.main;
const { KEY_Escape } = imports.gi.Clutter;

type ButtonAddProps = Partial<imports.gi.St.BoxLayoutChildInitOptions>;

const createLighbox = (props: {
  child: imports.gi.St.Widget;
  monitor: imports.ui.layout.Monitor;
  destroyOnEsc?: boolean;
}) => {
  const {
    child,
    monitor: { width: monitorWidth, height: monitorHeight },
    destroyOnEsc = true,
  } = props;

  const lightbox = new Bin({
    x: 0,
    y: 0,
    width: monitorWidth,
    height: monitorHeight,
    reactive: true,
    style_class: "lightbox",
    child,
  });

  pushModal(lightbox);
  uiGroup.add_child(lightbox);

  if (destroyOnEsc) {
    lightbox.connect("key-press-event", (_, event) => {
      if (event.get_key_symbol() === KEY_Escape) {
        lightbox.destroy();
      }
      return true;
    });
  }

  return lightbox;
};

export const createDialog = (props: {
  children: imports.gi.St.Widget[];
  monitor: imports.ui.layout.Monitor;
  destroyOnEsc?: boolean;
}) => {
  const { children, monitor, destroyOnEsc = true } = props;

  const dialog = createBoxLayout({
    vertical: true,
    x_expand: true,
    children: children.map((actor) => ({ actor })),
    style_class: "modal-dialog",
    style: "padding: 15px!important; spacing: 15px!important",
  });

  const lightbox = createLighbox({
    monitor,
    destroyOnEsc,
    child: dialog,
  });

  if (destroyOnEsc) {
    dialog.connect("key-press-event", (_, event) => {
      if (event.get_key_symbol() === KEY_Escape) {
        dialog.destroy();
      }
      return true;
    });
  }

  return { ...dialog, destroy: () => lightbox.destroy() };
};

export const createDialogBtn = (props: {
  text: string;
  onClick: () => void;
}) => {
  const { text, onClick } = props;

  const btn = new Button({
    style_class: "modal-dialog-button",
    style: "margin: 0!important",
    reactive: true,
    can_focus: true,
    label: text,
  });

  btn.connect("clicked", onClick);

  return btn;
};

export const createDialogTitle = (props: { text: string }) => {
  const { text } = props;

  return new Label({
    text,
    // important required for some themes (e.g. Cinnamox-Rhino)
    important: true,
    style_class: "confirm-dialog-title",
    style: "padding: 0!important; margin: 0!important",
  });
};

// TODO: currently only working when passing exect two children!
export const createDialogConfirmationBtnBox = (props: {
  children: [imports.gi.St.Widget, imports.gi.St.Widget];
}) => {
  const { children } = props;

  const modalButtonAddProps: ButtonAddProps = {
    expand: true,
    x_fill: false,
  };

  return createBoxLayout({
    style_class: "modal-dialog-button-box",
    style: "padding: 0!important; margin: 0!important;",
    vertical: false,
    children: [
      {
        actor: children[0],
        x_align: Align.START,
        ...modalButtonAddProps,
      },
      {
        actor: children[1],
        x_align: Align.END,
        ...modalButtonAddProps,
      },
    ],
  });
};

export const createConfirmationDialog = (props: {
  monitor: imports.ui.layout.Monitor;
  title: string;
  subTitle: string;
  onConfirmed: () => void;
}) => {
  const { monitor, onConfirmed, title, subTitle } = props;

  const dialog = createDialog({
    monitor,
    children: [
      createDialogTitle({
        text: title,
      }),
      new Label({ text: subTitle }),
      createDialogConfirmationBtnBox({
        children: [
          createDialogBtn({
            text: "No",
            onClick: () => dialog.destroy(),
          }),
          createDialogBtn({
            text: "Yes",
            onClick: () => {
              onConfirmed();
              dialog.destroy();
            },
          }),
        ],
      }),
    ],
  });

  return dialog;
};
