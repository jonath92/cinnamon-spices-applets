const { BoxLayout: NativeBoxLayout, Align, Button } = imports.gi.St;

type BoxLayoutNativeProps = Exclude<
  ConstructorParameters<typeof NativeBoxLayout>[0],
  undefined
>;

export type BoxLayoutChild =
  Partial<imports.gi.St.BoxLayoutChildInitOptions> & {
    actor: imports.gi.Clutter.Actor;
  };

type BoxLayoutProps = BoxLayoutNativeProps & {
  children?: BoxLayoutChild[];
};

export const createBoxLayout = (props: BoxLayoutProps) => {
  const { children, ...rest } = props;

  const boxLayout = new NativeBoxLayout({ ...rest });

  if (children) {
    children.forEach(({ actor, ...rest }) =>
      boxLayout.add(actor, {
        ...rest,
      })
    );
  }

  return boxLayout;
};
