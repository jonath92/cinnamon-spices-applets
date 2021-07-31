import { AdvancedPlaybackStatus } from "../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MpvState {
    volume: number,
    song_title: string,
    playbackStatus: AdvancedPlaybackStatus,
    url: string
}

const initialState: MpvState = {
    volume: null,
    song_title: null,
    playbackStatus: 'Stopped',
    url: null
}


// TODO: can it be simplified with createEntityAdapter? https://redux.js.org/tutorials/fundamentals/part-8-modern-redux#using-createentityadapter
const mpvSlice = createSlice({
    name: 'mpv',
    initialState,
    reducers: {
        volumeChanged(state, action: PayloadAction<number>) {
            state.volume = action.payload
        },
        titleChanged(state, action: PayloadAction<string>) {
            state.song_title = action.payload
        },
        playbackStatusChanged(state, action: PayloadAction<AdvancedPlaybackStatus>) {
            state.playbackStatus = action.payload
        },
        urlChanged(state, action: PayloadAction<string>) {
            state.url = action.payload
        }
    },
})

// Actions
export const {
    volumeChanged,
    titleChanged,
    playbackStatusChanged,
    urlChanged
} = mpvSlice.actions


export default mpvSlice.reducer


