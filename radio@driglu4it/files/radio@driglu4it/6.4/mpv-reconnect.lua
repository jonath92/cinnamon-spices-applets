-- Util to automatically reconnect on network change or temporary loss.
-- Based on: https://github.com/mpv-player/mpv/issues/5793#issuecomment-2495268210
-- When mpv goes idle after a stream error, 'path' becomes nil, so we
-- remember the last URL so the reload still works.
local prev_pos = -1
local saved_url = nil

mp.observe_property('path', 'string', function(name, value)
  if value then
    saved_url = value
  end
end)

function reload_if_disconnected()
  local pos = mp.get_property_number('time-pos')
  if pos == nil or pos == prev_pos then
    local url = mp.get_property('path') or saved_url
    if url then
      mp.commandv('loadfile', url, 'replace')
    end
  else
    prev_pos = pos
  end
end

mp.add_periodic_timer(1, reload_if_disconnected)