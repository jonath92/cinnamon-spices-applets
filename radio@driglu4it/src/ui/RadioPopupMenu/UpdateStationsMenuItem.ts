import { makeJsonHttpRequest } from "../../lib/HttpHandler";
import { createSimpleMenuItem } from "../../lib/SimpleMenuItem";
const { File, FileCreateFlags } = imports.gi.Gio

const { Bytes } = imports.gi.GLib

interface RadioStation {
  url: string;
  name: string;
  // ... So much more we can use :-)
}

const saveStations = (stationsUnfiltered: RadioStation[]) => {
  const filteredStations = stationsUnfiltered.flatMap(
    ({ name, url }, index) => {
      const isDuplicate =
        stationsUnfiltered.findIndex(
          (val) => val.name === name && val.url === url
        ) !== index;

      if (isDuplicate) return [];

      return [[name.trim(), url.trim()]];
    }
  );

  const file = File.new_for_path(`${__meta.path}/allStations.json`)


  if (!file.query_exists(null)) {
    file.create(FileCreateFlags.NONE, null)
  }

  file.replace_contents_bytes_async(
    new Bytes(JSON.stringify(filteredStations)),
    null,
    false,
    FileCreateFlags.REPLACE_DESTINATION,
    null,
    (file, result) => {
      // TODO
    }
  )

  global.log("filteredStatsion", filteredStations);
};

export function createUpdateStationsMenuItem() {
  return createSimpleMenuItem({
    initialText: "Update Radio Stationlist",
    onActivated: () => {
      makeJsonHttpRequest<RadioStation[]>({
        url: "http://de1.api.radio-browser.info/json/stations",
        onSuccess: (resp) => saveStations(resp),
        onErr: (err) => {
          // TODO
          global.logError(err);
        },
      });
    },
  }).actor;
}
