import { createConfig2 } from "Config2";

const onIconChanged = jest.fn(() => { })
const onIconColorPlayingChanged = jest.fn(() => { })
const onIconColorPausedChanged = jest.fn(() => { })
const onChannelOnPanelChanged = jest.fn(() => { })
const onMyStationsChanged = jest.fn(() => { })

describe('initialization is working', () => {

    it('no error', () => {
        const config2 = createConfig2({
            onChannelOnPanelChanged,
            onIconChanged,
            onIconColorPausedChanged,
            onIconColorPlayingChanged,
            onMyStationsChanged
        })
    })

});