const { get_home_dir } = imports.gi.GLib;

export const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${META.uuid}`;
export const APPLET_PATH = META.path
export const APPLET_SHORT_NAME = META.uuid.split('@')[0]


// SECRETS
// the client ID from Joplin: https://github.com/laurent22/joplin/blob/80b16dd17e227e3f538aa221d7b6cc2d81688e72/packages/lib/parameters.js
export const OFFICE365_CLIENT_ID = 'cbabb902-d276-4ea4-aa88-062a5889d6dc'
export const OFFICE365_CLIENT_SECRET = 'YSvrgQMqw9NzVqgiLfuEky1'


// ENDPOINTS
export const OFFICE365_TOKEN_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
export const OFFICE365_USER_ENDPOINT = 'https://graph.microsoft.com/v1.0/me'
export const OFFICE365_CALENDAR_ENDPOINT = 'https://graph.microsoft.com/v1.0/me/calendarview' 