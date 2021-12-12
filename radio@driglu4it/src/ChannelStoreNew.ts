import { createConfig } from "Config";
import { createMpvHandler } from "mpv/MpvHandler";
import { ChangeHandler, Channel } from "types";

interface Properties {
    mpvHandler: ReturnType<typeof createMpvHandler>,
    configs: ReturnType<typeof createConfig>
}

export function createChannelStoreNew(props: Properties) {
    const {
        mpvHandler: {
            getCurrentUrl
        },
        configs: {
            settingsObject
        }
    } = props

    const channelChangeHandler: ChangeHandler<Channel>[] = []  

    const getCurrentChannel = (): Channel | undefined => {
        const currentUrl = getCurrentUrl()

        return currentUrl ? settingsObject.userStations.find(cnl => cnl.url === currentUrl) : undefined
    }



    return {
        getCurrentChannel
    }

}