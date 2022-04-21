import { ConfirmDialog } from "../lib/Dialogs";
import { createPopupMenu, PopupMenuArguments } from "../lib/PopupMenu";
import { createSeparatorMenuItem } from "../lib/PopupSeperator";
import {
  createSimpleMenuItem,
  SimpleMenuItemArguments,
} from "../lib/SimpleMenuItem";
import { createUpdateStationsMenuItem } from "./RadioPopupMenu/UpdateStationsMenuItem";
const { Lightbox } = imports.ui.lightbox;
const { Bin, BoxLayout, Label, Align, Button } = imports.gi.St;
const { uiGroup, layoutManager, pushModal, popModal } = imports.ui.main;
const { Stack } = imports.gi.Cinnamon;
const { Group, KEY_Escape } = imports.gi.Clutter;
const { spawnCommandLineAsyncIO } = imports.misc.util;
const AppletManager = imports.ui.appletManager;

type ButtonProps = Exclude<ConstructorParameters<typeof Button>[0], undefined>;

type ButtonAddProps = Partial<imports.gi.St.BoxLayoutChildInitOptions>;

const showRemoveAppletDialog = (launcher: imports.gi.St.Widget) => {
  const monitor = layoutManager.findMonitorForActor(launcher);

  const modalButtonProps: ButtonProps = {
    style_class: "modal-dialog-button",
    reactive: true,
    can_focus: true,
  };

  const modalButtonAddProps: ButtonAddProps = {
    expand: true,
    x_fill: false,
    y_fill: false,
    y_align: Align.MIDDLE,
  };

  const lightBoxContainer = new Bin({
    x: 0,
    y: 0,
    width: monitor.width,
    height: monitor.height,
    reactive: true,
    style_class: "lightbox",
  });

  const dialog = new BoxLayout({
    style_class: "modal-dialog",
    vertical: true,
  });

  const contentLayout = new BoxLayout({
    vertical: true,
  });

  dialog.add(contentLayout, {
    x_fill: true,
    y_fill: true,
    x_align: Align.MIDDLE,
    y_align: Align.START,
  });

  // dialog.add(
  //   new Label({
  //     text: "Confirm",
  //     style_class: "confirm-dialog-title",
  //     // TODO: needed?
  //     important: true,
  //   }),
  //   {
  //     x_fill: true,
  //     y_fill: true,
  //     x_align: Align.MIDDLE,
  //     y_align: Align.START,
  //   }
  // );

  contentLayout.add_child(
    new Label({
      text: "Confirm",
      style_class: "confirm-dialog-title",
      // TODO: needed?
      important: true,
    })
  );

  contentLayout.add_child(
    new Label({
      text: `Are you sure you want to remove '${__meta.name}'?`,
      important: true,
    })
  );

  const buttonLayout = new BoxLayout({
    style_class: "modal-dialog-button-box",
    vertical: false,
  });

  const noBtn = new Button({
    ...modalButtonProps,
    label: "No",
  });

  const yesBtn = new Button({
    ...modalButtonProps,
    label: "Yes",
  });

  buttonLayout.add(noBtn, {
    ...modalButtonAddProps,
    x_align: Align.START,
  });

  buttonLayout.add(yesBtn, {
    ...modalButtonAddProps,
    x_align: Align.END,
  });

  dialog.add(buttonLayout, {
    expand: true,
    x_align: Align.MIDDLE,
    y_align: Align.END,
  });

  // add_child is recommended but doesn't work sometimes: https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/3172
  lightBoxContainer.add_actor(dialog);

  pushModal(lightBoxContainer);
  uiGroup.add_child(lightBoxContainer);

  const signalId = lightBoxContainer.connect("key-press-event", (_, event) => {
    if (event.get_key_symbol() === KEY_Escape) {
      lightBoxContainer.destroy();
    }

    // popModal(lightBoxContainer)
    // const numberChildren = lightBoxContainer.get_children().length
    // global.log('numberChildren', numberChildren)
    // uiGroup.remove_child(lightBoxContainer)
    // lightBoxContainer.disconnect(signalId)
    // lightBoxContainer.destroy()
    // popModal(lightBoxContainer)
    // lightBoxContainer.destroy_all_children()
    // lightBoxContainer.destroy()

    return true;
  });

  // const ligthbox = new Lightbox(lightBoxContainer, {
  //   inhibitEvents: true,
  // });

  // ligthbox.show();
};

const spawnCommandLineWithErrorLogging = (command: string) => {
  spawnCommandLineAsyncIO(command, (stdout, stderr) => {
    if (stderr) {
      global.logError(
        `Failed executing: ${command}. The following error occured: ${stderr}`
      );
    }
  });
};

export function createRadioContextMenu(args: PopupMenuArguments) {
  const contextMenu = createPopupMenu(args);

  const defaultMenuArgs: SimpleMenuItemArguments[] = [
    {
      iconName: "dialog-question",
      text: "About...",
      onActivated: () => {
        spawnCommandLineWithErrorLogging(
          `xlet-about-dialog applets ${__meta.uuid}`
        );
      },
    },
    {
      iconName: "system-run",
      text: "Configure...",
      onActivated: () => {
        spawnCommandLineWithErrorLogging(
          `xlet-settings applet ${__meta.uuid} ${__meta.instanceId} -t 0`
        );
      },
    },
    {
      iconName: "edit-delete",
      text: `Remove '${__meta.name}`,
      onActivated: () => showRemoveAppletDialog(args.launcher),
    },
  ];

  contextMenu.add_child(createUpdateStationsMenuItem());
  contextMenu.add(createSeparatorMenuItem());

  defaultMenuArgs.forEach((menuArg) => {
    const menuItem = createSimpleMenuItem({
      ...menuArg,
      onActivated: (self) => {
        contextMenu.close();
        menuArg.onActivated && menuArg?.onActivated(self);
      },
    });
    contextMenu.add_child(menuItem.actor);
  });

  return contextMenu;
}
