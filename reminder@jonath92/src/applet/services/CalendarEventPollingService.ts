import { refreshTokenChanged } from "../slices/settingsSlice";
import { eventsLoaded } from "../slices/CalendarEventsSlice";
import { dispatch, getState, watchSelector } from "../Store";
import { CalendarEvent } from "../../CalendarEvent";
import { addCleanupFunction } from "../components/AppletContainer";
import { CalendarApi } from "CalendarApi";
import { Office365Api } from '../../office365Api'

interface CalendarPollingArgs {
    onNewEventsPolled: (events: CalendarEvent[]) => void,
    calendarApi: CalendarApi
}

const selectCalendarAccounts = () => getState().settings.accounts


// TODO function: fetchEventsFromOffice365 - this function should create the CalendarEvents

/**
 * 
 * @param args 
 * @returns the cleanup function
 */
const createCalendarPollingService = (args: CalendarPollingArgs): () => void => {
    const { onNewEventsPolled, calendarApi } = args

    const intervalId = setInterval(queryNewEvents, 10000)

    async function queryNewEvents(): Promise<void> {
        const newEvents = await calendarApi.getTodayEvents()
        onNewEventsPolled(newEvents)
    }

    return () => clearInterval(intervalId)
}


// TODO: handle cleanup for delete accounts
export function initCalendarEventEmitter(): void {

    const currentAccounts: string[] = []

    watchSelector(selectCalendarAccounts, (newAccounts) => {
        global.log('new Accounts selector called')

        newAccounts.forEach(account => {


            if (currentAccounts.includes(account.mail)) {
                return
            }

            const api = new Office365Api({
                authorizatonCode: account.authCode,
                onRefreshTokenChanged: (newToken) => dispatch(refreshTokenChanged({ mail: account.mail, refreshToken: newToken })),
                refreshToken: account.refreshToken
            })

            createCalendarPollingService({ onNewEventsPolled: (events) => dispatch(eventsLoaded(events)), calendarApi: api })
        }, false)
    })

}