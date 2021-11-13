const { new_for_path } = imports.gi.Gio.File
import { CONFIG_DIR } from './consts'

const SETTINGS_PATH = CONFIG_DIR + '/settings.json'
const ByteArray = imports.byteArray
export const settingsFile = new_for_path(SETTINGS_PATH)
const { FileCreateFlags, Cancellable, SubprocessFlags, Subprocess, IOErrorEnum, io_error_from_errno } = imports.gi.Gio
const { strerror } = imports.gi.GLib

export interface Account {
    mail: string,
    authCode?: string,
    refreshToken?: string,
    provider: 'Office365' | 'google' // to expand .. . 
}

export interface Settings {
    accounts: Account[]
}

export function loadSettingsFromFile(): Settings {

    let settings: Settings = { accounts: [] }

    try {
        const [success, contents] = settingsFile.load_contents(null)
        settings = JSON.parse(contents)
        // TODO: validate settings
    } catch (error) {
        // TODO: important. THIS WON'T WORK when caleld from a settings Widget!! 
        // global.logWarning(`couldn't load settings file. The following error occured: ${JSON.stringify(error)}`)
    }

    return settings
}


export function saveSettingsToFile(settings: Settings) {

    log(`query exists: ${settingsFile.query_exists(null)}`)

    if (!settingsFile.query_exists(null)) {
        log('this is called')
        // @ts-ignore
        settingsFile.create(FileCreateFlags.REPLACE_DESTINATION, null)
    }
    try {
        settingsFile.replace_contents(
            JSON.stringify(settings, null, 3),
            null,
            false,
            FileCreateFlags.REPLACE_DESTINATION,
            null
        )
    } catch (error) {
        // TODO: important. THIS WON'T WORK when caleld from a settings Widget!! 
        // global.logWarning(`couldn't save new Settings. The following error occured: ${JSON.stringify(error)}`)
    }
}


/**
 * Execute a command asynchronously and return the output from `stdout` on
 * success or throw an error with output from `stderr` on failure.
 *
 * If given, @input will be passed to `stdin` and @cancellable can be used to
 * stop the process before it finishes.
 *
 * @param {string[]} argv - a list of string arguments
 * @param {string} [input] - Input to write to `stdin` or %null to ignore
 * @param {Gio.Cancellable} [cancellable] - optional cancellable object
 * @returns {Promise<string>} - The process output
 */
async function execCommunicate(argv: string[], input: string | null = null, cancellable: imports.gi.Gio.Cancellable | null = null) {
    let cancelId = 0;
    let flags = (SubprocessFlags.STDOUT_PIPE |
        SubprocessFlags.STDERR_PIPE);

    if (input !== null)
        flags |= SubprocessFlags.STDIN_PIPE;

    // @ts-ignore
    let proc = new Subprocess({
        argv: argv,
        flags: flags
    });
    proc.init(cancellable);

    if (cancellable instanceof Cancellable) {
        // @ts-ignore
        cancelId = cancellable.connect(() => proc.force_exit());
    }

    return new Promise((resolve, reject) => {
        // @ts-ignore
        proc.communicate_utf8_async(input, null, (proc, res) => {
            try {
                // @ts-ignore
                let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                // @ts-ignore
                let status = proc.get_exit_status();

                if (status !== 0) {
                    // @ts-ignore
                    throw new IOErrorEnum({
                        code: io_error_from_errno(status),
                        message: stderr ? stderr.trim() : strerror(status)
                    });
                }

                resolve(stdout.trim());
            } catch (e) {
                reject(e);
            } finally {
                if (cancelId > 0) {
                    // @ts-ignore
                    cancellable.disconnect(cancelId);
                }
            }
        });
    });
}