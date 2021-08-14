const { TextIconApplet, AllowedLayout, AppletPopupMenu } = imports.ui.applet
const { PopupMenuManager, PopupMenuItem, PopupSeparatorMenuItem } = imports.ui.popupMenu
const { BoxLayout, Label, Side, ScrollView, Align, Icon, IconType, TextDirection, Button, Table, FocusManager, Bin } = imports.gi.St
const { messageTray } = imports.ui.main
const { Urgency, NotificationDestroyedReason } = imports.ui.messageTray
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const { Role } = imports.gi.Atk
const { WrapMode, parse_markup, find_base_dir, Direction, EllipsizeMode } = imports.gi.Pango
const { spawnCommandLine, spawn, findUrls } = imports.misc.util
const { Settings } = imports.gi.Gio
const { PolicyType, IconTheme } = imports.gi.Gtk
const { Clone } = imports.gi.Clutter
const { app_info_launch_default_for_uri } = imports.gi.Gio
const { markup_escape_text } = imports.gi.GLib

const { Cursor } = imports.gi.Cinnamon

const PANEL_EDIT_MODE_KEY = "panel-edit-mode";
const Params = imports.misc.params;

const NOTIFICATION_IMAGE_SIZE = 125;
const NOTIFICATION_IMAGE_OPACITY = 230; // 0 - 255

export class NoticiationApplet extends TextIconApplet {

    public settings: imports.ui.settings.AppletSettings
    private _orientation: imports.gi.St.Side
    public menuManager: imports.ui.popupMenu.PopupMenuManager
    public notifications: imports.ui.messageTray.Notification[]
    private _notificationbin: imports.gi.St.BoxLayout
    public clear_action: imports.ui.popupMenu.PopupMenuItem
    private _blinking: boolean
    private _blink_toggle: boolean
    private _crit_icon: imports.gi.St.Icon
    private _alt_crit_icon: imports.gi.St.Icon
    public menu_label: imports.ui.popupMenu.PopupMenuItem
    private _maincontainer: imports.gi.St.BoxLayout
    public button_label_box: imports.gi.St.BoxLayout
    public clear_separator: imports.ui.popupMenu.PopupSeparatorMenuItem
    public menu: imports.ui.applet.AppletPopupMenu
    public scrollview: imports.gi.St.ScrollView

    constructor(orientation: imports.gi.St.Side, panel_height: number, instance_id: number) {
        super(orientation, panel_height, instance_id)

        this.setAllowedLayout(AllowedLayout.BOTH)


        this._orientation = orientation
        this.menuManager = new PopupMenuManager(this)

        this.notifications = []

        // messageTray.connect('notify-applet-update', (actor, notification) => this._notification_added(actor, notification))
        global.settings.connect('changed::' + PANEL_EDIT_MODE_KEY, Lang.bind(this, this._on_panel_edit_mode_changed));


        this._blinking = false
        this._blink_toggle = false

    }

    _openMenu() {
        this._update_timestamp();
        this.menu.toggle();
    }


