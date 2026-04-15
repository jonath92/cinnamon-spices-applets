import { spawnCommandLinePromise } from "../../functions/promiseHelpers";
import { notify } from "../../lib/notify";
const { find_program_in_path } = imports.gi.GLib;


export async function installMpvWithMpris() {
    if (!checkMpvInstalled()) {
        notify('Please install mpv: sudo apt install mpv')
        await installMpvInteractive()
    }
}

function checkMpvInstalled() {
    return find_program_in_path('mpv')
}

function installMpvInteractive() {
    return new Promise<void>(async (resolve, reject) => {

        if (checkMpvInstalled()) return resolve()

        if (!find_program_in_path("apturl")) return reject()

        const [stderr, stdout, exitCode] = await spawnCommandLinePromise(`
            apturl apt://mpv`
        )

        // exitCode 0 means sucessfully. See: man apturl
        return (exitCode === 0) ? resolve() : reject(stderr)
    })
}

