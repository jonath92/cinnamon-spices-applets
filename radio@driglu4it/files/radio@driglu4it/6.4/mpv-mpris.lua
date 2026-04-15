-- mpv-mpris.lua — Pure Lua MPRIS2 D-Bus bridge for mpv
-- Drop-in replacement for the compiled mpris.so plugin (hoyon/mpv-mpris).
-- Requires: lua-lgi (Lua GObject-Introspection bindings)
--   Debian/Ubuntu/Mint:  sudo apt install lua-lgi

local ok, lgi = pcall(require, "lgi")
if not ok then
    mp.msg.error("mpris.lua requires lua-lgi.  Install with:  sudo apt install lua-lgi")
    return
end

local Gio  = lgi.Gio
local GLib = lgi.GLib

---------------------------------------------------------------------------
-- D-Bus introspection XML  (matches hoyon/mpv-mpris)
---------------------------------------------------------------------------

local INTROSPECTION_XML = [[
<node>
  <interface name="org.mpris.MediaPlayer2">
    <method name="Raise"/>
    <method name="Quit"/>
    <property name="CanQuit"            type="b"  access="read"/>
    <property name="Fullscreen"         type="b"  access="readwrite"/>
    <property name="CanSetFullscreen"   type="b"  access="read"/>
    <property name="CanRaise"           type="b"  access="read"/>
    <property name="HasTrackList"       type="b"  access="read"/>
    <property name="Identity"           type="s"  access="read"/>
    <property name="DesktopEntry"       type="s"  access="read"/>
    <property name="SupportedUriSchemes" type="as" access="read"/>
    <property name="SupportedMimeTypes"  type="as" access="read"/>
  </interface>
  <interface name="org.mpris.MediaPlayer2.Player">
    <method name="Next"/>
    <method name="Previous"/>
    <method name="Pause"/>
    <method name="PlayPause"/>
    <method name="Stop"/>
    <method name="Play"/>
    <method name="Seek">
      <arg type="x" name="Offset" direction="in"/>
    </method>
    <method name="SetPosition">
      <arg type="o" name="TrackId" direction="in"/>
      <arg type="x" name="Offset" direction="in"/>
    </method>
    <method name="OpenUri">
      <arg type="s" name="Uri" direction="in"/>
    </method>
    <signal name="Seeked">
      <arg type="x" name="Position" direction="out"/>
    </signal>
    <property name="PlaybackStatus" type="s"    access="read"/>
    <property name="LoopStatus"     type="s"    access="readwrite"/>
    <property name="Rate"           type="d"    access="readwrite"/>
    <property name="Shuffle"        type="b"    access="readwrite"/>
    <property name="Metadata"       type="a{sv}" access="read"/>
    <property name="Volume"         type="d"    access="readwrite"/>
    <property name="Position"       type="x"    access="read"/>
    <property name="MinimumRate"    type="d"    access="read"/>
    <property name="MaximumRate"    type="d"    access="read"/>
    <property name="CanGoNext"      type="b"    access="read"/>
    <property name="CanGoPrevious"  type="b"    access="read"/>
    <property name="CanPlay"        type="b"    access="read"/>
    <property name="CanPause"       type="b"    access="read"/>
    <property name="CanSeek"        type="b"    access="read"/>
    <property name="CanControl"     type="b"    access="read"/>
  </interface>
</node>
]]

---------------------------------------------------------------------------
-- Mutable state
---------------------------------------------------------------------------

local state = {
    idle           = true,
    paused         = false,
    seek_expected  = false,
    shuffle        = false,
    loop_status    = "None",   -- None | Track | Playlist
    playlist_pos   = -1,
    playlist_count = 0,
}

local connection     = nil   -- Gio.DBusConnection
local root_reg_id    = 0
local player_reg_id  = 0
local bus_owner_id   = 0
local changed_props  = {}    -- queued property changes  { name → GVariant }
local metadata_cache = nil   -- GVariant (a{sv})

