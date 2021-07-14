import { createStore, Store } from "redux"
import { Actions, State } from "./types"

let store: Store<State, Actions>

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

    store = createStore(reducer)
}


export function useStore() {
    return store
}