import { AdvancedPlaybackStatus, Channel } from "./types";
import { createStore } from "redux"
import { combineReducers } from 'redux'
import { mpvReducer } from "./slices/mpvSlice";

const reducer = combineReducers({
    mpv: mpvReducer
})



export const store = createStore(reducer)


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


