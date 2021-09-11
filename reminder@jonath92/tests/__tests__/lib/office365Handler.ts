import { OFFICE365_CALENDAR_ENDPOINT, OFFICE365_TOKEN_ENDPOINT } from 'consts'
import { HttpError, loadJsonAsync } from 'lib/HttpHandler'
import { createOffice365Handler, Office365CalendarEvent } from 'lib/office365Handler'

jest.mock('services/Logger')
jest.mock('lib/HttpHandler')

const loadJsonAsyncMock = loadJsonAsync as jest.Mock<ReturnType<typeof loadJsonAsync>>

type LoadJsonArgs = Parameters<typeof loadJsonAsync>[0]

const VALID_REFRESH_TOKEN = '89372987298'
const VALID_ACCESS_TOKEN = '12345678910'


// simplfied
const exampleEvents: Office365CalendarEvent[] = [
    {
        id: 'aksfjksfj',  // TODO: idgenerator 
        reminderMinutesBeforeStart: 15, 
        start: {
            dateTime: "2021-09-08T15:00:00.0000000",
            timeZone: "UTC"
        }, 
        subject: 'Weekly', 
        webLink: "https://outlook.office365.com/owa/?itemid=AAMkAGY1OTRkNzEyLTBmZDAtNDU5NC1hOWU3LTUxYjdmOGY5M2RiMQBGAAAAAAB5AEzSmO0IQL2zNXJl2wuQBwB6FgCrWbwWTrPLJ6YYIwnBAAAAAAENAAB6FgCrWbwWTrPLJ6YYIwnBAAAdWxVWAAA%3D&exvsurl=1&path=/calendar/item"
    }
]


async function mockCalendarEndpoint(args: Omit<LoadJsonArgs, 'url'>){

    const { method, headers, queryParams } = args

    return new Promise((resolve, reject) => {

        const expectedAuthorizationHeader = `Bearer ${VALID_ACCESS_TOKEN}`

        if (headers.Authorization !== expectedAuthorizationHeader){
            const error: HttpError = {
                code: 401, 
                reason_phrase: 'Unauthorized', 
                message: 'bad status code'
            }
            reject(error)
        }
    
        resolve({
            value: exampleEvents
        })

    })

}

async function mockTokenEndpoint(args: Omit<LoadJsonArgs, 'url'>){
    const {bodyParams, headers, method} = args
   
    return new Promise((resolve, reject) => {
        resolve({
            access_token: VALID_ACCESS_TOKEN
        })
    })

}


loadJsonAsyncMock.mockImplementation(async (args: LoadJsonArgs) => {

    const { url, ...requestParams } = args

    if (url === OFFICE365_CALENDAR_ENDPOINT) 
        return mockCalendarEndpoint(requestParams)

    if (url === OFFICE365_TOKEN_ENDPOINT){
        return mockTokenEndpoint(requestParams)
    }

    return new Promise((resolve, reject) => {
        reject('wrong endpoint')
    })
})


describe('working with valid refresh_token', () => {

    it('should receice daily events', async () => {

        const { getTodayEvents } = createOffice365Handler({
            refreshToken: VALID_REFRESH_TOKEN,
            onRefreshTokenChanged: (newToken: string) => { }
        })

        const events = await getTodayEvents()

        expect(events).toBe(exampleEvents)

    })

});

