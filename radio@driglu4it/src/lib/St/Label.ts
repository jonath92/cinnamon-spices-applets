const { Label: NativeLabel } = imports.gi.St;

type LabelNativeProps = Exclude<
  ConstructorParameters<typeof NativeLabel>[0],
  undefined
>;

type LabelProps = LabelNativeProps & {
  isMarkup?: boolean;
};

export const createLabel = (props: LabelProps) => {
  const { isMarkup, ...rest } = props;

  const label = new NativeLabel({ ...rest });

  if (isMarkup) {
    label.clutter_text.set_use_markup(true);
  }

  return label;
};
