import { createStore } from "redux"
import { Actions, State } from "./types"

export function createAppletStore() {

    const reducer = (state: State, action: Actions): State => {
        switch (action.type) {
            case 'CHANGE_VOLUME':
                return { ...state, volume: action.payload }
            case 'CHANGE_SONG_TITLE':
                return { ...state, song_title: action.payload }
            default:
                global.logWarning('unhandled action type')
                return state
        }
    }

    return createStore(reducer)

}