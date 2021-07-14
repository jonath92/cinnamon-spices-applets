export type PlayPause = "Playing" | "Paused"
export type PlaybackStatus = PlayPause | "Stopped"
export type AdvancedPlaybackStatus = PlaybackStatus | 'Loading'

export interface Channel {
    name: string,
    url: string,
    inc: boolean
}

export type IconType = 'SYMBOLIC' | 'FULLCOLOR' | 'BICOLOR'

export type Actions = {
    type: 'CHANGE_VOLUME',
    payload: number
} | {
    type: 'CHANGE_SONG_TITLE',
    payload: string
}

export interface State {
    volume: number,
    song_title: string
}
