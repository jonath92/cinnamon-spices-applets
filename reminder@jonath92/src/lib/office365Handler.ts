import { HttpError, loadJsonAsync, isHttpError } from "./HttpHandler"
import { DateTime } from 'luxon';
import { logInfo } from "../services/Logger";
import { OFFICE365_CALENDAR_ENDPOINT, OFFICE365_CLIENT_ID, OFFICE365_CLIENT_SECRET, OFFICE365_TOKEN_ENDPOINT } from "../consts";

// https://docs.microsoft.com/en-us/graph/api/resources/datetimetimezone?view=graph-rest-1.0
interface DateTimeTimeZone {
    dateTime: string,
    timeZone: string
}

interface Office365CalendarResponse {
    '@odata.context': string, 
    value: Office365CalendarEvent[]
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

const CLIENT_ID = OFFICE365_CLIENT_ID
const CLIENT_SECRET = OFFICE365_CLIENT_SECRET


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

    async function refreshTokens() {

        const url = OFFICE365_TOKEN_ENDPOINT

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

    async function getTodayEvents(attempt: number = 0): Promise<Office365CalendarEvent[]> {

        const now = DateTime.now()
        const startOfDay = DateTime.fromObject({ day: now.day })
        const endOfDay = DateTime.fromObject({ day: now.day + 1 })

        !accessToken && refreshTokens()

        return new Promise(async (resolve, reject) => {
            try {
                const response = await loadJsonAsync<Office365CalendarResponse>({
                    url: OFFICE365_CALENDAR_ENDPOINT,
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },
                    queryParams: {
                        startdatetime: startOfDay.toISO(),
                        endDateTime: endOfDay.toISO()
                    }
                })

                global.log(response.value)
            
                resolve(response.value)
            } catch (error) {

                if (attempt >= 3) {
                    global.logError(`Couldn't connect to Microsoft Graph Api. Are you connected to the Internet? Don't hesitate to open a bug report when the error persists`)
                    // TODO improve 
                    global.logError(JSON.stringify(error))
                    return
                }

                if (isHttpError(error)) {
                    await handleHttpError(error)
                    getTodayEvents(attempt++)
                    return
                }

                reject(error)
            }
        })
    }

    async function handleHttpError(error: HttpError) {

        if (error.reason_phrase === 'Unauthorized') {
            logInfo('Microsft Graph Api Tokens not valid anymore ...')
            await refreshTokens()
        }

        // TODO handle network errors
    }


    return {
        getTodayEvents
    }
}