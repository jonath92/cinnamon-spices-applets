const { BoxLayout, Entry, Align, Label } = imports.gi.St;

export interface InputProps {
  labelText: string;
  style?: string;
}

export const createInput = (props: InputProps) => {
  const { labelText, style = '' } = props;

  const container = new BoxLayout({
    vertical: true,
    style
  });

  [
    new Label({
      text: labelText,
      style: "padding-bottom: 10px; padding-left: 2px;",
    }),
    new Entry({
      name: "menu-search-entry",
      track_hover: true,
      can_focus: true,
    }),
  ].forEach((widget) => {
    container.add(widget, {
      x_align: Align.START,
      y_align: Align.MIDDLE,
      expand: true,
    });
  });

  return container;
};
