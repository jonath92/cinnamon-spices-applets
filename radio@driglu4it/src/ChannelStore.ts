import { createMpvHandler } from 'mpv/MpvHandler'
import { Channel } from './types'

export class ChannelStore {
    private _channelList: Channel[]
    private _mpvPlayer: ReturnType<typeof createMpvHandler>

    constructor(channelList: Channel[], mpvPlayer: ReturnType<typeof createMpvHandler>) {
        this._channelList = channelList
        this._mpvPlayer = mpvPlayer
    }

    public set channelList(channelList: Channel[]) {

        this._channelList = channelList.flatMap(channel => {
            return channel.inc ? { ...channel, url: channel.url.trim() } : []
        })

    }

    public get activatedChannelUrls() {
        return this._channelList.map(channel => channel.url)
    }


    public get activatedChannelNames() {
        return this._channelList.map(channel => channel.name)
    }

    public getcurrentChannel(): Channel | undefined {
        const currentURl = this._mpvPlayer.getCurrentUrl()

        return currentURl ? this._channelList.find(cnl => cnl.url === currentURl): undefined
    }


    // TODO: what is when two Channels have the same Name or Url? :O
    public getChannelName(channelUrl: string | null) {

        if (!channelUrl) return undefined

        const channel = this._channelList.find(cnl => cnl.url === channelUrl)
        
        return channel ? channel.name : undefined
    }

    public getChannelUrl(channelName: string) {
        const channel = this._channelList.find(cnl => cnl.name === channelName)
        return channel ? channel.url : null
    }

    public checkListChanged(channelList: Channel[]) {
        return JSON.stringify(channelList) === JSON.stringify(this._channelList) ?
            false : true
    }

    public checkUrlValid(channelUrl: string | null) {

        if (!channelUrl) return false

        return this._channelList.some(cnl => cnl.url === channelUrl)
    }

}