import mpvReducer from "./slices/mpvSlice";
import settingsReducer, { action } from "./slices/settingsSlice";
import { configureStore } from '@reduxjs/toolkit'


// TODO: store.dispatch currently allows AnyAction (i.e. no prober intelsense). No idea how to fix this :-(
export const store = configureStore({
    reducer: {
        mpv: mpvReducer,
        settings: settingsReducer
    }
})


// TODO: use https://www.npmjs.com/package/object-path
export function watchStateProp<T>(selectProp: () => T, cb: (newValue: T, oldValue?: T) => void) {
    let currentValue = selectProp()

    store.subscribe(() => {
        const newValue = selectProp()

        if (currentValue === newValue)
            return

        cb(newValue, currentValue)
        currentValue = newValue
    })
}

