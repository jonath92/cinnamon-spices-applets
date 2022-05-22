import { createConfirmationDialog } from "../lib/Dialogs";
import { createPopupMenu, PopupMenuArguments } from "../lib/PopupMenu";
import { createSeparatorMenuItem } from "../lib/PopupSeperator";
import {
  createSimpleMenuItem,
  SimpleMenuItemArguments,
} from "../lib/SimpleMenuItem";
import { createUpdateStationsMenuItem } from "./RadioPopupMenu/UpdateStationsMenuItem";
const { layoutManager } = imports.ui.main;
const { spawnCommandLineAsyncIO } = imports.misc.util;
const AppletManager = imports.ui.appletManager;

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
  const monitor = layoutManager.findMonitorForActor(args.launcher);

  const { uuid, instanceId, name: appletName } = __meta;

  const defaultMenuArgs: SimpleMenuItemArguments[] = [
    {
      iconName: "dialog-question",
      text: "About...",
      onActivated: () => {
        spawnCommandLineWithErrorLogging(`xlet-about-dialog applets ${uuid}`);
      },
    },
    {
      iconName: "system-run",
      text: "Configure...",
      onActivated: () => {
        spawnCommandLineWithErrorLogging(
          `xlet-settings applet ${uuid} ${instanceId} -t 0`
        );
      },
    },
    {
      iconName: "edit-delete",
      text: `Remove '${appletName}`,
      onActivated: () =>
        createConfirmationDialog({
          monitor,
          title: "Confirm",
          subTitle: `Are you sure you want to remove '${__meta.name}'?`,
          onConfirmed: () =>
            AppletManager._removeAppletFromPanel(
              __meta.uuid,
              __meta.instanceId
            ),
        }),
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
