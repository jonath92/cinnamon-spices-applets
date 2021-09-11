import { OFFICE365_CALENDAR_ENDPOINT } from 'consts'
import { HttpError, loadJsonAsync } from 'lib/HttpHandler'
import { createOffice365Handler } from 'lib/office365Handler'

jest.mock('services/Logger')
jest.mock('lib/HttpHandler')

const loadJsonAsyncMock = loadJsonAsync as jest.Mock<ReturnType<typeof loadJsonAsync>>

type LoadJsonArgs = Parameters<typeof loadJsonAsync>[0]

const VALID_REFRESH_TOKEN = '89372987298'
const VALID_ACCESS_TOKEN = '12345678910'



async function mockCalendarEndpoint(args: Omit<LoadJsonArgs, 'url'>){

    global.log('this is called')
    const { headers, queryParams } = args

    return new Promise((resolve, reject) => {

        if (headers['Content-Type'] !== 'application/json'){
            reject('Content-Type must be application/json')
        }

        const expectedAuthorizationHeader = `Bearer ${VALID_ACCESS_TOKEN}`

        if (headers.Authorization !== expectedAuthorizationHeader){
            const error: HttpError = {
                code: 401, 
                reason_phrase: 'Unauthorized', 
                message: 'bad status code'
            }
            reject(error)
        }
    
        // TODO: resolve
    })

}




describe('working with valid refresh_token', () => {

    it('should receice daily events', async () => {


        loadJsonAsyncMock.mockImplementation(async (args: LoadJsonArgs) => {

            const { url, ...requestParams } = args

            if (url === OFFICE365_CALENDAR_ENDPOINT) 
                return mockCalendarEndpoint(requestParams)



            return new Promise((resolve, reject) => {
                global.log('this is called')
                reject('wrong endpoint')
            })
        })

        const { getTodayEvents } = createOffice365Handler({
            refreshToken: VALID_REFRESH_TOKEN,
            onRefreshTokenChanged: (newToken: string) => { }
        })

        const events = await getTodayEvents()

        global.log('events', events)

    })

});

