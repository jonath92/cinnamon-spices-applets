const { TextIconApplet, AllowedLayout, AppletPopupMenu } = imports.ui.applet
const { PopupMenuManager, PopupMenuItem, PopupSeparatorMenuItem } = imports.ui.popupMenu
const { BoxLayout, Label, Side, ScrollView, Align, Icon, IconType } = imports.gi.St

const { messageTray } = imports.ui.main
const { Urgency, NotificationDestroyedReason } = imports.ui.messageTray
const Mainloop = imports.mainloop;
const Lang = imports.lang;

const { spawnCommandLine } = imports.misc.util

const { Settings } = imports.gi.Gio

const { PolicyType } = imports.gi.Gtk

const { Clone } = imports.gi.Clutter

const PANEL_EDIT_MODE_KEY = "panel-edit-mode";


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

        messageTray.connect('notify-applet-update', (actor, notification) => this._notification_added(actor, notification))
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
                if (!this.showEmptyTray) {
                    this.actor.hide();
                }
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
