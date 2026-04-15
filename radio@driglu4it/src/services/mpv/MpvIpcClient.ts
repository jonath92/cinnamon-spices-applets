/**
 * Client for mpv's JSON IPC protocol over Unix socket.
 *
 * mpv exposes a JSON-based IPC interface when launched with
 * `--input-ipc-server=/path/to/socket`.  Each message is a single JSON
 * object terminated by `\n`.
 *
 * This module provides:
 *   - sendCommand()    – fire-and-forget or request/response commands
 *   - getProperty()    – convenience wrapper around `get_property`
 *   - setProperty()    – convenience wrapper around `set_property`
 *   - observeProperty()– observe a property and call a handler on changes
 *   - onEvent()        – listen for mpv events (e.g. "end-file")
 *   - destroy()        – tear down connection
 */

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

export type PropertyHandler = (name: string, data: any) => void;
export type EventHandler = (event: any) => void;

export interface MpvIpcClient {
    sendCommand(args: any[]): Promise<any>;
    getProperty<T = any>(name: string): Promise<T>;
    setProperty(name: string, value: any): Promise<void>;
    observeProperty(id: number, name: string): Promise<void>;
    onPropertyChange(handler: PropertyHandler): void;
    onEvent(handler: EventHandler): void;
    destroy(): void;
}

/**
 * Connect to the mpv IPC socket at `socketPath` and return a client handle.
 *
 * The caller is responsible for ensuring the socket file exists (i.e. mpv
 * has been started) before calling this function.  Retries are *not*
 * performed internally – the MpvHandler orchestrates that.
 */
export function createMpvIpcClient(socketPath: string): MpvIpcClient {
    const address = Gio.UnixSocketAddress.new(socketPath);
    const client = new Gio.SocketClient();
    const connection = client.connect(address, null) as imports.gi.Gio.SocketConnection;

    const input = new Gio.DataInputStream({
        base_stream: connection.get_input_stream(),
    });
    const output = new Gio.DataOutputStream({
        base_stream: connection.get_output_stream(),
    });

    let nextRequestId = 1;
    const pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
    const propertyChangeHandlers: PropertyHandler[] = [];
    const eventHandlers: EventHandler[] = [];

    let destroyed = false;

    // ---------- async read loop ----------
    function readLoop(): void {
        if (destroyed) return;

        input.read_line_async(GLib.PRIORITY_DEFAULT, null, (source: any, result: any) => {
            if (destroyed) return;

            let lineBytes: any;
            try {
                [lineBytes] = input.read_line_finish(result);
            } catch {
                // socket closed / error – stop reading
                return;
            }

            if (lineBytes === null) return; // EOF

            let line: string;
            if (lineBytes instanceof Uint8Array) {
                // Convert byte array to string without TextDecoder
                const chars: string[] = [];
                for (let i = 0; i < lineBytes.length; i++) {
                    chars.push(String.fromCharCode(lineBytes[i]));
                }
                line = chars.join('');
            } else {
                line = String(lineBytes);
            }
            if (!line) {
                readLoop();
                return;
            }

            let msg: any;
            try {
                msg = JSON.parse(line);
            } catch {
                readLoop();
                return;
            }

            if (msg.event === 'property-change') {
                propertyChangeHandlers.forEach(h => h(msg.name, msg.data));
            } else if (msg.event) {
                eventHandlers.forEach(h => h(msg));
            }

            if ('request_id' in msg && typeof msg.request_id === 'number') {
                const pending = pendingRequests.get(msg.request_id);
                if (pending) {
                    pendingRequests.delete(msg.request_id);
                    if (msg.error === 'success') {
                        pending.resolve(msg.data);
                    } else {
                        pending.reject(new Error(msg.error));
                    }
                }
            }

            readLoop();
        });
    }

    readLoop();

    // ---------- send ----------
    function send(obj: any): Promise<any> {
        const id = nextRequestId++;
        obj.request_id = id;
        const json = JSON.stringify(obj) + '\n';

        return new Promise((resolve, reject) => {
            pendingRequests.set(id, { resolve, reject });
            try {
                output.put_string(json, null);
                output.flush(null);
            } catch (e) {
                pendingRequests.delete(id);
                reject(e);
            }
        });
    }

    return {
        sendCommand(args: any[]) {
            return send({ command: args });
        },

        getProperty<T = any>(name: string): Promise<T> {
            return send({ command: ['get_property', name] }) as Promise<T>;
        },

        setProperty(name: string, value: any) {
            return send({ command: ['set_property', name, value] });
        },

        observeProperty(id: number, name: string) {
            return send({ command: ['observe_property', id, name] });
        },

        onPropertyChange(handler: PropertyHandler) {
            propertyChangeHandlers.push(handler);
        },

        onEvent(handler: EventHandler) {
            eventHandlers.push(handler);
        },

        destroy() {
            destroyed = true;
            pendingRequests.forEach(p => p.reject(new Error('destroyed')));
            pendingRequests.clear();
            try { connection.close(null); } catch { /* ignore */ }
        },
    };
}
