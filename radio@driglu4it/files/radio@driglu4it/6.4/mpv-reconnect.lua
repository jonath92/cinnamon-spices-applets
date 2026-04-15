-- Util to automatically reconnect on network change. 
-- Based on: https://github.com/mpv-player/mpv/issues/5793#issuecomment-2495268210 
local prev_pos = -1

function reload_if_disconnected()
  local pos = mp.get_property_number('time-pos')
  if pos == nil or pos == prev_pos then
    local path = mp.get_property('path')
    if type(path) == 'string' and path ~= '' then
      pcall(mp.commandv, 'loadfile', path, 'replace')
    end
  else
    prev_pos = pos
  end
end

mp.add_periodic_timer(10, reload_if_disconnected)