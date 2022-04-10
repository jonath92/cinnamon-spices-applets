import { createSimpleMenuItem } from "../../lib/SimpleMenuItem";
import { createPopupMenu } from "../../lib/PopupMenu";
import { createSeparatorMenuItem } from "../../lib/PopupSeperator";
import { mpvHandler } from "../../services/mpv/MpvHandler";
import { createInfoSection } from "../InfoSection";
import { createSeeker } from "../Seeker";
import { createVolumeSlider } from "../VolumeSlider";
import { createChannelList } from "./ChannelList";
import { createMediaControlToolbar } from "./MediaControlToolbar/MediaControlToolbar";

const { BoxLayout, Label } = imports.gi.St;
const { spawnCommandLine } = imports.misc.util;

export function createRadioPopupMenu(props: {
  launcher: imports.gi.St.BoxLayout;
}) {
  const { launcher } = props;

  const { getPlaybackStatus, addPlaybackStatusChangeHandler } = mpvHandler;

  const popupMenu = createPopupMenu({ launcher });

  const radioActiveSection = new BoxLayout({
    vertical: true,
    visible: getPlaybackStatus() !== "Stopped",
  });

  [
    createInfoSection(),
    createMediaControlToolbar(),
    createVolumeSlider(),
    createSeeker(),
  ].forEach((widget) => {
    radioActiveSection.add_child(createSeparatorMenuItem());
    radioActiveSection.add_child(widget);
  });

  popupMenu.add_child(createChannelList());
  popupMenu.add_child(radioActiveSection);

  // TODO: this is not good as it is redundant (already used in IconMenuItem)
  // const searchStationItem = new BoxLayout({
  //     style_class: 'popup-menu-item',
  // })

  const searchStationItem = createSimpleMenuItem({
    initialText: "Find Station",
    onActivated: () => spawnCommandLine(`cjs ${__meta.path}/radio-applet-settings.js`),
  });

  popupMenu.add_child(createSeparatorMenuItem());
  popupMenu.add_child(searchStationItem.actor);

  addPlaybackStatusChangeHandler((newValue) => {
    radioActiveSection.visible = newValue !== "Stopped";
  });

  return popupMenu;
}
