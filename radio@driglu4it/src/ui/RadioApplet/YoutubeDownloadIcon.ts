import { DOWNLOAD_ICON_NAME } from "../../consts";
import { createAppletIcon } from "../../lib/AppletIcon";

export function createYoutubeDownloadIcon(){
  return createAppletIcon({
      icon_name: DOWNLOAD_ICON_NAME
  })   
}