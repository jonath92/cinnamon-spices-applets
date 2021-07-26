import { AdvancedPlaybackStatus } from "./types";
import { createStore } from "redux"

type Action = {
    type: 'VOLUME_CHANGED',
    payload: number
} | {
    type: 'SONG_TITLE_CHANGED',
    payload: string
} | {
    type: 'PLAYBACKSTATUS_CHANGED',
    payload: AdvancedPlaybackStatus
}

interface State {
    mpv: {
        volume: number,
        song_title: string,
        playbackStatus: AdvancedPlaybackStatus
    }
}

const initialState: State = {
    mpv: {
        volume: null,
        song_title: null,
        playbackStatus: 'Stopped'
    }
}

const reducer = (state: State = initialState, action: Action): State => {

    switch (action.type) {
        case 'VOLUME_CHANGED':
            return {
                ...state,
                mpv: {
                    ...state.mpv,
                    volume: action.payload
                }
            }
        case 'SONG_TITLE_CHANGED':
            return {
                ...state,
                mpv: {
                    ...state.mpv,
                    song_title: action.payload
                }
            }
        case 'PLAYBACKSTATUS_CHANGED':
            return {
                ...state,
                mpv: {
                    ...state.mpv,
                    playbackStatus: action.payload
                }
            }
        default:
            // TODO: not logging when action starts with @@redux
            global.logWarning('unhandled action type')
            return { ...state }
    }
}

export const store = createStore(reducer)


export function watchProp<T>(selectProp: () => T, cb: (newValue: T, oldValue?: T) => void) {
    let currentValue = selectProp()

    store.subscribe(() => {
        const newValue = selectProp()

        if (currentValue === newValue)
            return

        cb(newValue, currentValue)
        currentValue = newValue
    })
}


// ACTIONS

export const volumeChanged = (volume: number): Action => {
    return {
        type: 'VOLUME_CHANGED',
        payload: volume
    }
}

export const playbackStatusChanged = (playbackstatus: AdvancedPlaybackStatus): Action => {
    return {
        type: 'PLAYBACKSTATUS_CHANGED',
        payload: playbackstatus
    }
}