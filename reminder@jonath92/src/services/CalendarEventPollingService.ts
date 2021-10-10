import { refreshTokenChanged } from "../slices/settingsSlice";
import { createOffice365Handler } from "../lib/office365Handler";
import { eventsLoaded } from "../slices/CalendarEventsSlice";
import { dispatch, getState, watchSelector } from "../Store";
import { CalendarEvent } from "model/CalendarEvent";
import { addCleanupFunction } from "components/AppletContainer";

const selectOffice365Auth = () => getState().settings.authCode

let eventEmitterInitiallized = false

// The CalendarEventEmitter acts as a layer betweeen calendar Apis (which are coded in a way that they should relatively easy be used outside of cinnamon as well) and the global state.
export function initCalendarEventEmitter(): void {

    if (eventEmitterInitiallized) {
        global.logWarning('calenderEventEmitter already initiallized')
        return
    }

    let office35Handler: ReturnType<typeof createOffice365Handler> | undefined

    initOffice365Handler(getState().settings)

    watchSelector(selectOffice365Auth, (newValue) => {
        initOffice365Handler({ authCode: newValue })
    })

    const intervalId = setInterval(queryNewEvents, 10000)

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

    async function queryNewEvents(): Promise<void> {
        if (!office35Handler)
            return

        const newEvents: CalendarEvent[] = (await office35Handler.getTodayEvents()).map(office365event => {
            return CalendarEvent.newFromOffice365response(office365event)
        })


        dispatch(eventsLoaded(newEvents))
    }

    addCleanupFunction(() => {
        clearInterval(intervalId)
        eventEmitterInitiallized = false
    })
}