    _display() {
        this.set_applet_icon_symbolic_name('empty-notif')
        this.set_applet_tooltip('Notifications')

        // Setup the notification container.
        this._maincontainer = new BoxLayout({
            name: 'traycontainer',
            vertical: true
        })
        global.log('_display called')
        this._notificationbin = new BoxLayout({ vertical: true })
        this.button_label_box = new BoxLayout()

        // Setup the tray icon.
        this.menu_label = new PopupMenuItem(stringify(this.notifications.length));
        this.menu_label.actor.reactive = false;
        this.menu_label.actor.can_focus = false;
        this.menu_label.label.add_style_class_name('popup-subtitle-menu-item');

        this.clear_separator = new PopupSeparatorMenuItem();

        this.clear_action = new PopupMenuItem("Clear notifications");
        this.clear_action.connect('activate', Lang.bind(this, this._clear_all));
        this.clear_action.actor.hide();

        if (this._orientation == Side.BOTTOM) {
            this.menu.addMenuItem(this.menu_label);
            this.menu.addActor(this._maincontainer);
            this.menu.addMenuItem(this.clear_separator);
            this.menu.addMenuItem(this.clear_action);
        } else {
            this.menu.addMenuItem(this.clear_action);
            this.menu.addMenuItem(this.clear_separator);
            this.menu.addMenuItem(this.menu_label);
            this.menu.addActor(this._maincontainer);
        }

        this.scrollview = new ScrollView({
            x_fill: true,
            y_fill: true,
            y_align: Align.START,
            style_class: "vfade",
        });

        this._maincontainer.add(this.scrollview);
        this.scrollview.add_actor(this._notificationbin);
        this.scrollview.set_policy(PolicyType.NEVER, PolicyType.AUTOMATIC);

        let vscroll = this.scrollview.get_vscroll_bar();

        vscroll.connect('scroll-start', () => {
            this.menu.passEvents = true
        })

        vscroll.connect('scroll-stop', () => {
            this.menu.passEvents = false
        })

        this._crit_icon = new Icon({
            icon_name: 'critical-notif',
            icon_type: IconType.SYMBOLIC,
            reactive: true,
            track_hover: true,
            style_class: 'system-status-icon'
        });

        this._alt_crit_icon = new Icon({
            icon_name: 'alt-critical-notif',
            icon_type: IconType.SYMBOLIC,
            reactive: true,
            track_hover: true,
            style_class: 'system-status-icon'
        });

        this._on_panel_edit_mode_changed();

        this.menu.addSettingsAction("Notification Settings", 'notifications');
    }

    _notification_added(actor: imports.ui.messageTray.MessageTray, notification: imports.ui.messageTray.Notification) {

        global.log('notificaton added')

        // @ts-ignore
        const clone = new Clone({
            source: notification.actor
        })


        notification.actor.unparent();
        let existing_index = this.notifications.indexOf(notification);
        if (existing_index != -1) { // This notification is already listed.
            if (notification["_destroyed"]) {
                this.notifications.splice(existing_index, 1);
            } else {
                notification["_inNotificationBin"] = true;
                global.reparentActor(notification.actor, this._notificationbin);
                notification["_timeLabel"].show();
            }
            this.update_list();
            return;
        } else if (notification["_destroyed"]) {
            return;
        }
        // Add notification to list.
        notification["_inNotificationBin"] = true;
        this.notifications.push(notification);
        // Steal the notication panel.
        // @ts-ignore
        this._notificationbin.add(clone);
        // @ts-ignore
        notification.actor._parent_container = this._notificationbin;
        notification.actor.add_style_class_name('notification-applet-padding');
        // Register for destruction.
        // @ts-ignore
        notification.connect('scrolling-changed', (notif, scrolling) => { this.menu.passEvents = scrolling });
        notification.connect('destroy', () => {
            let i = this.notifications.indexOf(notification);
            if (i != -1)
                this.notifications.splice(i, 1);
            this.update_list();
        });
        notification["_timeLabel"].show();

        this.update_list();
    }


    update_list() {
        try {
            let count = this.notifications.length;
            if (count > 0) {    // There are notifications.
                this.actor.show();
                this.clear_action.actor.show();
                this.set_applet_label(count.toString());
                // Find max urgency and derive list icon.
                let max_urgency = -1;
                for (let i = 0; i < count; i++) {
                    let cur_urgency = this.notifications[i].urgency;
                    if (cur_urgency > max_urgency)
                        max_urgency = cur_urgency;
                }
                switch (max_urgency) {
                    case Urgency.LOW:
                        this._blinking = false;
                        this.set_applet_icon_symbolic_name("low-notif");
                        break;
                    case Urgency.NORMAL:
                    case Urgency.HIGH:
                        this._blinking = false;
                        this.set_applet_icon_symbolic_name("normal-notif");
                        break;
                    case Urgency.CRITICAL:
                        if (!this._blinking) {
                            this._blinking = true;
                            this.critical_blink();
                        }
                        break;
                }
            } else {    // There are no notifications.
                this._blinking = false;
                this.set_applet_label('');
                this.set_applet_icon_symbolic_name("empty-notif");
                this.clear_action.actor.hide();
                // @ts-ignore
                // if (!this.showEmptyTray) {
                //     this.actor.hide();
                // }
            }
            this.menu_label.label.set_text(stringify(count));
            this._notificationbin.queue_relayout();
        }
        catch (e) {
            global.logError(e);
        }
    }
    _clear_all() {
        const count = this.notifications.length;
        if (count > 0) {
            for (let i = count - 1; i >= 0; i--) {
                this._notificationbin.remove_actor(this.notifications[i].actor);
                this.notifications[i].destroy(NotificationDestroyedReason.DISMISSED);
            }
        }
        this.notifications = [];
        this.update_list();
    }

