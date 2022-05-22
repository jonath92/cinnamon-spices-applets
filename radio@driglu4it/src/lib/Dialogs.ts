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
  children: BoxLayoutChild[];
  monitor: imports.ui.layout.Monitor;
  destroyOnEsc?: boolean;
}) => {
  const { children, monitor, destroyOnEsc = true } = props;

  const dialog = createBoxLayout({
    vertical: true,
    children,
    style_class: "modal-dialog",
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
  label: string;
  onClick: () => void;
}) => {
  const { label, onClick } = props;

  const btn = new Button({
    style_class: "modal-dialog-button",
    reactive: true,
    can_focus: true,
    label,
  });

  btn.connect("clicked", onClick);

  return btn;
};

export const createConfirmationDialog = (props: {
  monitor: imports.ui.layout.Monitor;
  title: string;
  subTitle: string;
  onConfirmed: () => void;
}) => {
  const { monitor, onConfirmed, title, subTitle } = props;

  const confirmationTitle = createBoxLayout({
    vertical: true,
    children: [
      {
        actor: new Label({
          text: title,
          // important required for some themes (e.g. Cinnamox-Rhino)
          important: true,
          style_class: "confirm-dialog-title",
        }),
      },
      {
        actor: new Label({
          text: subTitle,
          important: true,
        }),
      },
    ],
  });

  const modalButtonAddProps: ButtonAddProps = {
    expand: true,
    x_fill: false,
    y_fill: false,
    y_align: Align.MIDDLE,
  };

  const confirmationBtnBox = createBoxLayout({
    style_class: "modal-dialog-button-box",
    vertical: false,
    children: [
      {
        actor: createDialogBtn({
          label: "No",
          onClick: () => dialog.destroy(),
        }),
        x_align: Align.START,
        ...modalButtonAddProps,
      },
      {
        actor: createDialogBtn({
          label: "Yes",
          onClick: () => {
            onConfirmed();
            dialog.destroy();
          },
        }),
        x_align: Align.END,
        ...modalButtonAddProps,
      },
    ],
  });

  const dialog = createDialog({
    monitor,
    children: [
      {
        actor: confirmationTitle,
        x_align: Align.MIDDLE,
        y_align: Align.START,
      },
      {
        actor: confirmationBtnBox,
        x_align: Align.MIDDLE,
        y_align: Align.END,
      },
    ],
  });
};
