import { createStore, Store } from "redux"
import { Action, State } from "./types"

let store: Store<State, Action>

export function createAppletStore() {

    const reducer = (state: State, action: Action): State => {

        switch (action.type) {
            case 'VOLUME_CHANGED':
                return {
                    ...state,
                    mpv: {
                        ...state.mpv,
                        volume: action.payload
                    }
                }
            case 'SONG_TITLE_CHANGED':
                return {
                    ...state,
                    mpv: {
                        ...state.mpv,
                        song_title: action.payload
                    }
                }
            default:
                // TODO: not logging when action starts with @@redux
                global.logWarning('unhandled action type')
                return { ...state }
        }
    }

    store = createStore(reducer)
}


export function useStore() {
    return store
}