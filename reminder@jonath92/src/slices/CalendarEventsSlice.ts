import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'

type Account = 'office365' | 'google'

export interface CalendarEvent {
    subject: string, 
    startUTC: DateTime, 
    reminderMinutesBeforeStart: number // TODO: what is with mulitple reminders?
    account: Account, 
    id: string
}

export interface CalendarEventUpdate {
    account: Account, 
    events: Omit<CalendarEvent, 'account'>[]
}

const initialState: CalendarEvent[] = [] 

const calendarEventSlice = createSlice({
    name: 'calendarEvents', 
    initialState, 
    reducers: {
        eventsLoaded(state, action: PayloadAction<CalendarEventUpdate>){

            const account = action.payload.account

            const newEvents: CalendarEvent[] = action.payload.events.map(event => {
                return {...event, account}
            })

            const eventsWithoutUpdatedAccount = state.filter(event => event.account !== account)

            return [...eventsWithoutUpdatedAccount, ...newEvents]
        }
    }
})





export const {
    eventsLoaded
} = calendarEventSlice.actions

export default calendarEventSlice.reducer