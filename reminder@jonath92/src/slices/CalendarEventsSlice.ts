import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'


export interface CalendarEvent {
    subject: string, 
    startUTC: DateTime, // TODO: really string?
    reminderBeforeStart: number // TODO: what is with mulitple reminders?
}

const initialState: CalendarEvent[] = [] 

const calendarEventSlice = createSlice({
    name: 'calendarEvents', 
    initialState, 
    reducers: {
        eventsLoaded(state, action: PayloadAction<CalendarEvent[]>){
            state.push(...action.payload)
        }
    }
})

export const {
    eventsLoaded
} = calendarEventSlice.actions

export default calendarEventSlice.reducer