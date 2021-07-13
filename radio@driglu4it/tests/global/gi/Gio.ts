import * as fs from 'fs'
import { fchmod } from 'fs/promises'

export enum FileMonitorFlags {
    NONE = 0,
    WATCH_MOUNTS = 1,
    SEND_MOVED = 2,
    WATCH_HARD_LINKS = 4,
    WATCH_MOVES = 8
}

export enum FileCreateFlags {
    NONE = 0,
    PRIVATE = 1,
    REPLACE_DESTINATION = 2
}

export function file_new_for_path(path: string) {

    return new File(path, false)
}

export class File {

    #path: string

    // constructor not really existing in GJS
    constructor(path: string, createNewIfNotExist: boolean) {

        if (!fs.existsSync(path)) {
            if (createNewIfNotExist) {
                fs.openSync(path, 'a')
            } else {
                throw new Error(`path: ${path} doesn't exist`)
            }
        }

        this.#path = path
    }

    get_child(name: string) {
        return new File(`${this.#path}/${name}`, true)
    }

    static new_for_path(path: string) {
        return new File(path, false)
    }

}