import { refreshTokenChanged } from "../slices/settingsSlice";
import { eventsLoaded } from "../slices/CalendarEventsSlice";
import { dispatch, getState, watchSelector } from "../Store";
import { CalendarEvent } from "../model/CalendarEvent";
import { addCleanupFunction } from "../components/AppletContainer";
import { CalendarApi } from "applet/model/CalendarApi";
import { Office365Api } from '../lib/office365Api'

interface CalendarPollingArgs {
    onNewEventsPolled: (events: CalendarEvent[]) => void,
    calendarApi: CalendarApi
}

const selectCalendarAccounts = () => getState().settings.accounts

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
        })
    })


    // if (eventEmitterInitiallized) {
    //     global.logWarning('calenderEventEmitter already initiallized')
    //     return
    // }

    // let office35Handler: ReturnType<typeof createOffice365Handler> | undefined

    // initOffice365Handler(getState().settings)

    // watchSelector(selectOffice365Auth, (newValue) => {
    //     initOffice365Handler({ authCode: newValue })
    // })

    // const intervalId = setInterval(queryNewEvents, 100000)

    // function initOffice365Handler(args: { authCode?: string | undefined, refreshToken?: string | undefined }) {

    //     if (!args.authCode && !args.refreshToken)
    //         return

    //     office35Handler = createOffice365Handler({
    //         authorizatonCode: args.authCode,
    //         refreshToken: args.refreshToken,
    //         onRefreshTokenChanged: (newValue) => dispatch(refreshTokenChanged(newValue))
    //     })

    //     queryNewEvents()
    // }

    // async function queryNewEvents(): Promise<void> {
    //     if (!office35Handler)
    //         return

    //     const newEvents: CalendarEvent[] = (await office35Handler.getTodayEvents()).map(office365event => {
    //         return CalendarEvent.newFromOffice365response(office365event)
    //     })


    //     dispatch(eventsLoaded(newEvents))
    // }

    // addCleanupFunction(() => {
    //     clearInterval(intervalId)
    //     eventEmitterInitiallized = false
    // })
}