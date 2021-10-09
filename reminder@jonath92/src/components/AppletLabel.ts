import { DateTime } from "luxon";

const { Label } = imports.gi.St
const { ActorAlign } = imports.gi.Clutter
const { EllipsizeMode } = imports.gi.Pango

export function createAppletLabel() {

    const label = new Label({
        reactive: true,
        track_hover: true,
        style_class: 'applet-label',
        y_align: ActorAlign.CENTER,
        y_expand: false,
        text: 'hi'
    })

    // No idea why needed but without the label is not shown 
    label.clutter_text.ellipsize = EllipsizeMode.NONE

    setIntervalAccurate(() => {
        const time = DateTime.now()
        label.set_text(time.toFormat(`EEEE, MMMM d, HH:mm`, { locale: 'de'}))
    }, 1000, true)

    return label
}


/**
 * setInterval is allowed to slightly differ from the passed interval. That can lead to a significant 
 * difference of expected number of calls and actuall number of calls. This function compensate the
 * differences ... based on: https://stackoverflow.com/a/29972322/11603006
 * 
 * @param callback 
 * @param interval 
 * @param callImmediately whether to call the callback immediately. Default = false
 * 
 * @returns clear function
 */
function setIntervalAccurate(callback: () => void, interval: number, callImmediately = false): () => void{

    let expected = Date.now() + interval
    let clear = false

    callImmediately && callback()

    const step = () => {
        const dt = Date.now() - expected
        expected += interval
        callback()

        !clear && setTimeout(step, Math.max(0, interval - dt))
    }

    setTimeout(step, interval)

    return () => {clear = true}

}