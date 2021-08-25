import { loadJsonAsync } from "./HttpHandler"
import { DateTime } from 'luxon';
import { getState } from "./Store";
import { CalendarEvent } from "./slices/CalendarEventsSlice";

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

// TODO: replace (with new ones as these can interact with onedrive)
const CLIENT_ID = "877b72ef-232d-424d-87c7-5b6636497a98"
const CLIENT_SECRET = "SM1=3hvquy[Bj7dvNeJB/qDzAoah?6:5"


// TODO rename to getOffice365Events
export function createOffice365Handler(args: Arguments) {

    const {
        authorizatonCode, 
    } = args

    let {
        refreshToken
    } = args

    let accessToken: string

    if (authorizatonCode == null && refreshToken == null)
        throw new Error('AuthorizationCode and refreshToken must not be both null or undefined')

    
    async function getTodayEvents(): Promise<CalendarEvent []>  {
        let office365CalendarEvents: Office365CalendarEvent[] = []
        let formatedEvents: CalendarEvent[] = []

        try {
            await refreshTokens() // TODO this should only be called when the access Token is not defined our outdated (which can be found out when an error occurs when querying the calendar data)
            office365CalendarEvents = await loadCalendarData()

            formatedEvents = office365CalendarEvents.map(office365Event => {
                return {
                    reminderBeforeStart: office365Event.reminderMinutesBeforeStart, 
                    subject: office365Event.subject, 
                    startUTC: DateTime.fromISO(office365Event.start.dateTime + 'Z')
                }
            })

        } catch (error) {
            global.logError("couldn't get soon occuring events", error);
        }
    
        return formatedEvents
    }

    async function refreshTokens() {

        const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    
        if (!refreshToken){
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
            //refreshToken = response.refresh_token

            //onRefreshTokenChanged(refreshToken)
    
        } catch (error) {
            global.logError(`couldn't refresh Token, error: ${JSON.stringify(error)}`)
        }
    }

    async function loadCalendarData(): Promise<Office365CalendarEvent[]> {

        //const now = DateTime.now()
    
        const now = DateTime.now()
    
        // FIXME: isn't there an easier way?
        const startOfDay = DateTime.fromObject({
            year: now.year, month: now.month, day: now.day, hour: 0, minute: 0
        })
    
        const endOfDay = DateTime.fromObject(
            { year: now.year, month: now.month, day: now.day, hour: 23, minute: 59, second: 59 }
        )
    
    
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
                resolve(calendar)
            } catch (error) {
                global.logError("Couldn't get calendar data", JSON.stringify(error))
                reject(error)
            }
        })
    }


    return { 
        getTodayEvents
    }
}