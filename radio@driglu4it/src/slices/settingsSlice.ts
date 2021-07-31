import { Channel } from "../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface SettingsState {
    userStations: Channel[]
}

const initialState: SettingsState = {
    userStations: []
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        userStationsChanged(state, action: PayloadAction<Channel[]>) {
            state.userStations = action.payload
        }
    }
})

// Actions
export const {
    userStationsChanged
} = settingsSlice.actions


export default settingsSlice.reducer