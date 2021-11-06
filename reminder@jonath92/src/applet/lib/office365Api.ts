import { HttpError, loadJsonAsync, isHttpError } from "./HttpHandler"
import { DateTime } from 'luxon';
import { logInfo } from "../services/Logger";
import { OFFICE365_CALENDAR_ENDPOINT, OFFICE365_CLIENT_ID, OFFICE365_CLIENT_SECRET, OFFICE365_TOKEN_ENDPOINT } from "../../consts";
import { CalendarApi } from "applet/model/CalendarApi";
import { CalendarEvent } from "applet/model/CalendarEvent";

// https://docs.microsoft.com/en-us/graph/api/resources/datetimetimezone?view=graph-rest-1.0
interface DateTimeTimeZone {
    dateTime: string,
    timeZone: string
}

interface Office365CalendarResponse {
    '@odata.context': string,
    value: Office365CalendarEventResponse[]
}

interface OnlineMeeting {
    joinUrl: string
}

// not complete
export interface Office365CalendarEventResponse {
    id: string,
    subject: string,
    webLink: string,
    start: DateTimeTimeZone,
    reminderMinutesBeforeStart: number,
    onlineMeeting: OnlineMeeting | null
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
    /** called when RefreshToken changed, for example a function which saves the token to a file*/
    onRefreshTokenChanged?: (newToken: string) => void
}

const CLIENT_ID = OFFICE365_CLIENT_ID
const CLIENT_SECRET = OFFICE365_CLIENT_SECRET

export class Office365Api implements CalendarApi {

    private authorizatonCode: string | undefined
    private refreshToken: string | undefined
    private onRefreshTokenChanged: ((newToken: string) => void) | undefined
    private accessToken: string | undefined

    constructor(args: Arguments) {
        const { authorizatonCode, refreshToken, onRefreshTokenChanged } = args

        if (authorizatonCode == null && refreshToken == null)
            throw new Error('AuthorizationCode and refreshToken must not be both null or undefined')

        this.authorizatonCode = authorizatonCode
        this.refreshToken = refreshToken
        this.onRefreshTokenChanged = onRefreshTokenChanged
    }

    private async refreshTokens(): Promise<void> {
        if (!this.refreshToken) {
            // TODO: get refreshToken from accessToken!! 
            throw new Error('refresh Token must be defined')
        }

        try {
            const response = await loadJsonAsync<TokenResponse>({
                method: 'POST',
                url: OFFICE365_TOKEN_ENDPOINT,
                bodyParams: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: "refresh_token",
                    refresh_token: this.refreshToken
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })

            const { access_token, refresh_token } = response

            this.accessToken = access_token

            if (this.refreshToken !== refresh_token) {
                this.refreshToken = refresh_token
                this.onRefreshTokenChanged?.(refresh_token)
            }

        } catch (error) {
            global.logError(`couldn't refresh Token, error: ${JSON.stringify(error)}`)
        }

    }

    public async getTodayOffice365Events(attempt: number = 0): Promise<Office365CalendarEventResponse[]> {
        const now = DateTime.now()
        const startOfDay = DateTime.fromObject({ day: now.day })
        const endOfDay = DateTime.fromObject({ day: now.day + 1 })

        !this.accessToken && await this.refreshTokens()

        return new Promise(async (resolve, reject) => {
            try {
                const response = await loadJsonAsync<Office365CalendarResponse>({
                    url: OFFICE365_CALENDAR_ENDPOINT,
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${this.accessToken}`
                    },
                    queryParams: {
                        startdatetime: startOfDay.toISO(),
                        endDateTime: endOfDay.toISO()
                    }
                })

                resolve(response.value)

            } catch (error) {

                if (attempt >= 3) {
                    global.logError(`Couldn't connect to Microsoft Graph Api. Are you connected to the Internet? Don't hesitate to open a bug report when the error persists`)
                    // TODO improve 
                    global.logError(JSON.stringify(error))
                    return
                }

                if (isHttpError(error)) {
                    await this.handleHttpError(error)
                    this.getTodayOffice365Events(++attempt)
                    return
                }

                reject(error)
            }
        })


    };


    public async getTodayEvents(): Promise<CalendarEvent[]> {
        const todayOffice365Events = await this.getTodayOffice365Events()

        return todayOffice365Events.map(office365Event => CalendarEvent.newFromOffice365response(office365Event))
    }


    private async handleHttpError(error: HttpError) {
        if (error.reason_phrase === 'Unauthorized') {
            logInfo('Unauthorized Error. Microsft Graph Api Tokens probably not valid anymore ...')
            await this.refreshTokens()
        }

        // TODO handle network errors
    }




}
