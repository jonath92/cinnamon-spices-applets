const { Label: NativeLabel } = imports.gi.St;
const { Cursor } = imports.gi.Cinnamon;
const { app_info_launch_default_for_uri } = imports.gi.Gio;

type LabelNativeProps = Exclude<
  ConstructorParameters<typeof NativeLabel>[0],
  undefined
>;

type LabelProps = LabelNativeProps & {
  text: string; // a label without text doesn't make sense or?
  /**  whether to interpret text as markup, when links are set, the text are however always interpreted as markup */
  isMarkup?: boolean;
  /** Unfortunately it is not possible to use <a href=..> in St.Label Markups. As a workaround, you cann pass an Array of links to this function and each LINK1, LINK2, ... is replaced by an underline text which behaves similar as a normal <a href>*/
  links?: Array<{ text: string; href?: string }>;
};

export const createLabel = (props: LabelProps) => {
  const { isMarkup, links = [], text: textRaw, ...rest } = props;

  const linksIncluded = links.length > 0;

  const urlPositions = links.map(({ text, href }, index) => {
    const rawStartPos = textRaw.indexOf(`LINK${index + 1}`, 0);
    const positionDifferences =
      index === 0
        ? 0
        : links.slice(0, index - 1).reduce((acc, { text }, index) => {
            const placeHolderLength = `LINK${index}`.length;
            const textLength = text.length;
            return acc + (textLength - placeHolderLength);
          }, 0);

    const trueStartPos = rawStartPos + positionDifferences;

    return {
      startPos: trueStartPos,
      endPos: trueStartPos + text.length - 1,
      href: href || text,
    };
  }, []);

  const labelText = links?.reduce(
    (acc, { text }, index) =>
      acc.replace(
        `LINK${index + 1}`,
        `<span foreground="#ccccff"><u>${text}</u></span>`
      ),
    textRaw
  );

  const label = new NativeLabel({
    ...rest,
    text: labelText,
  });

  const getHrefAtEventCoordinates = ({ x, y }: { x: number; y: number }) => {
    const clutterText = label.get_clutter_text();
    const [success, xTransformed, yTransformed] =
      clutterText.transform_stage_point(x, y);

    if (!success) return undefined;

    const xPosIsValid = xTransformed >= 0 && xTransformed <= clutterText.width;
    const yPosIsValid = yTransformed >= 0 && yTransformed <= clutterText.height;

    if (!xPosIsValid || !yPosIsValid) return undefined;

    const pos = clutterText.coords_to_position(xTransformed, yTransformed);

    const hrefAtPos = urlPositions.find(
      ({ startPos, endPos }) => startPos <= pos && endPos >= pos
    )?.href;

    return hrefAtPos;
  };

  if (linksIncluded) {
    label.reactive = true;

    label.connect("motion-event", (actor, event) => {
      if (!actor.visible || actor.get_paint_opacity() == 0) {
        return false;
      }

      const [x, y] = event.get_coords();
      const hrefAtPos = getHrefAtEventCoordinates({ x, y });

      hrefAtPos
        ? global.set_cursor(Cursor.POINTING_HAND)
        : global.unset_cursor();

      return false;
    });

    label.connect("leave-event", () => {
      global.unset_cursor();
      return false;
    });

    label.connect("button-release-event", (actor, event) => {
      const [x, y] = event.get_coords();

      const hrefAtPos = getHrefAtEventCoordinates({ x, y });

      if (hrefAtPos) {
        app_info_launch_default_for_uri(
          hrefAtPos,
          global.create_app_launch_context()
        );
      }

      return false;
    });
  }

  if (isMarkup || linksIncluded) {
    label.clutter_text.set_use_markup(true);
    label.clutter_text.set_selectable(true);
  }

  return label;
};
