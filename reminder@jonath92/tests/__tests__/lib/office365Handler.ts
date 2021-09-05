
const Message = {
    new: function (method: string, query: string) {

    }
}

jest.mock('services/Logger', () => {
    logInfo: () => {

    }
})

class SessionAsync {
    constructor() { }
}

imports.gi.Soup = {
    // @ts-ignore
    Message,
    // @ts-ignore
    SessionAsync
}



import { createOffice365Handler } from 'lib/office365Handler'

const VALID_REFRESH_TOKEN = '89372987298'

describe('working with valid refresh_token', () => {

    it('should receice daily events', async () => {
        const { getTodayEvents } = createOffice365Handler({
            refreshToken: VALID_REFRESH_TOKEN,
            onRefreshTokenChanged: (newToken: string) => { }
        })

        const events = await getTodayEvents()

    })

});

