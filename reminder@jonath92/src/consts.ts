const { get_home_dir } = imports.gi.GLib;

export const CLIENT_ID = "877b72ef-232d-424d-87c7-5b6636497a98"
export const CLIENT_SECRET = "SM1=3hvquy[Bj7dvNeJB/qDzAoah?6:5"

const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${__meta.uuid}`;
export const SETTINGS_PATH = CONFIG_DIR + '/settings.json'