import { Channel } from "../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
    userStations: Channel[],
    initialVolume: number,
    lastUrl: string
}

const initialState: SettingsState = {
    userStations: [],
    initialVolume: null,
    lastUrl: null
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        userStationsChanged(state, action: PayloadAction<Channel[]>) {
            state.userStations = action.payload
        },
        initialVolumeChanged(state, action: PayloadAction<number>) {
            state.initialVolume = action.payload
        },
        lastUrlChanged(state, action: PayloadAction<string>) {
            state.lastUrl = action.payload
        }
    }
})

// Action Creators
export const {
    userStationsChanged,
    initialVolumeChanged,
    lastUrlChanged
} = settingsSlice.actions


export default settingsSlice.reducer