---------------------------------------------------------------------------
-- Helpers
---------------------------------------------------------------------------

local function get_playback_status()
    if state.idle   then return "Stopped"
    elseif state.paused then return "Paused"
    else                     return "Playing"
    end
end

local function can_go_next()
    if state.playlist_pos < 0 or state.playlist_count <= 0 then return false end
    if state.playlist_count == 1 then return false end
    if state.loop_status == "Playlist" then return true end
    return state.playlist_pos < state.playlist_count - 1
end

local function can_go_previous()
    if state.playlist_pos < 0 or state.playlist_count <= 0 then return false end
    if state.playlist_count == 1 then return false end
    if state.loop_status == "Playlist" then return true end
    return state.playlist_pos > 0
end

local function make_utf8(s)
    if not s then return nil end
    local ok2, result = pcall(GLib.utf8_make_valid, s, -1)
    return ok2 and result or s
end

---------------------------------------------------------------------------
-- GVariant helpers
---------------------------------------------------------------------------

local function variant_entry(key, value)
    return GLib.Variant.new_dict_entry(
        GLib.Variant.new_string(key),
        GLib.Variant.new_variant(value)
    )
end

local function variant_string_list(list)
    local b = GLib.VariantBuilder(GLib.VariantType.new("as"))
    for _, s in ipairs(list) do
        b:add_value(GLib.Variant.new_string(s))
    end
    return b:end_()
end

---------------------------------------------------------------------------
-- Metadata → GVariant  a{sv}
---------------------------------------------------------------------------

