import { refreshTokenChanged } from "../slices/settingsSlice";
import { eventsLoaded } from "../slices/CalendarEventsSlice";
import { dispatch, getState, watchSelector } from "../Store";
import { CalendarEvent } from "../model/CalendarEvent";
import { addCleanupFunction } from "../components/AppletContainer";


// TODO: What when account has been removed?
const selectCalendarAccounts = () => getState().settings.accounts

let eventEmitterInitiallized = false



export function initCalendarEventEmitter(): void {

    watchSelector(selectCalendarAccounts, (newValue) => {
        global.log('new Calendar Accounts', JSON.stringify(newValue))
    }, false)


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