interface Arguments {
    /** code received from the Login. Only one of authorizationCode and refreshToken needs to be passed */
    authorizatonCode?: string,
    /** required when no authorizatonCode passed */
    refreshToken?: string, 
    /** called when RefreshToken changed. Should be a function which saves the token to a file*/
    onRefreshTokenChanged: (newToken: string) => void
}

export function createOffice365Handler(args: Arguments) {

    

}