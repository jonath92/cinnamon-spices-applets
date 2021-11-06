import { Account, loadSettingsFromFile, saveSettingsToFile } from "utils";


export function addAccountToSettings(account: Account) {
    const settings = loadSettingsFromFile()

    const dummy = settings.accounts?.push(account)

    log(`dummy, ${JSON.stringify(dummy)}`)
    log


    saveSettingsToFile(settings)

}