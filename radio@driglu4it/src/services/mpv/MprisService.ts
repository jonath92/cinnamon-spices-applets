/**
 * MPRIS D-Bus service implemented entirely in Cinnamon JS.
 *
 * Uses Gio.DBusExportedObject.wrapJSObject() (a GJS convenience) to own
 * the well-known bus name `org.mpris.MediaPlayer2.mpv` and export the
 * standard MPRIS interfaces so that Cinnamon's sound applet, media keys
 * and any other MPRIS client continues to work.
 *
 * State is pushed in by the MpvHandler (which talks to mpv over IPC);
 * this module only owns the D-Bus name and responds to method calls /
 * property queries.
 */

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

// ── D-Bus introspection XML ──────────────────────────────────────────
// We need both /org/mpris/MediaPlayer2 interfaces on the same object
// path.  wrapJSObject accepts a single <interface> but Cinnamon's own
// code (screenshot.js, cinnamonDBus.js) simply concatenates multiple
// interfaces inside a single <node> element.  We export the Player
// interface (which is the only one the applet actually needs).
// The root MediaPlayer2 interface is also included for completeness –
// some clients query Identity / DesktopEntry.

const MPRIS_IFACE = `
<node>
  <interface name="org.mpris.MediaPlayer2">
    <method name="Raise"/>
    <method name="Quit"/>
    <property name="CanQuit" type="b" access="read"/>
    <property name="CanRaise" type="b" access="read"/>
    <property name="HasTrackList" type="b" access="read"/>
    <property name="Identity" type="s" access="read"/>
    <property name="SupportedUriSchemes" type="as" access="read"/>
    <property name="SupportedMimeTypes" type="as" access="read"/>
    <property name="DesktopEntry" type="s" access="read"/>
  </interface>

  <interface name="org.mpris.MediaPlayer2.Player">
    <method name="Next"/>
    <method name="Previous"/>
    <method name="Pause"/>
    <method name="PlayPause"/>
    <method name="Stop"/>
    <method name="Play"/>
    <method name="Seek">
      <arg direction="in" type="x" name="Offset"/>
    </method>
    <method name="SetPosition">
      <arg direction="in" type="o" name="TrackId"/>
      <arg direction="in" type="x" name="Position"/>
    </method>
    <method name="OpenUri">
      <arg direction="in" type="s" name="Uri"/>
    </method>
    <signal name="Seeked">
      <arg type="x" name="Position"/>
    </signal>
    <property name="PlaybackStatus" type="s" access="read"/>
    <property name="LoopStatus" type="s" access="readwrite"/>
    <property name="Rate" type="d" access="readwrite"/>
    <property name="Shuffle" type="b" access="readwrite"/>
    <property name="Metadata" type="a{sv}" access="read"/>
    <property name="Volume" type="d" access="readwrite"/>
    <property name="Position" type="x" access="read"/>
    <property name="MinimumRate" type="d" access="read"/>
    <property name="MaximumRate" type="d" access="read"/>
    <property name="CanGoNext" type="b" access="read"/>
    <property name="CanGoPrevious" type="b" access="read"/>
    <property name="CanPlay" type="b" access="read"/>
    <property name="CanPause" type="b" access="read"/>
    <property name="CanSeek" type="b" access="read"/>
    <property name="CanControl" type="b" access="read"/>
  </interface>
</node>`;

// ── Callbacks for method calls ──────────────────────────────────────
export interface MprisMethodCallbacks {
    onPlay(): void;
    onPause(): void;
    onPlayPause(): void;
    onStop(): void;
    onNext(): void;
    onPrevious(): void;
    onSeek(offsetMicroseconds: number): void;
    onSetPosition(trackId: string, positionMicroseconds: number): void;
    onOpenUri(uri: string): void;
    onQuit(): void;
    onSetVolume(volumeFraction: number): void;
    onSetLoopStatus(status: string): void;
}

// ── State that the MpvHandler pushes in ─────────────────────────────
export interface MprisState {
    playbackStatus: string;   // "Playing" | "Paused" | "Stopped"
    loopStatus: string;        // "None" | "Track" | "Playlist"
    rate: number;
    shuffle: boolean;
    volume: number;            // 0.0 – 1.0
    position: number;          // microseconds
    metadata: MprisMetadata;
    canGoNext: boolean;
    canGoPrevious: boolean;
    canPlay: boolean;
    canPause: boolean;
    canSeek: boolean;
    canControl: boolean;
}

