import { Actions } from "./types"

export const volumeChanged = (volume: number): Actions => {
    return {
        type: 'CHANGE_VOLUME',
        payload: volume
    }
}