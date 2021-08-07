import { stringify } from 'query-string'

const { Message, MemoryUse, SessionAsync } = imports.gi.Soup

// TODO: replace (with new ones as these can interact with onedrive)
const CLIENT_ID = "877b72ef-232d-424d-87c7-5b6636497a98"
const CLIENT_SECRET = "SM1=3hvquy[Bj7dvNeJB/qDzAoah?6:5"

const { get_home_dir } = imports.gi.GLib;
const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${__meta.uuid}`;
const { new_for_path } = imports.gi.Gio.File

const ByteArray = imports.byteArray;

let refreshToken: string
let accessToken: string

const httpSession = new SessionAsync()


interface Settings {
    refresh_token?: string
}

interface HttpError {
    code: number,
    message: string,
    reason_phrase: string
}

// not complete
interface Headers {
    'Content-Type': 'application/json' | 'application/x-www-form-urlencoded',
    'Authorization'?: string
}

// not complete
interface TokenResponse {
    access_token: string,
    refresh_token: string
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface LoadJsonArgs {
    url: string,
    method?: Method,
    bodyParams: HTTPParams,
    queryParams?: HTTPParams,
    headers: Headers
}

interface HTTPParams {
    [key: string]: boolean | string | number;
}


export async function getSoonEvents() {
    !refreshToken && await loadRefreshTokenFromSettings()
    !accessToken && await refreshTokens()
    loadCalendarData()
}


async function refreshTokens() {
    const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

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
        refreshToken = response.refresh_token

    } catch (error) {
        global.logError(`couldn't refresh Token, error: ${JSON.stringify(error)}`)
    }
}

async function loadRefreshTokenFromSettings() {
    const SETTINGS_PATH = CONFIG_DIR + '/settings.json'
    let settings: Settings

    try {
        const settingsFile = new_for_path(SETTINGS_PATH)
        const [success, contents] = settingsFile.load_contents(null)
        settings = JSON.parse(contents)
    } catch (error) {
        throw new Error(`couldn't load settings file`)
    }

    refreshToken = settings.refresh_token

    if (!refreshToken) throw new Error('refresh Token is undefined')
}


function checkForHttpError(message: imports.gi.Soup.Message): HttpError | false {

    const code = message?.status_code | 0
    const reason_phrase = message?.reason_phrase || 'no network response'

    let errMessage: string

    if (code < 100) {
        errMessage = "no network response"
    }

    else if (code < 200 || code > 300) {
        errMessage = "bad status code"
    }

    else if (!message.response_body?.data) {
        errMessage = 'no response body'
    }

    return errMessage ? {
        code,
        reason_phrase,
        message: errMessage
    } : false

}

function loadJsonAsync(args: LoadJsonArgs) {

    global.log('loadJsonAsync Called')
    const {
        url,
        method = 'GET',
        bodyParams,
        queryParams,
        headers
    } = args

    const query = queryParams ? `${url}?${stringify(queryParams)}` : url
    const message = Message.new(method, query)

    const bodyParamsStringified = stringify(bodyParams)

    Object.entries(headers).forEach(([key, value]) => {
        message.request_headers.append(key, value)
    })

    message.request_body.append(ByteArray.fromString(bodyParamsStringified, 'UTF-16'))

    //message.set_request(contentType, MemoryUse.COPY, bodyParamsStringified)


    return new Promise((resolve, reject) => {
        httpSession.queue_message(message, (session, message) => {

            const error = checkForHttpError(message);
            if (error) {
                reject(error)
                return
            }

            const data = JSON.parse(message.response_body.data)
            resolve(data)
        })
    })




}

async function loadCalendarData() {
    global.log('loadCalendar Data called')

    // TODO only for one day
    const nowMillisecs = Date.now()
    const nextWeekMillisecs = nowMillisecs + 604_800_000

    const queryParams = {
        startdatetime: new Date(nowMillisecs).toISOString(),
        endDateTime: new Date(nextWeekMillisecs).toISOString()
    }

    const query = `https://graph.microsoft.com/v1.0/me/calendarview?${stringify(queryParams)}`;

    const message = Message.new('GET', query)

    message.request_headers.append(
        'Content-Type',
        'application/json'
    )

    global.log('this line first called')


    message.request_headers.append(
        'Authorization',
        `Bearer ${accessToken}`
    )

    global.log('this line called')

    httpSession.queue_message(message, (session, message) => {
        const data = JSON.parse(message.response_body.data)
        global.log(JSON.stringify(data))
    })
}