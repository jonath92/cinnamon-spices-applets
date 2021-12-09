import { createConfig } from "Config";
import { createMpvHandler } from "mpv/MpvHandler";

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

    const getcurrentChannel = () => {
        const currentUrl = getCurrentUrl()

        return currentUrl ? settingsObject.userStations.find(cnl => cnl.url === currentUrl) : undefined

    }

    return {
        getcurrentChannel
    }

}