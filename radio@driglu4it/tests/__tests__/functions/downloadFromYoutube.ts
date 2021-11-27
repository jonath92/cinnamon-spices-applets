// the arguments used in the command, e.g in:  'youtube-dl --output /some/dir' the substrings 'youtube-dl' and 'output' are considered as arg and '/some/dir' as value   
interface YoutbeDlArguments {
    arg: string,
    value?: string
}

type InstallationStatus = OnDownloadFailedArgs['reason'] | 'correct installed'
let installationStatus: InstallationStatus = 'not Installed'
const MOCKED_DOWNLOAD_TIME = 1 // in ms

let youtubeDlOptions: YoutbeDlArguments[] = []


// TODO: make mock for test the path of youtube-dl file

function spawnCommandLineAsyncIO(command: string, cb: (stdout: string, stderr: string, exitCode: number) =>
    void) {

    const subStrings = createSubstrings()

    subStrings.forEach((subString, index) => {

        const isCommandOption = subString.startsWith('--') || !subStrings[index - 1]?.startsWith('--')

        if (isCommandOption) {

            let option: YoutbeDlArguments = { arg: subString }
            let potentialCommandValue = subStrings[index + 1]
            const commandHasValue = !potentialCommandValue?.startsWith('--') && potentialCommandValue

            if (commandHasValue)
                option.value = potentialCommandValue

            youtubeDlOptions.push(option)
        }
    })

    if (youtubeDlOptions[0].arg !== 'youtube-dl')
        throw new RangeError('spawnCommandLineAsyncIo not called with youtube-dl')

    const timer = setTimeout(() => {
        installationStatus === 'correct installed' && cb(workingExample.stdOut, null, 0)
        installationStatus === 'not Installed' && cb(null, 'line 1: youtube-dl: command not found', 127)
        // this error occured for me on apt but might also be different...
        // The following error occured at youtube download attempt: Error: ERROR: Error in output template: unsupported format character 'D' (0x44) at index 20 (encoding: 'UTF-8')
        installationStatus === 'not installed by official instruction' && cb(null, Math.random().toString(36).substr(2, 5), 1)
    }, MOCKED_DOWNLOAD_TIME);

    return {
        force_exit: () => {
            clearTimeout(timer)
            cb(null, null, 1)
        }
    }

    function createSubstrings() {
        let spaceIndex = -1
        let isInsideDoubleQuote = false
        const subStrings: string[] = [];
        const chars = [...command]

        chars.forEach((char, index) => {

            if (char === " " && !isInsideDoubleQuote || index + 1 === chars.length) {
                subStrings.push(command.substring(spaceIndex + 1, index + 1).trim())
                spaceIndex = index
            }

            if (char === "\"" && command[index - 1] !== "\\") {
                isInsideDoubleQuote = !isInsideDoubleQuote
            }
        })

        return subStrings
    }
}

imports.misc.util = {
    // @ts-ignore
    spawnCommandLineAsyncIO
}

import { initPolyfills } from 'polyfill';
import { downloadSongFromYoutube } from "functions/downloadFromYoutube";

// replaceAll not working in node 14.17.3
initPolyfills()

const workingExample = {
    title: 'Lady Gaga - Stupid Love',
    downloadDir: '/home/jonathan/Music/Radio',
    stdOut: `[download] Downloading playlist: Lady Gaga - Stupid Love
    [youtube: search]query "Lady Gaga - Stupid Love": Downloading page 1
    [youtube: search]playlist Lady Gaga - Stupid Love: Downloading 1 videos
    [download] Downloading video 1 of 1
    [youtube] 5L6xyaeiV58: Downloading webpage
    [youtube] 5L6xyaeiV58: Downloading thumbnail ...
    [youtube] 5L6xyaeiV58: Writing thumbnail to: /home/jonathan/Music/Radio/Lady Gaga - Stupid Love (Official Music Video).jpg
    [download] Destination: /home/jonathan/Music/Radio/Lady Gaga - Stupid Love (Official Music Video).webm
    \u000d[download]   0.0 % of 3.36MiB at 20.21KiB / s ETA 02: 50\u000d[download]   0.1 % of 3.36MiB at 60.37KiB / s ETA 00: 56\u000d[download]   0.2 % of 3.36MiB at 140.34KiB / s ETA 00: 24\u000d[download]   0.4 % of 3.36MiB at 299.62KiB / s ETA 00: 11\u000d[download]   0.9 % of 3.36MiB at 433.91KiB / s ETA 00: 07\u000d[download]   1.8 % of 3.36MiB at 286.46KiB / s ETA 00: 11\u000d[download]   3.7 % of 3.36MiB at 529.41KiB / s ETA 00: 06\u000d[download]   7.4 % of 3.36MiB at 897.32KiB / s ETA 00: 03\u000d[download]  14.9 % of 3.36MiB at  1.32MiB / s ETA 00: 02\u000d[download]  29.7 % of 3.36MiB at  1.89MiB / s ETA 00: 01\u000d[download]  59.5 % of 3.36MiB at  2.38MiB / s ETA 00: 00\u000d[download] 100.0 % of 3.36MiB at  2.66MiB / s ETA 00: 00\u000d[download] 100 % of 3.36MiB in 00: 01
    [ffmpeg] Destination: /home/jonathan/Music/Radio/Lady Gaga - Stupid Love (Official Music Video).mp3
    Deleting original file /home/jonathan/Music/Radio/Lady Gaga - Stupid Love (Official Music Video).webm(pass - k to keep)
    [ffmpeg] Adding metadata to '/home/jonathan/Music/Radio/Lady Gaga - Stupid Love (Official Music Video).mp3'
    [ffmpeg] Adding thumbnail to "/home/jonathan/Music/Radio/Lady Gaga - Stupid Love (Official Music Video).mp3"
    [download] Finished downloading playlist: Lady Gaga - Stupid Love`,
    filePath: '/home/jonathan/Music/Radio/Lady Gaga - Stupid Love (Official Music Video).mp3'
}

