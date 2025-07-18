const Applet = imports.ui.applet;
const Lang = imports.lang;
const Main = imports.ui.main;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Urgency = imports.ui.messageTray.Urgency;
const NotificationDestroyedReason = imports.ui.messageTray.NotificationDestroyedReason;
const Settings = imports.ui.settings;
const Gettext = imports.gettext;
const Util = imports.misc.util;

const PANEL_EDIT_MODE_KEY = "panel-edit-mode";

const UUID = "notifications-enhanced@hilyxx";
Gettext.bindtextdomain(UUID, GLib.get_home_dir() + "/.local/share/locale");

function _(str) {
    return Gettext.dgettext(UUID, str);
}

class CinnamonNotificationsApplet extends Applet.TextIconApplet {
    constructor(metadata, orientation, panel_height, instanceId) {
        super(orientation, panel_height, instanceId);

        this.setAllowedLayout(Applet.AllowedLayout.BOTH);

        // Settings
        this.settings = new Settings.AppletSettings(this, UUID, instanceId);
        this.settings.bind("ignoreTransientNotifications", "ignoreTransientNotifications");
        this.settings.bind("showEmptyTray", "showEmptyTray", this._show_hide_tray);
        this.settings.bind("showDisturbIcon", "showDisturbIcon", this._show_disturb_icon);
        this.settings.bind("keyOpen", "keyOpen", this._setKeybinding);
        this.settings.bind("keyClear", "keyClear", this._setKeybinding);
        this.settings.bind("keyMute", "keyMute", this._setKeybinding);
        this.settings.bind("showNotificationCount", "showNotificationCount", this.update_list);
        this.settings.bind("showNotificationSettings", "showNotificationSettings", this._show_settings_action);
        this._setKeybinding();

        this.notif_settings = new Gio.Settings({ schema_id: "org.cinnamon.desktop.notifications" });
        this.notif_settings.connect('changed::display-notifications', Lang.bind(this, function() {
        this.set_icon_status(this.notif_settings.get_boolean("display-notifications"));
        }));        

        // Layout
        this._orientation = orientation;
        this.menuManager = new PopupMenu.PopupMenuManager(this);

        // Lists
        this.notifications = [];    // The list of notifications, in order from oldest to newest.

        // Events
        Main.messageTray.connect('notify-applet-update', Lang.bind(this, this._notification_added));
        global.settings.connect('changed::' + PANEL_EDIT_MODE_KEY, Lang.bind(this, this._on_panel_edit_mode_changed));

        // States
        this._blinking = false;
        this._blink_toggle = false;
    }

    _setKeybinding() {
        Main.keybindingManager.addHotKey("notification-open-" + this.instance_id, this.keyOpen, Lang.bind(this, this._openMenu));
        Main.keybindingManager.addHotKey("notification-clear-" + this.instance_id, this.keyClear, Lang.bind(this, this._clear_all));
        Main.keybindingManager.addHotKey("notification-mute-" + this.instance_id, this.keyMute, Lang.bind(this, this.mute_notifications));
    }

    on_applet_removed_from_panel () {
        Main.keybindingManager.removeHotKey("notification-open-" + this.instance_id);
        Main.keybindingManager.removeHotKey("notification-clear-" + this.instance_id);
        Main.keybindingManager.removeHotKey("notification-mute-" + this.instance_id);
    }

    _openMenu() {
        this._update_timestamp();
        this.menu.toggle();
    }

