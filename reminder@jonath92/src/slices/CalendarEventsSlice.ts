import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CalendarEvent } from 'model/CalendarEvent'


const initialState: CalendarEvent[] = [] 

const calendarEventSlice = createSlice({
    name: 'calendarEvents', 
    initialState, 
    reducers: {
        eventsLoaded(state, action: PayloadAction<CalendarEvent[]>){

            const updatedEvents = action.payload

            const nonUpdatedEvents = state.filter(savedEvent => {
                return !updatedEvents.find(newEvent => newEvent.id === savedEvent.id)
            })

            return [...updatedEvents, ...nonUpdatedEvents]
        }
    }
})



export const {
    eventsLoaded
} = calendarEventSlice.actions

export default calendarEventSlice.reducer