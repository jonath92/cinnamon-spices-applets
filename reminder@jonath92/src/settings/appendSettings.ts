import { Office365Api } from "office365Api";
import { Account, loadSettingsFromFile, saveSettingsToFile } from "utils";

interface AccountWithAuthorizationCode extends Account {
    authCode: string 
} 

export async function addAccountToSettings(account: AccountWithAuthorizationCode) {
    const {authCode, ...otherAccProps} = account
    const settings = loadSettingsFromFile()

    const office365Api = new Office365Api({
        authorizatonCode: account.authCode
    })

    const refreshToken = await office365Api.getRefreshToken()

    settings.accounts?.push({...otherAccProps, refreshToken})

    saveSettingsToFile(settings)
}