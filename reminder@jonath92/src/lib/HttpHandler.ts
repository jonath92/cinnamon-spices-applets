import { stringify } from 'query-string'

const { Message, SessionAsync } = imports.gi.Soup

const httpSession = new SessionAsync()

interface HTTPParams {
    [key: string]: boolean | string | number;
}

export interface HttpError {
    code: number,
    message: string,
    reason_phrase: string
}

export function isHttpError(x:any): x is HttpError {
    return typeof x.reason_phrase === 'string'
}


type Method = "GET" | "POST" | "PUT" | "DELETE";

// not complete
interface Headers {
    'Content-Type': 'application/json' | 'application/x-www-form-urlencoded',
    'Authorization'?: string
}

interface LoadJsonArgs {
    url: string,
    method?: Method,
    bodyParams?: HTTPParams,
    queryParams?: HTTPParams,
    headers: Headers
}

const ByteArray = imports.byteArray;

function checkForHttpError(message: imports.gi.Soup.Message): HttpError | false {

    const code = message?.status_code | 0
    const reason_phrase = message?.reason_phrase || 'no network response'

    let errMessage: string | undefined

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


export function loadJsonAsync<T>(args: LoadJsonArgs): Promise<T> {

    const {
        url,
        method = 'GET',
        bodyParams,
        queryParams,
        headers
    } = args


    const query = queryParams ? `${url}?${stringify(queryParams)}` : url
    const message = Message.new(method, query)

    Object.entries(headers).forEach(([key, value]) => {
        message.request_headers.append(key, value)
    })

    if (bodyParams) {
        const bodyParamsStringified = stringify(bodyParams)
        message.request_body.append(ByteArray.fromString(bodyParamsStringified, 'UTF-16'))
    }

    return new Promise((resolve, reject) => {

        httpSession.queue_message(message, (session, message) => {

            const error = checkForHttpError(message);

            if (error) {
                reject(error)
                return
            }

            const data = JSON.parse(message.response_body.data) as T
            resolve(data)
        })
    })

}