import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { loadSettingsFromFile, saveSettingsToFile } from 'utils'

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
        }
    }
})

export const {
    refreshTokenChanged
} = settingsSlice.actions

export default settingsSlice.reducer