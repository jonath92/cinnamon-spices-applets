const { get_home_dir } = imports.gi.GLib;

export const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${__meta.uuid}`;
export const APPLET_PATH = __meta.path


// SECRETS
// TODO: replace (with new ones as these can interact with onedrive)
export const OFFICE365_CLIENT_ID = '877b72ef-232d-424d-87c7-5b6636497a98'
export const OFFICE365_CLIENT_SECRET = 'SM1=3hvquy[Bj7dvNeJB/qDzAoah?6:5'


// ENDPOINTS
export const OFFICE365_TOKEN_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
export const OFFICE365_CALENDAR_ENDPOINT = 'https://graph.microsoft.com/v1.0/me/calendarview' 