    _display() {
        // Always start the applet empty, void of any notifications.
        this.set_applet_icon_symbolic_name("empty-notification");

        // Setup the notification container.
        this._maincontainer = new St.BoxLayout({name: 'traycontainer', vertical: true});
        this._notificationbin = new St.BoxLayout({vertical:true});

        // Setup the tray icon.
        this.menu_label = new PopupMenu.PopupMenuItem(stringify(this.notifications.length));
        this.menu_label.label.add_style_class_name('popup-notif-label');
        this.menu_label.actor.reactive = false;
        this.menu_label.actor.can_focus = false;

        this.notDisturb_label = new PopupMenu.PopupIconMenuItem(_("Do not disturb"), "notification-off", St.IconType.SYMBOLIC);
        this.notDisturb_label.label.add_style_class_name('popup-tray-label');
        this.notDisturb_label.actor.add_style_class_name('popup-tray-icon');
        this.notDisturb_label.actor.reactive = false;
        this.notDisturb_label.actor.can_focus = false;

        this.noNotif_label = new PopupMenu.PopupIconMenuItem(_("No notifications"), "empty-notification", St.IconType.SYMBOLIC);
        this.noNotif_label.label.add_style_class_name('popup-tray-label');
        this.noNotif_label.actor.add_style_class_name('popup-tray-icon');
        this.noNotif_label.actor.reactive = false;
        this.noNotif_label.actor.can_focus = false;

        this.clear_separator = new PopupMenu.PopupSeparatorMenuItem();

        this.clear_action = new PopupMenu.PopupMenuItem(_("Clear notifications"));
        this.clear_action.connect('activate', Lang.bind(this, this._clear_all));
        this.clear_action.actor.hide();

        if (this._orientation == St.Side.BOTTOM) {
            this.menu.addMenuItem(this.menu_label);
            this.menu.addMenuItem(this.notDisturb_label);
            this.menu.addMenuItem(this.noNotif_label);
            this.menu.addActor(this._maincontainer);
            this.menu.addMenuItem(this.clear_separator);
            this.menu.addMenuItem(this.clear_action);
        } else {
            this.menu.addMenuItem(this.clear_action);
            this.menu.addMenuItem(this.clear_separator);
            this.menu.addMenuItem(this.notDisturb_label);
            this.menu.addMenuItem(this.noNotif_label);
            this.menu.addMenuItem(this.menu_label);
            this.menu.addActor(this._maincontainer);
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Setup the notification switch
        this.notificationsSwitch = new PopupMenu.PopupSwitchMenuItem(_("Enable notifications"), this._toggleNotifications);
        this.notif_settings.connect('changed::display-notifications', Lang.bind(this, function() {
        this.notificationsSwitch.setToggleState(this.notif_settings.get_boolean("display-notifications"));
        }));
        this.notificationsSwitch.connect('toggled', Lang.bind(this, function() {
        this.notif_settings.set_boolean("display-notifications", this.notificationsSwitch.state);
        }));
        this.notificationsSwitch.setToggleState(this.notif_settings.get_boolean("display-notifications"));
        this.menu.addMenuItem(this.notificationsSwitch);

        // Notification Settings menu item
        this.item_action = new PopupMenu.PopupMenuItem(_("Notification Settings"));
        this.item_action.connect('activate', Lang.bind(this, function() {
            Util.spawnCommandLine("cinnamon-settings notifications");
        }));
        this.menu.addMenuItem(this.item_action);
        this._show_settings_action();

        // Notification scroll
        this.scrollview = new St.ScrollView({ x_fill: true, y_fill: true, y_align: St.Align.START, style_class: "vfade"});
        this._maincontainer.add(this.scrollview);
        this.scrollview.add_actor(this._notificationbin);
        this.scrollview.set_policy(St.PolicyType.NEVER, St.PolicyType.AUTOMATIC);
        this.scrollview.set_clip_to_allocation(true);

        let vscroll = this.scrollview.get_vscroll_bar();
        vscroll.connect('scroll-start', Lang.bind(this, function() {
            this.menu.passEvents = true;
        }));
        vscroll.connect('scroll-stop', Lang.bind(this, function() {
            this.menu.passEvents = false;
        }));

        // Alternative tray icons.
        this._crit_icon = new St.Icon({icon_name: 'critical-notif', icon_type: St.IconType.SYMBOLIC, reactive: true, track_hover: true, style_class: 'system-status-icon' });
        this._alt_crit_icon = new St.Icon({icon_name: 'alt-critical-notif', icon_type: St.IconType.SYMBOLIC, reactive: true, track_hover: true, style_class: 'system-status-icon' });

        this._on_panel_edit_mode_changed();

    }

    _notification_added (mtray, notification) { // Notification event handler.
        // Ignore transient notifications?
        if (this.ignoreTransientNotifications && notification.isTransient) {
            notification.destroy();
            return;
        }

        notification.actor.unparent();
        let existing_index = this.notifications.indexOf(notification);
        if (existing_index != -1) { // This notification is already listed.
            if (notification._destroyed) {
                this.notifications.splice(existing_index, 1);
            } else {
                notification._inNotificationBin = true;
                global.reparentActor(notification.actor, this._notificationbin);
                notification._timeLabel.show();
            }
            this.update_list();
            return;
        } else if (notification._destroyed) {
            return;
        }
        // Add notification to list.
        notification._inNotificationBin = true;
        this.notifications.push(notification);

        // Steal the notification panel.
        this._notificationbin.add(notification.actor);
        notification.actor._parent_container = this._notificationbin;
        notification.actor.add_style_class_name('notification-applet-padding');

        // Enable middle-click to close notifications.
        notification.actor.connect('button-press-event', (actor, event) => {
            if (event.get_button && event.get_button() === 2) {
                notification.destroy(NotificationDestroyedReason.DISMISSED);
            }
        });
        // Register for destruction.
        notification.connect('scrolling-changed', (notif, scrolling) => { this.menu.passEvents = scrolling });
        notification.connect('destroy', () => {
            let i = this.notifications.indexOf(notification);
            if (i != -1)
                this.notifications.splice(i, 1);
            this.update_list();
        });
        notification._timeLabel.show();

        this.update_list();
    }

    update_list () { // Update interface
        try {
            let count = this.notifications.length;
            if (count > 0) {    // There are notifications.
                this.actor.show();
                this.clear_action.actor.show();
                this.menu_label.actor.show();
                this.notDisturb_label.actor.hide();
                this.noNotif_label.actor.hide();
                this.set_applet_tooltip(ngettext("%d notification", "%d notifications", count).format(count));
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
                        this.set_applet_icon_symbolic_name("new-notif");
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
               this.set_applet_icon_symbolic_name("empty-notification");
               this.set_applet_tooltip(_("Notifications"));
               this.noNotif_label.actor.show();
               this.notDisturb_label.actor.hide();
               this.menu_label.actor.hide();
               this.clear_action.actor.hide();
               if (!this.showEmptyTray) {
                   this.actor.hide();
               }
            }

            // Show "Do not disturb" icon and label
            if (!this.notif_settings.get_boolean("display-notifications")) {
               this.set_applet_icon_symbolic_name("notification-off");
               this.set_applet_tooltip(_("Notifications disabled"));
               this.notDisturb_label.actor.show();
               this.noNotif_label.actor.hide();
               this.menu_label.actor.hide();
               if (this.showEmptyTray || this.showDisturbIcon) {
                   this.actor.show();
               } else {
                   this.actor.hide();
               }
            } else {
                if (count > 0) {
                    this.actor.show();
                } else if (this.showEmptyTray) {
                    this.actor.show();
                } else {
                    this.actor.hide();
                }
            }
                                                                  
            if (!this.showNotificationCount) {  // Don't show notification count
                this.set_applet_label('');
            }
            this.menu_label.label.set_text(stringify(count));
            this._notificationbin.queue_relayout();

        } catch (e) {
            global.logError(e);
        }
     }

     _clear_all() {
        let count = this.notifications.length;
        if (count > 0) {
            for (let i = count-1; i >=0; i--) {
                this._notificationbin.remove_actor(this.notifications[i].actor);
                this.notifications[i].destroy(NotificationDestroyedReason.DISMISSED);
            }
        }
        this.notifications = [];
        this.update_list();
    }

    _show_settings_action() {  // Show or hide notification settings menu item
        if (this.showNotificationSettings) {
            this.item_action.actor.show();
        } else {
            this.item_action.actor.hide();
        }
    }

    _show_hide_tray() {
        this.update_list();
    }

    _show_disturb_icon() {
        this.update_list();
    }

    _on_panel_edit_mode_changed () {
        if (global.settings.get_boolean(PANEL_EDIT_MODE_KEY)) {
            this.actor.show();
        } else {
            this.update_list();
        }
    }

    on_applet_added_to_panel() {
        this.on_orientation_changed(this._orientation);
    }

    on_orientation_changed (orientation) {
        this._orientation = orientation;

        if (this.menu) {
            this.menu.destroy();
        }
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);
        this._display();
    }

