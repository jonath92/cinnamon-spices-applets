import { Actions } from "./types"

export const volumeChanged = (volume: number): Actions => {
    return {
        type: 'VOLUME_CHANGED',
        payload: volume
    }
}