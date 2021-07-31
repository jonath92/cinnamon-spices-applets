import mpvReducer from "./slices/mpvSlice";
import settingsReducer from "./slices/settingsSlice";
import { configureStore } from '@reduxjs/toolkit'
import { isEqual } from "lodash";

// TODO: store.dispatch currently allows AnyAction (i.e. no prober intelsense). Tried a lot but couldn't find a way to fix it :-(
// Maybe a way to fix is, is to have a look at how useDispatch in react works (does useDispatch actually have intellisense?)
// Alternatively creating Stores wihtout createSlice...?
export const store = configureStore({
    reducer: {
        mpv: mpvReducer,
        settings: settingsReducer
    }
})

export function watchSelector<T>(selectProp: () => T, cb: (newValue: T, oldValue?: T) => void) {
    let currentValue = selectProp()

    store.subscribe(() => {
        const newValue = selectProp()

        if (isEqual(currentValue, newValue))
            return

        cb(newValue, currentValue)
        currentValue = newValue
    })
}

function getState() {
    return store.getState()
}

export function selectCurrentChannelName(): string {
    const channelList = getState().settings.userStations
    const currentUrl = getState().mpv.url

    const currentChannel = channelList.find(cnl => cnl.url === currentUrl)

    return currentChannel ? currentChannel.name : null

}