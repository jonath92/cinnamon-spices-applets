import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { loadSettingsFromFile, saveSettingsToFile, Settings } from 'utils'

const settingsSlice = createSlice({
    name: 'settings',
    initialState: loadSettingsFromFile(),
    reducers: {
        refreshTokenChanged(state, action: PayloadAction<{ mail: string, refreshToken: string }>) {
            global.log('refreshToken Change called')

            const { mail, refreshToken } = action.payload

            state.accounts = state.accounts?.map(acc => {
                return mail === acc.mail ? {...acc, refreshToken}: acc
            })

            saveSettingsToFile(state)
        }, 
        settingsFileChanged(state, action: PayloadAction<Settings>){
            global.log('settingsFileChanged dispatched', action.payload)
            state = action.payload

            return state
        }
    }
})

export const {
    refreshTokenChanged, 
    settingsFileChanged
} = settingsSlice.actions

export default settingsSlice.reducer