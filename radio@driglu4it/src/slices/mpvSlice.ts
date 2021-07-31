import { AdvancedPlaybackStatus } from "../types";

export type MpvActions = {
    type: 'VOLUME_CHANGED',
    payload: number
} | {
    type: 'SONG_TITLE_CHANGED',
    payload: string
} | {
    type: 'PLAYBACKSTATUS_CHANGED',
    payload: AdvancedPlaybackStatus
}

interface MpvState {
    volume: number,
    song_title: string,
    playbackStatus: AdvancedPlaybackStatus
}

const mpvInitialState: MpvState = {
    volume: null,
    song_title: null,
    playbackStatus: 'Stopped'
}


export const mpvReducer = (state: MpvState = mpvInitialState, action: MpvActions): MpvState => {
    switch (action.type) {
        case 'VOLUME_CHANGED':
            return {
                ...state,
                volume: action.payload
            }
        case 'SONG_TITLE_CHANGED':
            return {
                ...state,
                song_title: action.payload

            }
        case 'PLAYBACKSTATUS_CHANGED':
            return {
                ...state,
                playbackStatus: action.payload
            }
        default:
            global.logWarning('unhandled action type')
            return { ...state }
    }
}


// ACTIONS

export const volumeChanged = (volume: number): MpvActions => {
    return {
        type: 'VOLUME_CHANGED',
        payload: volume
    }
}

export const playbackStatusChanged = (playbackstatus: AdvancedPlaybackStatus): MpvActions => {
    return {
        type: 'PLAYBACKSTATUS_CHANGED',
        payload: playbackstatus
    }
}