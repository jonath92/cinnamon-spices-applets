import { DateTime } from "luxon";
import { refreshTokenChanged } from "../slices/settingsSlice";
import { createOffice365Handler, Office365CalendarEvent } from "../lib/office365Handler";
import { CalendarEvent, CalendarEventUpdate, eventsLoaded } from "../slices/CalendarEventsSlice";
import { dispatch, getState, watchSelector } from "../Store";

const selectOffice365Auth = () => getState().settings.authCode


// The CalendarEventEmitter acts as a layer betweeen calendar Apis (which are coded in a way that they should relatively easy be used outside of cinnamon as well).
export function initCalendarEventEmitter() {
    let office35Handler: ReturnType<typeof createOffice365Handler> | undefined

    initOffice365Handler(getState().settings)

    watchSelector(selectOffice365Auth, (newValue) => {
        initOffice365Handler({authCode: newValue})
    })

    setInterval(queryNewEvents, 10000)

    function initOffice365Handler(args: { authCode?: string | undefined, refreshToken?: string | undefined }) {

        if (!args.authCode && !args.refreshToken)
            return

        office35Handler = createOffice365Handler({
            authorizatonCode: args.authCode,
            refreshToken: args.refreshToken,
            onRefreshTokenChanged: (newValue) => dispatch(refreshTokenChanged(newValue))
        })

        queryNewEvents()
    }

    function convertOffice365Events(office365Events: Office365CalendarEvent[]): CalendarEventUpdate {
        const convertedEvents: Omit<CalendarEvent, 'account'>[] = office365Events.map(office365Event => {
            return {
                reminderBeforeStart: office365Event.reminderMinutesBeforeStart,
                startUTC: DateTime.fromISO(office365Event.start.dateTime + 'Z'),
                subject: office365Event.subject
            }
        })

        return {
            account: 'office365', 
            events: convertedEvents
        }
    }

    async function queryNewEvents(){
        if (!office35Handler)
            return

        const newEvents = convertOffice365Events(
            await office35Handler.getTodayEvents()
        )

        dispatch(eventsLoaded(newEvents))
    }

}