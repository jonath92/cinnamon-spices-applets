// const Clutter = imports.gi.Clutter;
// const Gio = imports.gi.Gio;
// const GLib = imports.gi.GLib;
// const Gtk = imports.gi.Gtk;
// const Mainloop = imports.mainloop;
// const Meta = imports.gi.Meta;
// const Cinnamon = imports.gi.Cinnamon;
// const St = imports.gi.St;
// const GObject = imports.gi.GObject;
// const XApp = imports.gi.XApp;
// const PointerTracker = imports.misc.pointerTracker;

// const SoundManager = imports.ui.soundManager;
// const BackgroundManager = imports.ui.backgroundManager;
// const SlideshowManager = imports.ui.slideshowManager;
// var AppletManager = imports.ui.appletManager;
// const SearchProviderManager = imports.ui.searchProviderManager;
// const DeskletManager = imports.ui.deskletManager;
// const ExtensionSystem = imports.ui.extensionSystem;
// const Keyboard = imports.ui.keyboard;
// const MessageTray = imports.ui.messageTray;
// const OsdWindow = imports.ui.osdWindow;
// const Overview = imports.ui.overview;
// const Expo = imports.ui.expo;
// const Panel = imports.ui.panel;
// const PlacesManager = imports.ui.placesManager;
// const RunDialog = imports.ui.runDialog;
// const Layout = imports.ui.layout;
// const LookingGlass = imports.ui.lookingGlass;
// const NotificationDaemon = imports.ui.notificationDaemon;
// const WindowAttentionHandler = imports.ui.windowAttentionHandler;
// const CinnamonDBus = imports.ui.cinnamonDBus;
// const Screenshot = imports.ui.screenshot;
// const ThemeManager = imports.ui.themeManager;
// const Magnifier = imports.ui.magnifier;
// const XdndHandler = imports.ui.xdndHandler;
// const StatusIconDispatcher = imports.ui.statusIconDispatcher;
// const Util = imports.misc.util;
// const Keybindings = imports.ui.keybindings;
// const Settings = imports.ui.settings;
// const Systray = imports.ui.systray;
// const Accessibility = imports.ui.accessibility;
// const ModalDialog = imports.ui.modalDialog;
// const {readOnlyError} = imports.ui.environment;
// const {installPolyfills} = imports.ui.overrides;

// var LAYOUT_TRADITIONAL = "traditional";
// var LAYOUT_FLIPPED = "flipped";
// var LAYOUT_CLASSIC = "classic";

// // @ts-ignore
// var DEFAULT_BACKGROUND_COLOR: imports.gi.Clutter.Color = Clutter.Color.from_pixel(0x000000ff);

// var panel = null;
// var soundManager = null;
// var backgroundManager = null;
// var slideshowManager = null;
// var placesManager = null;
// var panelManager = null;
// var osdWindowManager = null;
// var overview = null;
// var expo = null;
// var runDialog = null;
// var lookingGlass = null;
// var wm = null;
// var a11yHandler = null;
// var messageTray = null;
// var notificationDaemon = null;
// var windowAttentionHandler = null;
// var recorder = null;
// var cinnamonDBusService: imports.ui.cinnamonDBus.CinnamonDBus;
// var screenshotService = null;
// var modalCount = 0;
// var modalActorFocusStack = [];
// var uiGroup: imports.gi.Cinnamon.GenericContainer;
// var magnifier = null;
// var xdndHandler = null;
// var statusIconDispatcher = null;
// var keyboard = null;
// var layoutManager = null;
// var themeManager = null;
// var keybindingManager = null;
// var _errorLogStack = [];
// var _startDate;
// var _defaultCssStylesheet = null;
// var _cssStylesheet = null;
// var dynamicWorkspaces = null;
// var tracker = null;
// var settingsManager = null;
// var systrayManager = null;
// var wmSettings = null;

// var workspace_names = [];

// var applet_side = St.Side.TOP; // Kept to maintain compatibility. Doesn't seem to be used anywhere
// var deskletContainer = null;

// var software_rendering = false;

// var popup_rendering_actor = null;

// var xlet_startup_error = false;

// var gpu_offload_supported = false;

// var RunState = {
//     INIT : 0,
//     STARTUP : 1,
//     RUNNING : 2
// }

// var runState = RunState.INIT;


// // Override Gettext localization
// const Gettext = imports.gettext;
// Gettext.bindtextdomain('cinnamon', '/usr/share/locale');
// // @ts-ignore
// Gettext.textdomain('cinnamon');
// const _ = Gettext.gettext;


// function setRunState(state: imports.ui.main.RunState) {
//     let oldState = runState;

//     if (state != oldState) {
//         runState = state;
//         cinnamonDBusService.EmitRunStateChanged();
//     }
// }

// function _reparentActor(actor: imports.gi.Clutter.Actor, newParent: imports.gi.Clutter.Actor) {
//     let parent = actor.get_parent();
//     if (parent)
//         parent.remove_actor(actor);
//     if(newParent)
//         newParent.add_actor(actor);
// }

// function start () {
//     global.reparentActor = _reparentActor

//     let cinnamonStartTime = new Date().getTime();

//     setRunState(RunState.STARTUP);

//     let startTime = new Date().getTime();

//     uiGroup = new Cinnamon.GenericContainer({ name: 'uiGroup' });





// }