    on_applet_clicked(event) {
        this._openMenu();
    }

    _toggleNotifications() {
        let current_state = this.notif_settings.get_boolean("display-notifications");
        this.notif_settings.set_boolean("display-notifications", !current_state);
    }

    mute_notifications() {
        this.notificationsSwitch.toggle();
    }

    set_icon_status() {  // Updates the icon state based on notification settings
        this.update_list();
    }

    on_btn_open_system_settings_clicked() {
        Util.spawnCommandLine("cinnamon-settings notifications");
    }

    _update_timestamp() {
        let len = this.notifications.length;
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                let notification = this.notifications[i];
                let orig_time = notification._timestamp;
                notification._timeLabel.clutter_text.set_markup(timeify(orig_time));
            }
        }
    }

    critical_blink () {
        if (!this._blinking)
            return;
        if (this._blink_toggle) {
            this._applet_icon_box.child = this._crit_icon;
        } else {
            this._applet_icon_box.child = this._alt_crit_icon;
        }
        this._blink_toggle = !this._blink_toggle;
        Mainloop.timeout_add_seconds(1, Lang.bind(this, this.critical_blink));
    }
}

function main(metadata, orientation, panel_height, instanceId) {
    return new CinnamonNotificationsApplet(metadata, orientation, panel_height, instanceId);
}

function stringify(count) {
    return ngettext("%d notification", "%d notifications", count).format(count);
}

function timeify(orig_time) {
    let settings = new Gio.Settings({schema_id: 'org.cinnamon.desktop.interface'});
    let use_24h = settings.get_boolean('clock-use-24h');
    let now = new Date();
    let diff = Math.floor((now.getTime() - orig_time.getTime()) / 1000); // get diff in seconds
    let str;
    if (use_24h) {
        str = orig_time.toLocaleFormat('%x, %T');
    } else {
        str = orig_time.toLocaleFormat('%x, %r');
    }
    switch (true) {
        case (diff <= 15): {
            str += " (" + _("just now") + ")";
            break;
        } case (diff > 15 && diff <= 59): {
            str += " (" + ngettext("%d second ago", "%d seconds ago", diff).format(diff) + ")";
            break;
        } case (diff > 59 && diff <= 3540): {
            let diff_minutes = Math.floor(diff / 60);
            str += " (" + ngettext("%d minute ago", "%d minutes ago", diff_minutes).format(diff_minutes) + ")";
            break;
        }
    }
    return str;
}