    _on_panel_edit_mode_changed() {
        if (global.settings.get_boolean(PANEL_EDIT_MODE_KEY)) {
            this.actor.show();
        } else {
            this.update_list();
        }
    }

    on_applet_added_to_panel() {
        this.on_orientation_changed(this._orientation);
    }

    on_orientation_changed(orientation: imports.gi.St.Side) {
        this._orientation = orientation;

        if (this.menu) {
            this.menu.destroy();
        }
        this.menu = new AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);
        this._display();
    }

    on_applet_clicked(event: imports.gi.Clutter.Event) {
        global.log('applet_clicked')
        //this._notificationbin.remove_all_children()

        const notificiaton = new Notification('Title', 'Body')

        global.log(notificiaton)
        this._notificationbin.add_child(notificiaton.actor)

        this._openMenu();
    }

    on_btn_open_system_settings_clicked() {
        spawnCommandLine("cinnamon-settings notifications");
    }

    _update_timestamp() {
        let len = this.notifications.length;
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                let notification = this.notifications[i];
                let orig_time = notification["_timestamp"];
                notification["_timeLabel"].clutter_text.set_markup(timeify(orig_time));
            }
        }
    }

    critical_blink() {
        if (!this._blinking)
            return;
        if (this._blink_toggle) {
            this._applet_icon_box.child = this._crit_icon
        } else {
            this._applet_icon_box.child = this._alt_crit_icon
        }

        this._blink_toggle = !this._blink_toggle

        Mainloop.timeout_add_seconds(1, Lang.bind(this, this.critical_blink));

    }
}

function stringify(count: number) {
    if (count === 0) {
        return "No notifications";
    } else {
        return `notifications ${count}`
    }
}


function timeify(orig_time: Date) {
    let settings = new Settings({ schema_id: 'org.cinnamon.desktop.interface' });
    let use_24h = settings.get_boolean('clock-use-24h');
    let now = new Date();
    let diff = Math.floor((now.getTime() - orig_time.getTime()) / 1000); // get diff in seconds
    let str;
    if (use_24h) {
        // @ts-ignore (toLocaleFormat exist on Date but is depreacted: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_toLocaleFormat )
        str = orig_time.toLocaleFormat('%T');
    } else {
        //@ts-ignore
        str = orig_time.toLocaleFormat('%r');
    }
    return str;
}

class Notification {

    source: imports.ui.messageTray.SystemNotificationSource
    title: string
    urgency: imports.ui.messageTray.Urgency
    resident: boolean
    isTransient: boolean
    silent: boolean
    _destroyed: boolean
    _useActionIcons: boolean
    _titleDirection: imports.gi.St.TextDirection
    _actionArea: imports.gi.St.BoxLayout
    _scrollArea: imports.gi.St.ScrollView
    _imageBin: imports.gi.St.Bin
    _timestamp: Date
    _inNotificationBin: boolean
    actor: imports.gi.St.Button
    _table: imports.gi.St.Table
    _buttonFocusManager: imports.gi.St.FocusManager
    _bannerBox: imports.gi.St.BoxLayout
    _icon: imports.gi.St.Icon
    _bodyUrlHighlighter: URLHighlighter

