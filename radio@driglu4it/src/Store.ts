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
        song_title: string
    }
}
const reducer = (state: State, action: Action): State => {

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
        default:
            // TODO: not logging when action starts with @@redux
            global.logWarning('unhandled action type')
            return { ...state }
    }
}


export const store = createStore(reducer)

