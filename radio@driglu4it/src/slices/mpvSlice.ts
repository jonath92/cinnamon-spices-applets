import { AdvancedPlaybackStatus } from "../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
        volumeChanged(state, action: PayloadAction<number>) {
            state.volume = action.payload
        },
        titleChanged(state, action: PayloadAction<string>) {
            state.song_title = action.payload
        },
        playbackStatusChanged(state, action: PayloadAction<AdvancedPlaybackStatus>) {
            state.playbackStatus = action.payload
        },
    },
})

export const { volumeChanged, titleChanged, playbackStatusChanged } = mpvSlice.actions

export default mpvSlice.reducer