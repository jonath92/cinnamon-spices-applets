import { configureStore } from '@reduxjs/toolkit'
import { isEqual } from 'lodash';
import settingsReducer from "./slices/settingsSlice";
import calendarEventsReducer from './slices/CalendarEventsSlice'

const store = configureStore({
    reducer: {
        settings: settingsReducer, 
        calendarEvents: calendarEventsReducer
    }
})


export function watchSelector<T>(selectProp: () => T, cb: (newValue: T, oldValue?: T) => void, checkEquality = true) {
    let currentValue = selectProp()

    store.subscribe(() => {
        const newValue = selectProp()

        if (checkEquality && isEqual(currentValue, newValue))
            return

        cb(newValue, currentValue)
        currentValue = newValue
    })
}

export function getState() {
    return store.getState()
}

export const dispatch = store.dispatch


// SELECTORS
export const selectEvents = () => getState().calendarEvents
