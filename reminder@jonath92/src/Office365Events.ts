import { stringify } from 'query-string'

const { Message, MemoryUse, SessionAsync } = imports.gi.Soup

// TODO: replace (with new ones as these can interact with onedrive)
const CLIENT_ID = "877b72ef-232d-424d-87c7-5b6636497a98"
const CLIENT_SECRET = "SM1=3hvquy[Bj7dvNeJB/qDzAoah?6:5"

const { get_home_dir } = imports.gi.GLib;
const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${__meta.uuid}`;
const { new_for_path } = imports.gi.Gio.File


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
interface TokenResponse {
    access_token: string,
    refresh_token: string
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface LoadJsonArgs {
    url: string,
    method: Method,
    bodyParams: HTTPParams
}

interface HTTPParams {
    [key: string]: boolean | string | number;
}


export async function getSoonEvents() {
    !refreshToken && await loadRefreshTokenFromSettings()
    !accessToken && await refreshTokens()
}


async function refreshTokens() {
    const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

    const params = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken
    }

    try {
        const response = await loadJsonAsync({
            method: 'POST',
            url,
            bodyParams: params
        }) as TokenResponse

        accessToken = response.access_token
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
        bodyParams
    } = args

    const message = Message.new(method, url)

    const bodyParamsStringified = stringify(bodyParams)

    // @ts-ignore
    message.set_request('application/x-www-form-urlencoded', MemoryUse.COPY, bodyParamsStringified)


    return new Promise((resolve, reject) => {
        httpSession.queue_message(message, (session, message) => {
            const error = checkForHttpError(message);

            global.log(error, JSON.stringify(error))
            if (error) {
                reject(error)
                return
            }

            const data = JSON.stringify(message.response_body.data)
            global.log(data)
            resolve(data)
        })
    })




}