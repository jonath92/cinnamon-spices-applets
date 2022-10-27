import { createInput } from "../../lib/Input";
import { getTextColor } from "../../lib/utils";

const { BoxLayout, Entry, Align, Label, Button, Widget } = imports.gi.St;

export const createEditChannelMenuSection = () => {
  const box = new BoxLayout({
    vertical: true,
    style: "padding: 6px;",
    
  });

  const confirmButton = new Button({
    child: new Label({ text: "Confirm" }),
    track_hover: true,
    can_focus: true,
    x_expand: false,
    x_align: Align.END,
    style: `border: solid 1px ${getTextColor()}; margin-top: 12px`,

    style_class: "popup-menu-item",
  });

  confirmButton.connect("notify::hover", () => {
    confirmButton.change_style_pseudo_class("active", confirmButton.hover);
  });



  [
    createInput({ labelText: "Name", style: 'padding-bottom: 10px;' }),
    createInput({ labelText: "Url" }),
  ].forEach((widget) => {
    box.add(widget);
  });

  box.add(confirmButton, {
    x_align: Align.END,
    y_align: Align.START,
    x_fill: false,
    y_fill: false,
    expand: false,
  });

  return box;
};
