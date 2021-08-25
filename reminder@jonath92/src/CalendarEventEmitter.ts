import { createOffice365Handler } from "./office365Handler";
import { eventsLoaded } from "./slices/CalendarEventsSlice";
import { dispatch, getState, watchSelector } from "./Store";


const selectOffice365Auth = () => getState().settings.authCode


export function initCalendarEventEmitter() {
    let office35Handler: ReturnType<typeof createOffice365Handler> | undefined

    initOffice365Handler(getState().settings)

    watchSelector(selectOffice365Auth, (newValue) => {
        initOffice365Handler({authCode: newValue})
    })

    function initOffice365Handler(args: { authCode?: string | undefined, refreshToken?: string | undefined }) {

        if (!args.authCode && !args.refreshToken)
            return

        office35Handler = createOffice365Handler({
            authorizatonCode: args.authCode,
            refreshToken: args.refreshToken,
            onRefreshTokenChanged: (newValue) => { } // TODO
        })

        queryNewEvents()
    }

    async function queryNewEvents(){
        if (!office35Handler)
            return

        const newEvents = await office35Handler.getTodayEvents()

        dispatch(eventsLoaded(newEvents))
        
    }


}