import { HttpError, loadJsonAsync } from "./HttpHandler"
import { DateTime } from 'luxon';
import { isHttpError } from '../lib/HttpHandler'

// https://docs.microsoft.com/en-us/graph/api/resources/datetimetimezone?view=graph-rest-1.0
interface DateTimeTimeZone {
    dateTime: string,
    timeZone: string
}

// not complete
export interface Office365CalendarEvent {
    id: string,
    subject: string,
    webLink: string,
    start: DateTimeTimeZone,
    reminderMinutesBeforeStart: number,
    transactionId: string,
    originalStart: string
}

// not complete
interface TokenResponse {
    access_token: string,
    refresh_token: string
}

interface Arguments {
    /** code received from the Login. Only one of authorizationCode and refreshToken needs to be passed */
    authorizatonCode?: string,
    /** required when no authorizatonCode passed */
    refreshToken?: string,
    /** called when RefreshToken changed. Should be a function which saves the token to a file*/
    onRefreshTokenChanged: (newToken: string) => void
}

// TODO: pass as props - that way it is kept generic
// TODO: replace (with new ones as these can interact with onedrive)
const CLIENT_ID = "877b72ef-232d-424d-87c7-5b6636497a98"
const CLIENT_SECRET = "SM1=3hvquy[Bj7dvNeJB/qDzAoah?6:5"


// TODO rename to getOffice365Events
export function createOffice365Handler(args: Arguments) {

    const {
        authorizatonCode,
        onRefreshTokenChanged
    } = args

    let {
        refreshToken
    } = args

    let accessToken: string | null

    if (authorizatonCode == null && refreshToken == null)
        throw new Error('AuthorizationCode and refreshToken must not be both null or undefined')


    async function getTodayEvents(): Promise<Office365CalendarEvent[]> {
        let office365CalendarEvents: Office365CalendarEvent[] = []

        try {
            office365CalendarEvents = await loadCalendarData()

        } catch (error) {
            global.logError("couldn't get soon occuring events", error);
        }

        return office365CalendarEvents
    }

    async function refreshTokens() {

        const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

        if (!refreshToken) {
            throw new Error('refresh Token must be defined')
        }

        try {
            const response = await loadJsonAsync({
                method: 'POST',
                url,
                bodyParams: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: "refresh_token",
                    refresh_token: refreshToken
                },
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded'
                }
            }) as TokenResponse

            accessToken = response.access_token
            // TODO: save RefreshToken to file as only valid for 90 days

            const newToken = response.refresh_token

            if (newToken !== refreshToken) {
                refreshToken = newToken
                onRefreshTokenChanged(newToken)
            }

        } catch (error) {

            global.logError(`couldn't refresh Token, error: ${JSON.stringify(error)}`)
        }
    }

    async function loadCalendarData(attempt: number = 0): Promise<Office365CalendarEvent[]> {

        const now = DateTime.now()
        const startOfDay = DateTime.fromObject({ day: now.day })
        const endOfDay = DateTime.fromObject({ day: now.day + 1 })

        !accessToken && refreshTokens()

        return new Promise(async (resolve, reject) => {
            try {
                const response = await loadJsonAsync({
                    url: 'https://graph.microsoft.com/v1.0/me/calendarview',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },
                    queryParams: {
                        startdatetime: startOfDay.toISO(),
                        endDateTime: endOfDay.toISO()
                    }
                })


                // FIXME: why ts-ignore? 
                // @ts-ignore
                const calendar = response.value as Office365CalendarEvent[]

                global.log('office365 events updated')

                resolve(calendar)
            } catch (error) {

                if (attempt >= 3) {
                    global.logError(`Couldn't connect to Microsoft Graph Api. Are you connected to the Internet? Don't hesitate to open a bug report when the error persists`)
                    // TODO improve 
                    global.logError(JSON.stringify(error))

                    return
                }

                if (isHttpError(error)) {
                    await handleHttpError(error)
                    loadCalendarData(attempt++)
                }


                global.logError("Couldn't get calendar data", error)
                global.log("Couldn't get calendar data in logs", 'error')
                reject(error)
            }
        })
    }


    async function handleHttpError(error: HttpError) {

        if (error.reason_phrase === 'Unauthorized') {
            global.log('Microsft Graph Api Tokens not valid anymore ...')
            await refreshTokens()
        }
    }


    return {
        getTodayEvents
    }
}