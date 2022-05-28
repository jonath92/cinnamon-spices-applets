import { LOADING_ICON_NAME } from "../consts";
import {
  createDialog,
  createDialogConfirmationBtnBox,
  createDialogTitle,
} from "../lib/Dialogs";
import { createBoxLayout } from "../lib/St/BoxLayout";
import { createLabel } from "../lib/St/Label";
const { Button, Icon, Label, Align } = imports.gi.St;

type ButtonAddProps = Partial<imports.gi.St.BoxLayoutChildInitOptions>;

const modalButtonAddProps: ButtonAddProps = {
  expand: true,
  x_fill: false,
  y_fill: false,
  y_align: Align.MIDDLE,
};

const createDialogBtn = (props: { label: string; onClick: () => void }) => {
  const { label, onClick } = props;

  const btn = new Button({
    style_class: "modal-dialog-button",
    reactive: true,
    can_focus: true,
    child: createBoxLayout({
      children: [
        {
          actor: new Icon({
            icon_name: LOADING_ICON_NAME,
            style_class: "popup-menu-icon",
            style: "padding-right:10px;",
          }),
        },
        {
          actor: new Label({ text: label }),
        },
      ],
    }),
  });

  btn.connect("clicked", onClick);

  return btn;
};

// const downloadMprisPlugin = ()

export const createDownloadMprisDialog = (props: {
  monitor: imports.ui.layout.Monitor;
}) => {
  const { monitor } = props;

  return createDialog({
    monitor,
    children: [
      createDialogTitle({ text: "Download Confirmation" }),
      createLabel({
        text: "The radio applet depends on the LINK1. It is a 3rd party plugin for mpv,\nwhich allows controlling the radio player remotely (e.g. with the sound applet and KDEConnect).\n\nDo you want to proceed the download at your own risk?\n ",
        links: [
          {
            text: "mpv-mpris plugin",
            href: "https://github.com/hoyon/mpv-mpris",
          },
        ],
      }),

      //   new Label({
      //     text: `The radio applet depends on the 'mpv-mpris' plugin. It is a 3rd party plugin \nfor mpv, which allows controlling the radio player remotely (e.g. with the sound applet and KDEConnect).  \n\nDo you want to proceed the download at your own risk?\n`,
      //   }),
      createDialogConfirmationBtnBox({
        children: [
          createDialogBtn({
            label: "Cancel",
            onClick: () => global.log("todo"),
          }),
          createDialogBtn({
            label: "Yes",
            onClick: () => global.log("todo"),
          }),
        ],
      }),
      //   {
      //     actor: createDialogContent({
      //       title: "Download Confirmation",
      //       subTitle: `The radio applet depends on the 'mpv-mpris' plugin. It is a 3rd party plugin \nfor mpv, which allows controlling the radio player remotely (e.g. with the sound applet and KDEConnect).  \n\nDo you want to proceed the download at your own risk?`,
      //     }),
      //   },
    ],
  });
};