export interface MprisMetadata {
    'mpris:trackid'?: string | undefined;   // D-Bus object path
    'xesam:title'?: string | undefined;
    'xesam:url'?: string | undefined;
    'mpris:length'?: number | undefined;    // microseconds
}

export interface MprisService {
    updateState(partial: Partial<MprisState>): void;
    emitSeeked(positionMicroseconds: number): void;
    destroy(): void;
}

export function createMprisService(callbacks: MprisMethodCallbacks): MprisService {

    // Current state
    const state: MprisState = {
        playbackStatus: 'Stopped',
        loopStatus: 'None',
        rate: 1.0,
        shuffle: false,
        volume: 1.0,
        position: 0,
        metadata: {},
        canGoNext: false,
        canGoPrevious: false,
        canPlay: true,
        canPause: true,
        canSeek: true,
        canControl: true,
    };

    // ── Build metadata GLib.Variant ────────────────────────────────
    function buildMetadataVariant(): imports.gi.GLib.Variant {
        const entries: Array<imports.gi.GLib.Variant> = [];
        const m = state.metadata;

        if (m['mpris:trackid']) {
            entries.push(GLib.Variant.new_dict_entry(
                GLib.Variant.new_string('mpris:trackid'),
                GLib.Variant.new_variant(GLib.Variant.new_object_path(m['mpris:trackid']))
            ));
        }
        if (m['xesam:title'] != null) {
            entries.push(GLib.Variant.new_dict_entry(
                GLib.Variant.new_string('xesam:title'),
                GLib.Variant.new_variant(GLib.Variant.new_string(m['xesam:title']))
            ));
        }
        if (m['xesam:url'] != null) {
            entries.push(GLib.Variant.new_dict_entry(
                GLib.Variant.new_string('xesam:url'),
                GLib.Variant.new_variant(GLib.Variant.new_string(m['xesam:url']))
            ));
        }
        if (m['mpris:length'] != null) {
            entries.push(GLib.Variant.new_dict_entry(
                GLib.Variant.new_string('mpris:length'),
                GLib.Variant.new_variant(GLib.Variant.new_int64(m['mpris:length']))
            ));
        }

        return GLib.Variant.new_array(
            GLib.VariantType.new('{sv}'),
            entries
        );
    }

    // ── The JS object that backs the D-Bus interface ───────────────
    const ifaceImpl = {
        // --- org.mpris.MediaPlayer2 ---
        Raise() { /* no-op */ },
        Quit() { callbacks.onQuit(); },

        get CanQuit() { return true; },
        get CanRaise() { return false; },
        get HasTrackList() { return false; },
        get Identity() { return 'mpv Media Player'; },
        get DesktopEntry() { return 'mpv'; },
        get SupportedUriSchemes() { return ['http', 'https', 'file']; },
        get SupportedMimeTypes() { return ['audio/mpeg', 'audio/ogg', 'audio/flac', 'audio/x-wav', 'application/ogg']; },

        // --- org.mpris.MediaPlayer2.Player ---
        Next() { callbacks.onNext(); },
        Previous() { callbacks.onPrevious(); },
        Pause() { callbacks.onPause(); },
        PlayPause() { callbacks.onPlayPause(); },
        Stop() { callbacks.onStop(); },
        Play() { callbacks.onPlay(); },
        Seek(offset: number) { callbacks.onSeek(offset); },
        SetPosition(trackId: string, position: number) { callbacks.onSetPosition(trackId, position); },
        OpenUri(uri: string) { callbacks.onOpenUri(uri); },

        get PlaybackStatus() { return state.playbackStatus; },
        get LoopStatus() { return state.loopStatus; },
        set LoopStatus(value: string) { state.loopStatus = value; callbacks.onSetLoopStatus(value); },
        get Rate() { return state.rate; },
        set Rate(value: number) { state.rate = value; },
        get Shuffle() { return state.shuffle; },
        set Shuffle(value: boolean) { state.shuffle = value; },
        get Metadata() { return buildMetadataVariant(); },
        get Volume() { return state.volume; },
        set Volume(value: number) {
            state.volume = Math.max(0, value);
            callbacks.onSetVolume(state.volume);
        },
        get Position() { return state.position; },
        get MinimumRate() { return 1.0; },
        get MaximumRate() { return 1.0; },
        get CanGoNext() { return state.canGoNext; },
        get CanGoPrevious() { return state.canGoPrevious; },
        get CanPlay() { return state.canPlay; },
        get CanPause() { return state.canPause; },
        get CanSeek() { return state.canSeek; },
        get CanControl() { return state.canControl; },
    };

    // ── Export on session bus ──────────────────────────────────────
    const dbusExportedObject = (Gio as any).DBusExportedObject.wrapJSObject(MPRIS_IFACE, ifaceImpl);
    dbusExportedObject.export(Gio.DBus.session, '/org/mpris/MediaPlayer2');

    const busNameId = Gio.bus_own_name_on_connection(
        Gio.DBus.session,
        'org.mpris.MediaPlayer2.mpv',
        Gio.BusNameOwnerFlags.NONE,
        null,
        null
    );

    // ── Emit PropertiesChanged ────────────────────────────────────
    function emitPropertiesChanged(iface: string, changed: { [key: string]: imports.gi.GLib.Variant }, invalidated: string[] = []) {
        const changedEntries = Object.keys(changed).map(key =>
            GLib.Variant.new_dict_entry(
                GLib.Variant.new_string(key),
                GLib.Variant.new_variant(changed[key])
            )
        );

        const changedVariant = GLib.Variant.new_array(
            GLib.VariantType.new('{sv}'),
            changedEntries
        );

        const invalidatedVariant = GLib.Variant.new_strv(invalidated);

        // Use new_tuple to combine pre-built variants – new GLib.Variant('(…)', [...])
        // fails because the auto-packer can't handle already-constructed Variant objects.
        const params = GLib.Variant.new_tuple([
            GLib.Variant.new_string(iface),
            changedVariant,
            invalidatedVariant,
        ]);

        dbusExportedObject.emit_signal('PropertiesChanged', params);
    }

    return {
        updateState(partial: Partial<MprisState>) {
            const changed: { [key: string]: imports.gi.GLib.Variant } = {};
            const playerIface = 'org.mpris.MediaPlayer2.Player';

            if (partial.playbackStatus !== undefined && partial.playbackStatus !== state.playbackStatus) {
                state.playbackStatus = partial.playbackStatus;
                changed['PlaybackStatus'] = GLib.Variant.new_string(state.playbackStatus);
            }
            if (partial.loopStatus !== undefined && partial.loopStatus !== state.loopStatus) {
                state.loopStatus = partial.loopStatus;
                changed['LoopStatus'] = GLib.Variant.new_string(state.loopStatus);
            }
            if (partial.volume !== undefined && partial.volume !== state.volume) {
                state.volume = partial.volume;
                changed['Volume'] = GLib.Variant.new_double(state.volume);
            }
            if (partial.shuffle !== undefined && partial.shuffle !== state.shuffle) {
                state.shuffle = partial.shuffle;
                changed['Shuffle'] = GLib.Variant.new_boolean(state.shuffle);
            }
            if (partial.rate !== undefined && partial.rate !== state.rate) {
                state.rate = partial.rate;
                changed['Rate'] = GLib.Variant.new_double(state.rate);
            }
            if (partial.position !== undefined) {
                state.position = partial.position;
                // Position does NOT emit PropertiesChanged per MPRIS spec
            }
            if (partial.metadata !== undefined) {
                state.metadata = partial.metadata;
                changed['Metadata'] = buildMetadataVariant();
            }
            if (partial.canSeek !== undefined && partial.canSeek !== state.canSeek) {
                state.canSeek = partial.canSeek;
                changed['CanSeek'] = GLib.Variant.new_boolean(state.canSeek);
            }
            if (partial.canPlay !== undefined && partial.canPlay !== state.canPlay) {
                state.canPlay = partial.canPlay;
                changed['CanPlay'] = GLib.Variant.new_boolean(state.canPlay);
            }
            if (partial.canPause !== undefined && partial.canPause !== state.canPause) {
                state.canPause = partial.canPause;
                changed['CanPause'] = GLib.Variant.new_boolean(state.canPause);
            }
            if (partial.canControl !== undefined && partial.canControl !== state.canControl) {
                state.canControl = partial.canControl;
                changed['CanControl'] = GLib.Variant.new_boolean(state.canControl);
            }

            if (Object.keys(changed).length > 0) {
                emitPropertiesChanged(playerIface, changed);
            }
        },

        emitSeeked(positionMicroseconds: number) {
            state.position = positionMicroseconds;
            dbusExportedObject.emit_signal(
                'Seeked',
                GLib.Variant.new_tuple([GLib.Variant.new_int64(positionMicroseconds)])
            );
        },

        destroy() {
            Gio.bus_unown_name(busNameId);
            dbusExportedObject.unexport();
        },
    };
}
