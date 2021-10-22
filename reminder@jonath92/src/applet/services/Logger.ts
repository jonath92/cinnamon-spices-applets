import { APPLET_PATH } from "../consts";
// const { file_new_for_path } = imports.gi.Gio

// const DEBUG_FILE_EXIST = file_new_for_path(APPLET_PATH + './DEBUG').query_exists(null)

const LOG_PREFIX = `[${__meta.uuid}]:`


export function debug() {

}

export function logInfo(...obj: Array<any>){
    
    const args = Array.from(arguments).map(arg => {
        return JSON.stringify(arg,  null, '\t')
    })

    global.log(LOG_PREFIX, ...args)
}