import { isEqual } from 'lodash'
import { Channel } from './types'

export class ChannelStore {
    private _channelList: Channel[]

    constructor(channelList: Channel[]) {
        this.channelList = channelList

    }

    public set channelList(channelList: Channel[]) {

        this._channelList = channelList

    }

    public get activatedChannelUrls() {
        return this._channelList.map(channel => channel.url)
    }


    public getChannelUrl(channelName: string) {
        const channel = this._channelList.find(cnl => cnl.name === channelName)
        return channel ? channel.url : null
    }

    public checkListChanged(channelList: Channel[]) {

        return !isEqual(channelList, this._channelList)
    }

    public checkUrlValid(channelUrl: string) {
        return this._channelList.some(cnl => cnl.url === channelUrl)
    }

}