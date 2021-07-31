import { Channel } from "../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface SettingsState {
    userStations: Channel[],
    initialVolume: number
}

const initialState: SettingsState = {
    userStations: [],
    initialVolume: null
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
        }
    }
})

// Actions
export const {
    userStationsChanged,
    initialVolumeChanged
} = settingsSlice.actions


export default settingsSlice.reducer