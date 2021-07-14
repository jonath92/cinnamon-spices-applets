import { Action } from "./types"

export const volumeChanged = (volume: number): Action => {
    return {
        type: 'VOLUME_CHANGED',
        payload: volume
    }
}