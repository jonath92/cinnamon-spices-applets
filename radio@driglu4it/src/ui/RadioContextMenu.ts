import { ConfirmDialog } from "../lib/Dialogs";
import { createPopupMenu, PopupMenuArguments } from "../lib/PopupMenu";
import { createSeparatorMenuItem } from "../lib/PopupSeperator";
import {
  createSimpleMenuItem,
  SimpleMenuItemArguments,
} from "../lib/SimpleMenuItem";
import { createUpdateStationsMenuItem } from "./RadioPopupMenu/UpdateStationsMenuItem";
const { Lightbox } = imports.ui.lightbox;
const { Bin, BoxLayout } = imports.gi.St;
const { uiGroup, layoutManager, pushModal } = imports.ui.main;
const { Stack } = imports.gi.Cinnamon;
const { Group } = imports.gi.Clutter;
const { spawnCommandLineAsyncIO } = imports.misc.util;
const AppletManager = imports.ui.appletManager;

const showRemoveAppletDialog = (launcher: imports.gi.St.Widget) => {
  const monitor = layoutManager.findMonitorForActor(launcher);

  const lightBoxContainer = new Bin({
    x: 0,
    width: monitor.width,
    height: monitor.height,
    reactive: true,
    // style: "background-color: red",
    y: 0,
  });

  const dialogLayout = new BoxLayout({

  })

  lightBoxContainer.connect('key-press-event', () => {
    lightBoxContainer.destroy()

    return true
  })

  pushModal(lightBoxContainer)
  uiGroup.add_child(lightBoxContainer);

  const ligthbox = new Lightbox(lightBoxContainer, {
    inhibitEvents: true,
  });

  ligthbox.show();

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
