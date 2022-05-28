const { Label: NativeLabel } = imports.gi.St;

type LabelNativeProps = Exclude<
  ConstructorParameters<typeof NativeLabel>[0],
  undefined
>;

type LabelProps = LabelNativeProps & {
  text: string; // a label without text doesn't make sense or?
  isMarkup?: boolean;
  links?: Array<{ text: string; href?: string }>;
};

export const createLabel = (props: LabelProps) => {
  const { isMarkup, links = [], text: textRaw, ...rest } = props;

  const labelText = links?.reduce(
    (previous, { text, href }, index) =>
      previous.replace(`LINK${index + 1}`, text),
    textRaw
  );

  const label = new NativeLabel({ ...rest, text: labelText });

  if (isMarkup) {
    label.clutter_text.set_use_markup(true);
  }

  links?.forEach(({ text: linkText, href }, index) => {});

  return label;
};