    _timeLabel: imports.gi.St.Label
    _titleLabel: imports.gi.St.Label

    constructor(title: string, body: string, params?: Partial<imports.ui.messageTray.NotificationParams>) {
        this.title = title
        this.resident = false
        this.isTransient = false
        this.silent = false
        this._destroyed = false
        this._useActionIcons = false
        this._titleDirection = TextDirection.DEFAULT;
        this._scrollArea = null;
        this._actionArea = null;
        this._imageBin = null;
        this._timestamp = new Date();
        this._inNotificationBin = false


        //source.connect('destroy', (source, reason) => this.destroy(reason))

        this.actor = new Button({
            accessible_role: Role.NOTIFICATION,
            style_class: 'notification-applet-padding'
        })

        // @ts-ignore
        this.actor._parent_container = null

        //this.actor.connect('clicked', () => this._onClicked())
        //this.actor.connect('destroy', () => this._onDestroy())

        this._table = new Table({
            name: 'notification',
            reactive: true
        })

        this.actor.set_child(this._table)

        this._buttonFocusManager = FocusManager.get_for_stage(global.stage)

        // // the banner box is now just a simple vbox.
        // // The first line should have the time, and the second the title.
        // // Time only shown inside message tray.
        this._bannerBox = new BoxLayout({
            vertical: true,
            style: 'spacing: 4px'
        })

        // TODO: I think this lead to the warning: 
        // (cinnamon:12352): St-WARNING **: 11:40:22.623: StTable: col-span exceeds number of columns
        this._table.add(this._bannerBox, {
            row: 0,
            col: 1,
            col_span: 2,
            x_expand: false,
            y_expand: false,
            y_fill: false
        })

        this._timeLabel = new Label({
            show_on_set_parent: false
        })


        this._titleLabel = new Label()


        this._titleLabel.clutter_text.line_wrap = true
        this._titleLabel.clutter_text.line_wrap_mode = WrapMode.WORD_CHAR

        this._bannerBox.add_actor(this._timeLabel)
        this._bannerBox.add_actor(this._titleLabel)

        this._table.add(new Bin(), {
            row: 2,
            col: 2,
            y_expand: false,
            y_fill: false
        })

        const icon = new Icon({
            icon_name: 'window-close',
            icon_type: IconType.SYMBOLIC,
            icon_size: 16
        })

        const closeButton = new Button({
            child: icon,
            opacity: 128
        })

        //closeButton.connect('clicked', () => this._destroy())
        closeButton.connect('notify::hover', () => closeButton.opacity = closeButton.hover ? 255 : 128)

        this._table.add(closeButton, {
            row: 0,
            col: 3,
            x_expand: false,
            y_expand: false,
            y_fill: false,
            y_align: Align.START
        });
        // // set icon, title, body
        this.update(title, body, params);
    }

    update(title: string, body: string, params: Partial<imports.ui.messageTray.NotificationParams>) {
        this._timestamp = new Date();

        this._inNotificationBin = false

        params = Params.parse(params, {
            icon: null,
            titleMarkup: false,
            bodyMarkup: false,
            silent: false
        });

        this.silent = params.silent

        if (this._icon && params.icon) {
            this._icon.destroy()
            this._icon = null
        }

        // if (!this._icon) {
        //     this._icon = params.icon;
        //     this._table.add(this._icon, {
        //         row: 0,
        //         col: 0,
        //         x_expand: false,
        //         y_expand: false,
        //         y_fill: false,
        //         y_align: Align.START
        //     })
        // }

        if (typeof (title) === 'string') {
            this.title = _fixMarkup(title.replace(/\n/g, ' '), params.titleMarkup);
        } else {
            this.title = "";
        }

        this._titleLabel.clutter_text.set_markup('<b>' + this.title + '</b>');
        this._timeLabel.clutter_text.set_markup(this._timestamp.toLocaleTimeString());
        // this._timeLabel.hide();

        // if (find_base_dir(title, 1) === Direction.RTL)
        //     this._titleDirection = TextDirection.RTL
        // else
        //     this._titleDirection = TextDirection.LTR

        // // Let the title's text direction control the overall direction
        // // of the notification - in case where different scripts are used
        // // in the notification, this is the right thing for the icon, and
        // // arguably for action buttons as well. Labels other than the title
        // // will be allocated at the available width, so that their alignment
        // // is done correctly automatically.
        // this._table.set_direction(this._titleDirection);
        // // TODO: hier weitermachen

        this._setBodyArea(body, params.bodyMarkup);
    }


