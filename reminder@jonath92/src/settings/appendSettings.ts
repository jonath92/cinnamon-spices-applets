// import { logInfo } from "Logger";
import { Office365Api } from "office365Api";
import { Account, loadSettingsFromFile, saveSettingsToFile } from "utils";

interface AccountWithAuthorizationCode extends Pick<Account, 'provider'> {
    authCode: string 
} 

export async function addAccountToSettings(account: AccountWithAuthorizationCode) {
    const {authCode, ...otherAccProps} = account
    const settings = loadSettingsFromFile()

    log('add Account to Settings called')


    const office365Api = new Office365Api({
        authorizatonCode: account.authCode
    })

    //const refreshToken = await office365Api.getRefreshToken()

    const mail = await office365Api.getMailAdress()

    settings.accounts?.push({
        ...otherAccProps, 
        refreshToken: 'sfsf', 
        mail
    })

    global.log(mail)

    saveSettingsToFile(settings)
}