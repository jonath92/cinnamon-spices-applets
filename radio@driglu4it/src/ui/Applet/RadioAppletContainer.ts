
import { createConfig } from "../../Config"
import { createRadioAppletIcon } from "./RadioAppletIcon"


interface Props {
    configs: ReturnType<typeof createConfig>
}

export function createRadioAppletContainer(props: Props) {

    const { configs } = props

    // const appletContainer = createAppletContainer({
    //     icon: createRadioAppletIcon({configs})
    // })

}