    _setBodyArea(text: string, allowMarkup: boolean) {
        if (text) {
            if (!this._scrollArea) {
                /* FIXME: vscroll should be enabled
                 * -vfade covers too much for this size of scrollable
                 * -scrollview min-height is broken inside tray with a scrollview
                 * 
                 * TODO: when scrollable:
                 * 
                 * applet connects to this signal to enable captured-event passthru so you can grab the scrollbar:
                 * let vscroll = this._scrollArea.get_vscroll_bar();
                 * vscroll.connect('scroll-start', () => { this.emit('scrolling-changed', true) });
                 * vscroll.connect('scroll-stop', () => { this.emit('scrolling-changed', false) });
                 * 
                 * `enable_mouse_scrolling` makes it difficult to scroll when there are many notifications
                 * in the tray because most of the area is these smaller scrollviews which capture the event.
                 * ideally, this should only be disabled when the notification is in the tray and there are
                 * many notifications.
                 */
                this._scrollArea = new ScrollView({
                    name: 'notification-scrollview',
                    vscrollbar_policy: PolicyType.NEVER,
                    hscrollbar_policy: PolicyType.NEVER,
                    enable_mouse_scrolling: false/*,
                                                       style_class: 'vfade'*/ });

                this._table.add(this._scrollArea, {
                    row: 1,
                    col: 2
                });

                let content = new BoxLayout({
                    name: 'notification-body',
                    vertical: true
                });
                this._scrollArea.add_actor(content);

                // body label
                this._bodyUrlHighlighter = new URLHighlighter("", true, false);
                content.add(this._bodyUrlHighlighter.actor);
            }
            this._bodyUrlHighlighter.setMarkup(text, allowMarkup);
        } else {
            if (this._scrollArea) {
                this._scrollArea.destroy()
                this._scrollArea = null;
                this._bodyUrlHighlighter = null;
            }
        }
        this._updateLayout();
    }

    setIconVisible(visible: boolean) {
        if (this._icon)
            this._icon.visible = visible;
    }

    /**
  * scrollTo:
  * @side (St.Side): St.Side.TOP or St.Side.BOTTOM
  * 
  * Scrolls the content area (if scrollable) to the indicated edge
  */
    scrollTo(side: imports.gi.St.Side) {
        if (!this._scrollArea)
            return;
        let adjustment = this._scrollArea.vscroll.adjustment;
        if (side == Side.TOP)
            adjustment.value = adjustment.lower;
        else if (side == Side.BOTTOM)
            adjustment.value = adjustment.upper;
    }

    _updateLayout() {
        if (this._imageBin || this._scrollArea || this._actionArea) {
            this._table.add_style_class_name('multi-line-notification');
        } else {
            this._table.remove_style_class_name('multi-line-notification');
        }

        if (this._imageBin) {
            this._table.add_style_class_name('notification-with-image');
        } else {
            this._table.remove_style_class_name('notification-with-image');
        }

        if (this._scrollArea)
            this._table.child_set(this._scrollArea, {
                col: this._imageBin ? 2 : 1,
                col_span: this._imageBin ? 2 : 3
            });
        if (this._actionArea)
            this._table.child_set(this._actionArea, {
                col: this._imageBin ? 2 : 1,
                col_span: this._imageBin ? 2 : 3
            });
    }

