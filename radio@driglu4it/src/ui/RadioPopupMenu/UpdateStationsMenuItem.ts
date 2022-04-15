import { makeJsonHttpRequest } from "../../lib/HttpHandler";
import { createSimpleMenuItem } from "../../lib/SimpleMenuItem";

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

      return [{ name, url }];
    }
  );

  global.log("filteredStatsion", filteredStations);
};

const updateRadioStations = () => {
  makeJsonHttpRequest<RadioStation[]>({
    url: "http://de1.api.radio-browser.info/json/stations",
    onSuccess: (resp) => saveStations(resp),
    onErr: (err) => {
      // TODO
      global.logError(err);
    },
  });

  // global.log('stationsUnfiltered', stationsUnfiltered)
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
