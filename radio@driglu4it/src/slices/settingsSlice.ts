import { Channel } from "../types";

type SettingsActions = {
    type: 'USER_STATIONS_CHANGED',
    payload: Channel[]
}

interface SettingsState {
    userStations: Channel[]
}

const settingsInitialState: SettingsState = {
    userStations: []
}

export const settingsReducer = (state: SettingsState = settingsInitialState, action: SettingsActions): SettingsState => {
    switch (action.type) {
        case 'USER_STATIONS_CHANGED':
            return {
                ...state,
                userStations: action.payload
            }
        default:
            return {
                ...state
            }
    }
}