// https://dev.to/spacesnaill/react-and-typescript-testing-mocking-functions-with-jest-1pn8
type DownloadFromYoutubeArgs = Parameters<typeof downloadSongFromYoutube>[0]
type OnDownloadFailed = DownloadFromYoutubeArgs['onDownloadFailed']
type OnDownloadFailedArgs = Parameters<OnDownloadFailed>[0]

const onDownloadFailed = jest.fn(() => { })
const onDownloadFinished = jest.fn(() => { })

function downloadWithValidValues() {
    return downloadSongFromYoutube({
        title: workingExample.title,
        downloadDir: workingExample.downloadDir,
        onDownloadFinished,
        onDownloadFailed
    })
}

afterEach(() => {
    jest.clearAllMocks()
    installationStatus = 'not Installed'
    youtubeDlOptions = []
})

it('sucessful download handled correctly', done => {

    installationStatus = 'correct installed'

    downloadWithValidValues()

    setTimeout(() => {
        expect(onDownloadFinished).toHaveBeenCalledWith(workingExample.filePath)
        done()
    }, MOCKED_DOWNLOAD_TIME);

})

describe('youtubeDl called with correct values', () => {

    it('youtubeDl called with correct arguments', done => {
        installationStatus = 'correct installed'

        downloadWithValidValues()

        setTimeout(() => {

            ['--extract-audio', '--add-metadata', '--embed-thumbnail'].forEach(command => {
                expect(youtubeDlOptions.find(option => option.arg === command)).toBeTruthy()
            })

            const audioFormat = youtubeDlOptions.find(option => option.arg === '--audio-format').value
            expect(audioFormat).toBe('mp3')
            done()
        }, MOCKED_DOWNLOAD_TIME);

    })

    it('double quotes are correctly escaped', () => {
        installationStatus = 'correct installed'

        const title = `"Good 4 U" von Olivia Rodrigo`

        downloadSongFromYoutube({
            title: `"Good 4 U" von Olivia Rodrigo`,
            downloadDir: workingExample.downloadDir,
            onDownloadFinished,
            onDownloadFailed
        })

        const searchPrefix = 'ytsearch1:'

        const searchTerm = youtubeDlOptions.find(
            option => option.arg.startsWith(searchPrefix)
        ).arg.split(searchPrefix)[1].substr(1).slice(0, -1)

        expect(title.replaceAll('"', '\\"')).toBe(searchTerm)

    })

})

xdescribe('error handling working', () => {
    it('error callback called correctly when youtube-dl not installed', done => {

        downloadWithValidValues()

        const expectedArguments: Partial<OnDownloadFailedArgs> = {
            reason: 'not Installed',
        }

        setTimeout(() => {
            expect(onDownloadFailed).toHaveBeenCalledWith(
                expect.objectContaining(expectedArguments)
            )
            done()
        }, MOCKED_DOWNLOAD_TIME);

    })


    // TODO other error states

})




xdescribe('canceling download is working', () => {
    it('no callback executed when canceling download', () => {
        const downloadProcess = downloadWithValidValues()
        downloadProcess.cancel()
        expect(onDownloadFailed).not.toHaveBeenCalledWith()
    })

    it('canceling download has no impact for next download attempt', done => {
        const downloadProcess = downloadWithValidValues()
        downloadProcess.cancel()

        downloadWithValidValues()

        setTimeout(() => {
            expect(onDownloadFailed).toHaveBeenCalledWith()
            installationStatus = 'correct installed'

            downloadWithValidValues()
            setTimeout(() => {
                expect(onDownloadFinished).toHaveBeenCalledWith(workingExample.filePath)
                done()
            }, MOCKED_DOWNLOAD_TIME);

        }, MOCKED_DOWNLOAD_TIME);
    })
})

