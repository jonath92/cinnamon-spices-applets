import * as fs from 'fs'

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

export enum FileMonitorEvent {
    CHANGED = 0,
    CHANGES_DONE_HINT = 1,
    DELETED = 2,
    CREATED = 3,
    ATTRIBUTE_CHANGED = 4,
    PRE_UNMOUNT = 5,
    UNMOUNTED = 6,
    MOVED = 7,
    RENAMED = 8,
    MOVED_IN = 9,
    MOVED_OUT = 10
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