function _makeProxyWrapper(interfaceXml: string) {
    const info = _newInterfaceInfo(interfaceXml)
    const iname = info.name

    return function (bus: imports.gi.Gio.DBusConnection, name: string, object: string, asyncCallback?: any, cancellable?: any, flags?: imports.gi.Gio.DBusProxyFlags.NONE) {

        if (!flags) flags =  imports.gi.Gio.DBusProxyFlags.NONE

        const obj = new imports.gi.Gio.DBusProxy({
            g_connection: bus,
            g_interface_name: iname,
            g_interface_info: info,
            g_name: name,
            g_flags: flags,
            g_object_path: object // TODO right?
        })

        if (!cancellable) cancellable = null

        if (asyncCallback) {
            obj.init_async(imports.gi.GLib.PRIORITY_DEFAULT, cancellable, (initable, result) => {
                let caughtErrorWhenInitting = null;
                try {
                    // @ts-ignore
                    initable.init_finish(result)
                } catch (error) {
                    caughtErrorWhenInitting = error
                }

                if (caughtErrorWhenInitting === null)
                    asyncCallback(initable, null);
                else
                    asyncCallback(null, caughtErrorWhenInitting);
            })
        } else {
            obj.init(cancellable);
        }
        return obj
    }
}

function _newInterfaceInfo(value: string) {
    const nodeInfo = imports.gi.Gio.DBusNodeInfo.new_for_xml(value);
    return nodeInfo.interfaces[0];
}


const proxy = _makeProxyWrapper('iwas')

const dbus = new proxy(imports.gi.Gio.DBus.session, 'org.freedesktop.DBus', '/org/freedesktop/DBus')