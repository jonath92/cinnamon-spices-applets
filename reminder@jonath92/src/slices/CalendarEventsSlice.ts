import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'


type Account = 'office365' | 'google'

// without account. What is a better name? 
export interface CalendarEventGeneric {
    subject: string, 
    startUTC: DateTime, 
    reminderBeforeStart: number // TODO: what is with mulitple reminders?
}

interface CalendarEvent extends CalendarEventGeneric {
    account: Account
}

export interface CalendarEventUpdate {
    account: Account, 
    events: CalendarEventGeneric[]
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