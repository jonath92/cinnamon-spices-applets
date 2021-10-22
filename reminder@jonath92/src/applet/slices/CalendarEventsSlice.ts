import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CalendarEvent } from '../model/CalendarEvent'


const initialState: CalendarEvent[] = [] 

const calendarEventSlice = createSlice({
    name: 'calendarEvents', 
    initialState, 
    reducers: {
        eventsLoaded(state, action: PayloadAction<CalendarEvent[]>){

            const updatedEventsSorted = action.payload.sort((a,b) => a.startUTC.diff(b.startUTC).milliseconds)

            return [...updatedEventsSorted]
        }
    }
})

export const {
    eventsLoaded
} = calendarEventSlice.actions

export default calendarEventSlice.reducer