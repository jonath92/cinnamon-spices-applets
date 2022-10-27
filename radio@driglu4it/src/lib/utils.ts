const { Bin } = imports.gi.St;


export const getTextColor = () => {
  let dummyActor: imports.gi.St.Bin | undefined = new Bin({
    style_class: "menu",
    visible: false,
  });

  global.stage.add_child(dummyActor);
  const foregroundColor =  dummyActor.get_theme_node().get_foreground_color();
  dummyActor.destroy();
  dummyActor = undefined;

  return foregroundColor.to_string().substring(0, 7)
};