    // setImage(image) {
    //     if (this._imageBin)
    //         this.unsetImage();
    //     if (!image)
    //         return;
    //     this._imageBin = new Bin({
    //         child: image,
    //         opacity: NOTIFICATION_IMAGE_OPACITY
    //     });

    //     this._table.add(this._imageBin, {
    //         row: 1,
    //         col: 1,
    //         row_span: 2,
    //         x_expand: false,
    //         y_expand: false,
    //         x_fill: false,
    //         y_fill: false
    //     });
    //     this._updateLayout();
    // }

    unsetImage() {
        if (!this._imageBin)
            return;
        this._imageBin.destroy();
        this._imageBin = null;
        this._updateLayout();
    }

    /**
     * addButton:
     * @id (number): the action ID
     * @label (string): the label for the action's button
     * 
     * Adds a button with the given @label to the notification. All
     * action buttons will appear in a single row at the bottom of
     * the notification.
     * 
     * If the button is clicked, the notification will emit the
     * %action-invoked signal with @id as a parameter.
     */
    addButton(id: string, label: string) {
        if (!this._actionArea) {
            this._actionArea = new BoxLayout({
                name: 'notification-actions'
            });

            this._table.add(this._actionArea, {
                row: 2,
                col: 1,
                col_span: 3,
                x_expand: true,
                y_expand: false,
                x_fill: true,
                y_fill: false,
                x_align: Align.START
            });
        }

        let button = new Button({ can_focus: true });

        if (this._useActionIcons
            && id.endsWith("-symbolic")
            && IconTheme.get_default().has_icon(id)) {
            button.add_style_class_name('notification-icon-button');
            button.child = new Icon({ icon_name: id });
        } else {
            button.add_style_class_name('notification-button');
            button.label = label;
        }

        if (this._actionArea.get_n_children() > 0)
            this._buttonFocusManager.remove_group(this._actionArea);

        this._actionArea.add(button);
        this._buttonFocusManager.add_group(this._actionArea);
        //button.connect('clicked', Lang.bind(this, this._onActionInvoked, id));
        this._updateLayout();
    }

    /**
     * clearButtons:
     * 
     * Removes all buttons.
     */
    clearButtons() {
        if (!this._actionArea)
            return;
        this._actionArea.destroy();
        this._actionArea = null;
        this._updateLayout();
    }

    setUrgency(urgency: imports.ui.messageTray.Urgency) {
        this.urgency = urgency;
    }

    setResident(resident: boolean) {
        this.resident = resident;
    }

    setTransient(isTransient: boolean) {
        this.isTransient = isTransient;
    }

    setUseActionIcons(useIcons: boolean) {
        this._useActionIcons = useIcons;
    }

    _onActionInvoked(actor: imports.gi.St.Button, mouseButtonClicked: number, id?: string) {
        if (!this.resident) {
        }
    }



}


function _fixMarkup(text: string, allowMarkup: boolean) {
    if (allowMarkup) {
        // Support &amp;, &quot;, &apos;, &lt; and &gt;, escape all other
        // occurrences of '&'.
        let _text = text.replace(/&(?!amp;|quot;|apos;|lt;|gt;)/g, '&amp;');

        // Support <b>, <i>, and <u>, escape anything else
        // so it displays as raw markup.
        _text = _text.replace(/<(?!\/?[biu]>)/g, '&lt;');

        try {
            parse_markup(_text, -1, '');
            return _text;
        } catch (e) { }
    }

    // !allowMarkup, or invalid markup
    return markup_escape_text(text, -1);
}



class URLHighlighter {

    actor: imports.gi.St.Label;
    _linkColor: string;
    _text: string;
    _urls: imports.misc.util.Urls[]

