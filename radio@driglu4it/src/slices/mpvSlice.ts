import { AdvancedPlaybackStatus } from "../types";
import { createSlice } from '@reduxjs/toolkit'

interface MpvState {
    volume: number,
    song_title: string,
    playbackStatus: AdvancedPlaybackStatus
}

const initialState: MpvState = {
    volume: null,
    song_title: null,
    playbackStatus: 'Stopped'
}

// TODO: can it be improved with createEntityAdapter? https://redux.js.org/tutorials/fundamentals/part-8-modern-redux#using-createentityadapter

const mpvSlice = createSlice({
    name: 'mpv',
    initialState,
    reducers: {
        volumeChanged(state, action) {
            state.volume = action.payload
        },
        titleChanged(state, action) {
            state.song_title = action.payload
        },
        playbackStatusChanged(state, action) {
            state.playbackStatus = action.payload
        }
    }
})

export const { volumeChanged, titleChanged, playbackStatusChanged } = mpvSlice.actions


export default mpvSlice.reducer

// export const mpvReducer = (state: MpvState = mpvInitialState, action: MpvActions): MpvState => {
//     switch (action.type) {
//         case 'mpv/volume_changed':
//             return {
//                 ...state,
//                 volume: action.payload
//             }
//         case 'mpv/song_title_changed':
//             return {
//                 ...state,
//                 song_title: action.payload

//             }
//         case 'mpv_playbackstatus_changed':
//             return {
//                 ...state,
//                 playbackStatus: action.payload
//             }
//         default:
//             global.logWarning('unhandled action type')
//             return { ...state }
//     }
// }


// // ACTIONS

// export const volumeChanged = (volume: number): MpvActions => {
//     return {
//         type: 'mpv/volume_changed',
//         payload: volume
//     }
// }

// export const playbackStatusChanged = (playbackstatus: AdvancedPlaybackStatus): MpvActions => {
//     return {
//         type: 'mpv_playbackstatus_changed',
//         payload: playbackstatus
//     }
// }