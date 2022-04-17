import { makeJsonHttpRequest } from "../../lib/HttpHandler";
import { createSimpleMenuItem } from "../../lib/SimpleMenuItem";
import { notify } from "../Notifications/NotificationBase";
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
      notify('Stations updated successfully')
    }
  )
};

export function createUpdateStationsMenuItem() {

  const defaultText = 'Update Radio Stationlist'

  let isLoading = false

  const menuItem = createSimpleMenuItem({
    text: defaultText,
    onActivated: async (self) => {
      if (isLoading) return
      isLoading = true
      self.setText('Loading ...')

      makeJsonHttpRequest<RadioStation[]>({
        url: "http://de1.api.radio-browser.info/json/stations?limit=100",
        onSuccess: (resp) => saveStations(resp),
        onErr: (err) => {


          notify(
            `Couldn't update the station list due to an error. Make sure you are connected to the internet and try again. Don't hesitate to open an issue on github if the problem remains.`
          )

          // TODO
          global.logError(err);
        },
        onSettled: () => {
          self.setText(defaultText)
          isLoading = false
        }
      });
    },
  });


  return menuItem.actor
}