    constructor(text: string, lineWrap: boolean, allowMarkup: boolean) {

        if (!text)
            text = '';

        this.actor = new Label({
            reactive: true,
            style_class: 'url-highlighter'
        })

        this._linkColor = '#ccccff';

        this.actor.connect('style-changed', Lang.bind(this, function () {
            let [hasColor, color] = this.actor.get_theme_node().lookup_color('link-color', false);
            if (hasColor) {
                let linkColor = color.to_string().substr(0, 7);
                if (linkColor != this._linkColor) {
                    this._linkColor = linkColor;
                    this._highlightUrls();
                }
            }
        }));

        if (!lineWrap) {
            this.actor.clutter_text.line_wrap = true;
            this.actor.clutter_text.line_wrap_mode = WrapMode.WORD_CHAR;
            this.actor.clutter_text.ellipsize = EllipsizeMode.NONE
        }

        this.setMarkup(text, allowMarkup);

        this.actor.connect('button-press-event', Lang.bind(this, function (actor, event) {
            // Don't try to URL highlight when invisible.
            // The MessageTray doesn't actually hide us, so
            // we need to check for paint opacities as well.
            if (!actor.visible || actor.get_paint_opacity() == 0)
                return false;

            // Keep Notification.actor from seeing this and taking
            // a pointer grab, which would block our button-release-event
            // handler, if an URL is clicked
            return this._findUrlAtPos(event) != -1;
        }));

        this.actor.connect('button-release-event', Lang.bind(this, function (actor, event) {
            if (!actor.visible || actor.get_paint_opacity() == 0)
                return false;

            let urlId = this._findUrlAtPos(event);
            if (urlId != -1) {
                let url = this._urls[urlId].url;
                if (url.indexOf(':') == -1)
                    url = 'http://' + url;
                try {
                    app_info_launch_default_for_uri(url, global.create_app_launch_context());
                    return true;
                } catch (e) {
                    // TODO: remove this after gnome 3 release
                    spawn(['gio', 'open', url]);
                    return true;
                }
            }
            return false;
        }));

        this.actor.connect('motion-event', Lang.bind(this, function (actor, event) {
            if (!actor.visible || actor.get_paint_opacity() == 0)
                return false;

            let urlId = this._findUrlAtPos(event);
            if (urlId != -1 && !this._cursorChanged) {
                global.set_cursor(Cursor.POINTING_HAND);
                this._cursorChanged = true;
            } else if (urlId == -1) {
                global.unset_cursor();
                this._cursorChanged = false;
            }
            return false;
        }));

        this.actor.connect('leave-event', Lang.bind(this, function () {
            if (!this.actor.visible || this.actor.get_paint_opacity() == 0)
                return;

            if (this._cursorChanged) {
                this._cursorChanged = false;
                global.unset_cursor();
            }
        }));
    }

    setMarkup(text: string, allowMarkup: boolean) {
        text = text ? _fixMarkup(text, allowMarkup) : '';
        this._text = text;
        this.actor.clutter_text.set_markup(text);
        this._urls = findUrls(this.actor.clutter_text.text);
    }

    _highlightUrls() {
        // text here contain markup
        let urls = findUrls(this._text);
        let markup = '';
        let pos = 0;
        for (let i = 0; i < urls.length; i++) {
            let url = urls[i];
            let str = this._text.substr(pos, url.pos - pos);
            markup += str + '<span foreground="' + this._linkColor + '"><u>' + url.url + '</u></span>';
            pos = url.pos + url.url.length;
        }
        markup += this._text.substr(pos);
        this.actor.clutter_text.set_markup(markup);
    }

    _findUrlAtPos(event: imports.gi.Clutter.Event) {
        if (!this._urls.length)
            return -1;

        let success;
        let [x, y] = event.get_coords();
        let ct = this.actor.clutter_text;
        [success, x, y] = ct.transform_stage_point(x, y);
        if (success && x >= 0 && x <= ct.width
            && y >= 0 && y <= ct.height) {
            let pos = ct.coords_to_position(x, y);
            for (let i = 0; i < this._urls.length; i++) {
                let url = this._urls[i]
                if (pos >= url.pos && pos <= url.pos + url.url.length)
                    return i;
            }
        }
        return -1;
    }

}