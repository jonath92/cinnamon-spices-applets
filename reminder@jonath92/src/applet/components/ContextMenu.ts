import { APPLET_SHORT_NAME } from "../../consts";
import { createPopupMenu } from "cinnamonpopup";
const { BoxLayout, Label, Icon, IconType } = imports.gi.St;
const { spawnCommandLine } = imports.misc.util;
const { KEY_space, KEY_KP_Enter, KEY_Return } = imports.gi.Clutter;
const { ConfirmDialog } = imports.ui.modalDialog;
const { _removeAppletFromPanel } = imports.ui.appletManager;

let contextMenu: ReturnType<typeof createPopupMenu> | null = null;

interface ContextMenuArguments {
  launcher: imports.gi.St.BoxLayout;
  instanceId: number;
}

interface ContextMenuItemArguments {
  text: string;
  iconName: string;
  onClick: () => void;
}

function createContextMenuItem(args: ContextMenuItemArguments) {
  const { text, iconName, onClick } = args;

  const popupMenuItem = new BoxLayout({
    style_class: "popup-menu-item",
    can_focus: true,
    track_hover: true,
    reactive: true,
  });

  // @ts-ignore
  popupMenuItem.connect("button-press-event", onClick);

  popupMenuItem.connect("notify::hover", () => {
    popupMenuItem.change_style_pseudo_class("active", popupMenuItem.hover);
    popupMenuItem.hover && popupMenuItem.grab_key_focus();
  });

  // @ts-ignore
  popupMenuItem.connect("key-press-event", (actor, event) => {
    const symbol = event.get_key_symbol();
    const relevantKeys = [KEY_space, KEY_KP_Enter, KEY_Return];

    if (relevantKeys.includes(symbol) && popupMenuItem.hover) onClick();
  });

  const label = new Label({ text });
  const icon = new Icon({
    style_class: "popup-menu-icon",
    icon_name: iconName,
    icon_type: IconType.SYMBOLIC,
  });

  popupMenuItem.add_child(icon);
  popupMenuItem.add_child(label);

  return popupMenuItem;
}

export function getContextMenu(args: ContextMenuArguments): {
  toggle: ReturnType<typeof createPopupMenu>["toggle"];
} {
  const { launcher, instanceId } = args;

  if (contextMenu) {
    return { toggle: contextMenu.toggle };
  }

  contextMenu = createPopupMenu({ launcher });

  const aboutItem = createContextMenuItem({
    text: "About ...",
    iconName: "dialog-question",
    onClick: () => {
      spawnCommandLine(`xlet-about-dialog applets ${__meta.uuid}`);
    },
  });

  const removeItem = createContextMenuItem({
    text: `Remove ${__meta.name}`,
    iconName: "edit-delete",
    onClick: () => {
      const dialog = new ConfirmDialog(
        `Are you sure you want to remove ${__meta.name}?`,
        () => _removeAppletFromPanel(__meta.uuid, instanceId)
      );
      dialog.open();
    },
  });

  const configureItem = createContextMenuItem({
    text: "Configure ...",
    iconName: "system-run",
    onClick: () => {
      global.log(`cjs ${__dirname}/${APPLET_SHORT_NAME}-settings.js`);
      spawnCommandLine(`cjs ${__dirname}/${APPLET_SHORT_NAME}-settings.js`);
    },
  });

  [aboutItem, removeItem, configureItem].forEach((item) =>
    contextMenu?.add_child(item)
  );

  return { toggle: contextMenu.toggle };
}
