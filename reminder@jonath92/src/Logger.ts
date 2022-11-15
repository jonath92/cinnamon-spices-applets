import { APPLET_PATH } from "./consts";


const LOG_FILE_PATH = `${APPLET_PATH}/log`

const { new_for_path } = imports.gi.Gio.File

const logFile = new_for_path(LOG_FILE_PATH)
const { FileCreateFlags, Subprocess, SubprocessFlags } = imports.gi.Gio
const { Bytes, PRIORITY_DEFAULT } = imports.gi.GLib

// const DEBUG_FILE_EXIST = file_new_for_path(APPLET_PATH + './DEBUG').query_exists(null)

// @ts-ignore
const LOG_PREFIX = `[${META.uuid}]:`

// This is the process that we'll be running
const script = `
echo "BEGIN";

while read line; do
  echo "$line" >> /home/jonathan/Tmp/logger ;
  sleep 1;
done;
`;

// This function simply writes the current time to `stdin`
// based on https://gjs.guide/guides/gio/subprocesses.html
function writeInput(stdin: imports.gi.Gio.OutputStream, value: string) {
    let date = new Date().toLocaleString();

    stdin.write_bytes_async(
        new Bytes(`${value}\n`),
        PRIORITY_DEFAULT,
        null,
        (stdin, res) => {
            try {
                // @ts-ignore
                stdin.write_bytes_finish(res);
                log(`WROTE: ${value}`)
            } catch (e) {
                // @ts-ignore
                logError(e);
            }
        }
    );
}

let stdinStream: imports.gi.Gio.OutputStream | undefined

try {

    log('inside try block')
    // @ts-ignore
    const proc = Subprocess.new(
        ['bash', '-c', script],
        (SubprocessFlags.STDIN_PIPE | SubprocessFlags.STDOUT_PIPE)
    );

    // Watch for the process to exit, like normal
    // @ts-ignore
    proc.wait_async(null, (proc, res) => {
        try {
            // @ts-ignore
            proc.wait_finish(res);
        } catch (e) {
            // @ts-ignore TODO: add logError to gnome js types
            logError(e);
        } 
        // TODO: kill processes on stop somehow. proc.force_exit() (necessary??. Can probably checked with getting get_identifier and than check if the id still exist after programm terminated)
    });

        // Get the `stdin`and `stdout` pipes, wrapping `stdout` to make it easier to
    // read lines of text
    // @ts-ignore
    stdinStream = proc.get_stdin_pipe();


} catch (error) {

}


export function debug() {

}

export function logInfo(message: string) {
    // if (!logFile.query_exists(null)){
    //     // @ts-ignore
    //     logFile.create(FileCreateFlags.REPLACE_DESTINATION, null)
    // }

    if (!stdinStream){
        log('Something went wrong. StdInStream not defined.')
        return
    }

    writeInput(stdinStream, message)

    //stream.

    // const args = Array.from(arguments).map(arg => {
    //     return JSON.stringify(arg,  null, '\t')
    // })

}