local function create_metadata()
    local b = GLib.VariantBuilder(GLib.VariantType.new("a{sv}"))

    -- mpris:trackid  (object path)
    local track_id = state.playlist_pos >= 0
        and ("/" .. tostring(state.playlist_pos))
        or  "/noplaylist"
    b:add_value(variant_entry("mpris:trackid",
        GLib.Variant.new_object_path(track_id)))

    -- mpris:length  (int64, microseconds)
    local duration = mp.get_property_number("duration")
    if duration then
        b:add_value(variant_entry("mpris:length",
            GLib.Variant.new_int64(math.floor(duration * 1000000))))
    end

    -- xesam:title
    local title = make_utf8(mp.get_property("media-title"))
    if title then
        b:add_value(variant_entry("xesam:title",
            GLib.Variant.new_string(title)))
    end

    -- xesam:album
    local album = make_utf8(mp.get_property("metadata/by-key/Album"))
    if album then
        b:add_value(variant_entry("xesam:album",
            GLib.Variant.new_string(album)))
    end

    -- xesam:genre
    local genre = make_utf8(mp.get_property("metadata/by-key/Genre"))
    if genre then
        b:add_value(variant_entry("xesam:genre",
            GLib.Variant.new_string(genre)))
    end

    -- xesam:artist  (as – comma-separated → array)
    local artist_raw = mp.get_property("metadata/by-key/Artist")
        or mp.get_property("metadata/by-key/uploader")
    if artist_raw then
        local parts = {}
        for part in artist_raw:gmatch("[^,]+") do
            parts[#parts + 1] = make_utf8(part:match("^%s*(.-)%s*$")) or ""
        end
        b:add_value(variant_entry("xesam:artist", variant_string_list(parts)))
    end

    -- xesam:albumArtist
    local album_artist = mp.get_property("metadata/by-key/Album_Artist")
    if album_artist then
        local parts = {}
        for part in album_artist:gmatch("[^,]+") do
            parts[#parts + 1] = make_utf8(part:match("^%s*(.-)%s*$")) or ""
        end
        b:add_value(variant_entry("xesam:albumArtist", variant_string_list(parts)))
    end

    -- xesam:composer
    local composer = mp.get_property("metadata/by-key/Composer")
    if composer then
        local parts = {}
        for part in composer:gmatch("[^,]+") do
            parts[#parts + 1] = make_utf8(part:match("^%s*(.-)%s*$")) or ""
        end
        b:add_value(variant_entry("xesam:composer", variant_string_list(parts)))
    end

    -- xesam:trackNumber
    local track_num = mp.get_property_number("metadata/by-key/Track")
    if track_num then
        b:add_value(variant_entry("xesam:trackNumber",
            GLib.Variant.new_int64(track_num)))
    end

    -- xesam:discNumber
    local disc = mp.get_property_number("metadata/by-key/Disc")
    if disc then
        b:add_value(variant_entry("xesam:discNumber",
            GLib.Variant.new_int64(disc)))
    end

    -- xesam:url
    local path = mp.get_property("path")
    if path then
        if path:match("^%a[%a%d%+%.%-]*://") then
            b:add_value(variant_entry("xesam:url",
                GLib.Variant.new_string(path)))
        else
            local wd = mp.get_property("working-directory") or ""
            local full = path:sub(1, 1) == "/" and path or (wd .. "/" .. path)
            local ok3, uri = pcall(GLib.filename_to_uri, full, nil)
            if ok3 and uri then
                b:add_value(variant_entry("xesam:url",
                    GLib.Variant.new_string(uri)))
            end
        end
    end

    return b:end_()
end

---------------------------------------------------------------------------
-- Property-change batching  (emitted every ~100 ms)
---------------------------------------------------------------------------

local function queue_prop(name, value)
    changed_props[name] = value
end

local function emit_property_changes()
    if not connection or not next(changed_props) then return end

    local props_b = GLib.VariantBuilder(GLib.VariantType.new("a{sv}"))
    local inv_b   = GLib.VariantBuilder(GLib.VariantType.new("as"))
    local has_props = false
    local has_inv   = false

    for name, value in pairs(changed_props) do
        if value then
            props_b:add_value(variant_entry(name, value))
            has_props = true
        else
            inv_b:add_value(GLib.Variant.new_string(name))
            has_inv = true
        end
    end
    changed_props = {}

    -- Ensure non-empty builders (add a dummy entry if empty, then rebuild)
    -- Actually, GVariant builders handle empty arrays fine.
    local params_b = GLib.VariantBuilder(GLib.VariantType.new("(sa{sv}as)"))
    params_b:add_value(GLib.Variant.new_string("org.mpris.MediaPlayer2.Player"))
    params_b:add_value(props_b:end_())
    params_b:add_value(inv_b:end_())

    pcall(function()
        connection:emit_signal(
            nil,
            "/org/mpris/MediaPlayer2",
            "org.freedesktop.DBus.Properties",
            "PropertiesChanged",
            params_b:end_())
    end)
end

local function emit_seeked()
    if not connection then return end
    local pos = mp.get_property_number("time-pos") or 0
    local pos_us = math.floor(pos * 1000000)

    local b = GLib.VariantBuilder(GLib.VariantType.new("(x)"))
    b:add_value(GLib.Variant.new_int64(pos_us))

    pcall(function()
        connection:emit_signal(
            nil,
            "/org/mpris/MediaPlayer2",
            "org.mpris.MediaPlayer2.Player",
            "Seeked",
            b:end_())
    end)
end

---------------------------------------------------------------------------
-- Root interface  (org.mpris.MediaPlayer2)
---------------------------------------------------------------------------

local function root_method_call(conn, sender, path, iface, method, params, invocation)
    if method == "Quit" then
        mp.command("quit")
    end
    -- Raise is a no-op (mpv has no GUI to raise in radio mode)
    invocation:return_value(nil)
end

local function root_get_property(conn, sender, path, iface, prop)
    if prop == "CanQuit"            then return GLib.Variant.new_boolean(true)
    elseif prop == "Fullscreen"     then return GLib.Variant.new_boolean(mp.get_property_bool("fullscreen") or false)
    elseif prop == "CanSetFullscreen" then return GLib.Variant.new_boolean(mp.get_property_bool("vo-configured") or false)
    elseif prop == "CanRaise"       then return GLib.Variant.new_boolean(false)
    elseif prop == "HasTrackList"   then return GLib.Variant.new_boolean(false)
    elseif prop == "Identity"       then return GLib.Variant.new_string("mpv")
    elseif prop == "DesktopEntry"   then return GLib.Variant.new_string("mpv")
    elseif prop == "SupportedUriSchemes" then
        return variant_string_list({"ftp","http","https","mms","rtmp","rtsp","sftp","smb"})
    elseif prop == "SupportedMimeTypes" then
        return variant_string_list({"application/ogg","audio/mpeg"})
    end
    return nil   -- unknown property → GLib auto-generates error
end

local function root_set_property(conn, sender, path, iface, prop, value)
    if prop == "Fullscreen" then
        mp.set_property_bool("fullscreen", value:get_boolean())
        return true
    end
    return false
end

---------------------------------------------------------------------------
-- Player interface  (org.mpris.MediaPlayer2.Player)
---------------------------------------------------------------------------

local function player_method_call(conn, sender, path, iface, method, params, invocation)
    if method == "Pause" then
        mp.set_property_bool("pause", true)
    elseif method == "PlayPause" then
        local paused = get_playback_status() ~= "Playing"
        mp.set_property_bool("pause", not paused)
    elseif method == "Play" then
        mp.set_property_bool("pause", false)
    elseif method == "Stop" then
        mp.command("stop")
    elseif method == "Next" then
        mp.command("playlist-next")
    elseif method == "Previous" then
        mp.command("playlist-prev")
    elseif method == "Seek" then
        local offset_us = params:get_child_value(0):get_int64()
        mp.commandv("seek", tostring(offset_us / 1000000.0))
    elseif method == "SetPosition" then
        local track_path = params:get_child_value(0):get_string()
        local pos_us     = params:get_child_value(1):get_int64()
        local expected   = tonumber(track_path:match("^/(%d+)$"))
        if expected and expected == state.playlist_pos then
            mp.set_property_number("time-pos", pos_us / 1000000.0)
        end
    elseif method == "OpenUri" then
        local uri = params:get_child_value(0):get_string()
        mp.commandv("loadfile", uri)
    end
    invocation:return_value(nil)
end

local function player_get_property(conn, sender, path, iface, prop)
    if prop == "PlaybackStatus"  then return GLib.Variant.new_string(get_playback_status())
    elseif prop == "LoopStatus"  then return GLib.Variant.new_string(state.loop_status)
    elseif prop == "Rate"        then return GLib.Variant.new_double(mp.get_property_number("speed") or 1.0)
    elseif prop == "Shuffle"     then return GLib.Variant.new_boolean(state.shuffle)
    elseif prop == "Metadata"    then
        if not metadata_cache then metadata_cache = create_metadata() end
        return metadata_cache
    elseif prop == "Volume"      then return GLib.Variant.new_double((mp.get_property_number("volume") or 100) / 100.0)
    elseif prop == "Position"    then
        local pos = mp.get_property_number("time-pos") or 0
        return GLib.Variant.new_int64(math.floor(pos * 1000000))
    elseif prop == "MinimumRate"    then return GLib.Variant.new_double(0.01)
    elseif prop == "MaximumRate"    then return GLib.Variant.new_double(100.0)
    elseif prop == "CanGoNext"      then return GLib.Variant.new_boolean(can_go_next())
    elseif prop == "CanGoPrevious"  then return GLib.Variant.new_boolean(can_go_previous())
    elseif prop == "CanPlay"        then return GLib.Variant.new_boolean(true)
    elseif prop == "CanPause"       then return GLib.Variant.new_boolean(true)
    elseif prop == "CanSeek"        then return GLib.Variant.new_boolean(true)
    elseif prop == "CanControl"     then return GLib.Variant.new_boolean(true)
    end
    return nil
end

local function player_set_property(conn, sender, path, iface, prop, value)
    if prop == "LoopStatus" then
        local s = value:get_string()
        if s == "Track" then
            mp.set_property("loop-file", "inf")
            mp.set_property("loop-playlist", "no")
        elseif s == "Playlist" then
            mp.set_property("loop-file", "no")
            mp.set_property("loop-playlist", "inf")
        else
            mp.set_property("loop-file", "no")
            mp.set_property("loop-playlist", "no")
        end
        return true
    elseif prop == "Rate" then
        mp.set_property_number("speed", value:get_double())
        return true
    elseif prop == "Shuffle" then
        local shuffle = value:get_boolean()
        if shuffle and not state.shuffle then
            mp.command("playlist-shuffle")
        elseif not shuffle and state.shuffle then
            mp.command("playlist-unshuffle")
        end
        mp.set_property_bool("shuffle", shuffle)
        return true
    elseif prop == "Volume" then
        mp.set_property_number("volume", value:get_double() * 100)
        return true
    end
    return false
end

---------------------------------------------------------------------------
-- Bus name construction  (mirrors C plugin logic)
---------------------------------------------------------------------------

local function build_bus_name(unique_suffix)
    local client_name = mp.get_property("audio-client-name") or "mpv"
    local name = "org.mpris.MediaPlayer2.mpv"
    if client_name ~= "mpv" then
        name = name .. "." .. client_name
    end
    if unique_suffix then
        local chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        local id = {}
        math.randomseed(os.time())
        for i = 1, 8 do
            local idx = math.random(1, #chars)
            id[i] = chars:sub(idx, idx)
        end
        name = name .. ".instance-" .. table.concat(id)
    end
    return name
end

---------------------------------------------------------------------------
-- D-Bus setup
---------------------------------------------------------------------------

local function setup_dbus()
    connection = Gio.bus_get_sync(Gio.BusType.SESSION)
    if not connection then
        mp.msg.error("Failed to connect to session D-Bus")
        return false
    end

    local node_info    = Gio.DBusNodeInfo.new_for_xml(INTROSPECTION_XML)
    local root_iface   = node_info:lookup_interface("org.mpris.MediaPlayer2")
    local player_iface = node_info:lookup_interface("org.mpris.MediaPlayer2.Player")

    -- register_object in lgi maps to register_object_with_closures
    root_reg_id = connection:register_object(
        "/org/mpris/MediaPlayer2",
        root_iface,
        root_method_call,
        root_get_property,
        root_set_property)

    player_reg_id = connection:register_object(
        "/org/mpris/MediaPlayer2",
        player_iface,
        player_method_call,
        player_get_property,
        player_set_property)

    -- Own the well-known bus name
    local bus_name = build_bus_name(false)
    bus_owner_id = Gio.bus_own_name_on_connection(
        connection, bus_name,
        Gio.BusNameOwnerFlags.DO_NOT_QUEUE,
        function(_conn, name)   -- on_name_acquired
            mp.msg.info("Acquired D-Bus name: " .. name)
        end,
        function(_conn, name)   -- on_name_lost
            mp.msg.warn("Name " .. name .. " taken, retrying with unique suffix")
            local fallback = build_bus_name(true)
            Gio.bus_own_name_on_connection(
                connection, fallback,
                Gio.BusNameOwnerFlags.NONE,
                function(_, n) mp.msg.info("Acquired D-Bus name: " .. n) end,
                function(_, n) mp.msg.error("Failed to acquire D-Bus name: " .. n) end)
        end)

    mp.msg.info("MPRIS D-Bus interface registered")
    return true
end

---------------------------------------------------------------------------
-- Property observers  (mirror mpv state → D-Bus)
---------------------------------------------------------------------------

local function update_can_go()
    queue_prop("CanGoNext",     GLib.Variant.new_boolean(can_go_next()))
    queue_prop("CanGoPrevious", GLib.Variant.new_boolean(can_go_previous()))
end

mp.observe_property("pause", "bool", function(_, val)
    state.paused = val or false
    queue_prop("PlaybackStatus", GLib.Variant.new_string(get_playback_status()))
end)

mp.observe_property("idle-active", "bool", function(_, val)
    state.idle = val or false
    queue_prop("PlaybackStatus", GLib.Variant.new_string(get_playback_status()))
end)

mp.observe_property("media-title", "string", function()
    metadata_cache = create_metadata()
    queue_prop("Metadata", metadata_cache)
end)

mp.observe_property("duration", "number", function()
    metadata_cache = create_metadata()
    queue_prop("Metadata", metadata_cache)
end)

mp.observe_property("speed", "number", function(_, val)
    if val then queue_prop("Rate", GLib.Variant.new_double(val)) end
end)

mp.observe_property("volume", "number", function(_, val)
    if val then queue_prop("Volume", GLib.Variant.new_double(val / 100.0)) end
end)

mp.observe_property("loop-file", "string", function(_, val)
    if not val then return end
    if val ~= "no" then
        state.loop_status = "Track"
    else
        local pl = mp.get_property("loop-playlist") or "no"
        state.loop_status = (pl ~= "no") and "Playlist" or "None"
    end
    queue_prop("LoopStatus", GLib.Variant.new_string(state.loop_status))
    update_can_go()
end)

mp.observe_property("loop-playlist", "string", function(_, val)
    if not val then return end
    if val ~= "no" then
        state.loop_status = "Playlist"
    else
        local lf = mp.get_property("loop-file") or "no"
        state.loop_status = (lf ~= "no") and "Track" or "None"
    end
    queue_prop("LoopStatus", GLib.Variant.new_string(state.loop_status))
    update_can_go()
end)

mp.observe_property("shuffle", "bool", function(_, val)
    state.shuffle = val or false
    queue_prop("Shuffle", GLib.Variant.new_boolean(state.shuffle))
end)

mp.observe_property("fullscreen", "bool", function(_, val)
    -- Fullscreen is on the root interface; not batched with Player props
    -- but for simplicity we still queue (the applet doesn't use it)
end)

mp.observe_property("playlist-count", "number", function(_, val)
    state.playlist_count = val or 0
    update_can_go()
end)

mp.observe_property("playlist-pos", "number", function(_, val)
    state.playlist_pos = val or -1
    update_can_go()
end)

---------------------------------------------------------------------------
-- Seek events
---------------------------------------------------------------------------

mp.register_event("seek", function()
    state.seek_expected = true
end)

mp.register_event("playback-restart", function()
    if state.seek_expected then
        emit_seeked()
        state.seek_expected = false
    end
end)

---------------------------------------------------------------------------
-- Periodic timers
---------------------------------------------------------------------------

-- Iterate the GLib default main context so D-Bus calls are dispatched
mp.add_periodic_timer(0.05, function()
    local ctx = GLib.MainContext.default()
    while ctx:iteration(false) do end
end)

-- Batch-emit queued property changes (matches C plugin's 100 ms interval)
mp.add_periodic_timer(0.1, emit_property_changes)

---------------------------------------------------------------------------
-- Start up
---------------------------------------------------------------------------

if not setup_dbus() then
    mp.msg.error("MPRIS D-Bus setup failed")
    return
end

---------------------------------------------------------------------------
-- Clean up on shutdown
---------------------------------------------------------------------------

mp.register_event("shutdown", function()
    -- Emit a final Stopped status so listeners know we're gone
    if connection then
        changed_props = {}
        queue_prop("PlaybackStatus", GLib.Variant.new_string("Stopped"))
        emit_property_changes()
    end

    if bus_owner_id > 0 then
        pcall(Gio.bus_unown_name, bus_owner_id)
    end
    if connection then
        if root_reg_id   > 0 then pcall(connection.unregister_object, connection, root_reg_id) end
        if player_reg_id > 0 then pcall(connection.unregister_object, connection, player_reg_id) end
    end
end)

mp.msg.info("mpv-mpris.lua loaded")
