import { CalendarEvent } from "./CalendarEvent";

export interface CalendarApi {
    getTodayEvents: () => Promise<CalendarEvent[]>
}