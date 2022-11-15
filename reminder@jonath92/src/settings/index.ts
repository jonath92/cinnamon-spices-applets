const { Gtk } = imports.gi;
const { Server, MemoryUse } = imports.gi.Soup
const { GtkWindow } = imports.gi.XApp
const { spawn_command_line_async } = imports.gi.GLib
import { OFFICE365_CLIENT_ID } from 'consts';
// import { logInfo } from 'Logger';
import { stringify } from 'query-string'
import { createAddedAccountListRow } from './AddedAccountListRow';
import { addAccountToSettings } from './appendSettings';
import { createNewAccountListRow } from './CreateNewAccountListRow';

// TODO: this should throw an error!
// import {getState} from '../applet/Store'

// @ts-ignore
imports.gi.versions.Gtk = '3.0'

// @ts-ignore
Gtk.init(null);

const innerMagin = 30

const queryParams = stringify({
    client_id: OFFICE365_CLIENT_ID,
    scope: "offline_access calendars.read",
    response_type: "code",
    redirect_uri: 'http://localhost:8080',
})

const loginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${queryParams}`;

log(loginUrl)

const { Box, Orientation, Align, ListBox, Label } = Gtk


// TODO: find free ports first
const server = new Server({ port: 8080 })
startServer()

// @ts-ignore
log(ARGV)

log('test from settings2')


const window = new GtkWindow({
    default_width: 800,
    default_height: 600,
    icon_name: 'view-calendar',
    title: 'Calendar Applet'
})

const mainBox = new Box({
    visible: true,
    can_focus: true,
    border_width: 12,
    orientation: Orientation.VERTICAL,
    margin_top: innerMagin,
    margin_bottom: innerMagin,
    margin_end: innerMagin,
    margin_start: innerMagin,
    spacing: innerMagin
})

const addedAccountsList = new ListBox()

const addedGoogleAccount = createAddedAccountListRow()
addedAccountsList.add(addedGoogleAccount)

mainBox.add(addedAccountsList)


const addAcountLabel = new Label({
    use_markup: true,
    label: '<b>Add an account</b>',
    halign: Align.START
})

mainBox.add(addAcountLabel)

const availableAccountList = new ListBox()

availableAccountList.add(createNewAccountListRow())

availableAccountList.connect('row-activated', (actor: any, row: any) => {
    spawn_command_line_async(`xdg-open ${loginUrl}`)
})


mainBox.add(availableAccountList)
window.add(mainBox)
window.show_all();

Gtk.main();

window.connect('destroy', () => {
    server.disconnect()
    Gtk.main_quit()
    log('window destroyed')
})

function startServer() {

    // server.connect('request-finished', (serv, message: imports.gi.Soup.Message, client) => {
    //     server.disconnect()
    // })

    // server.add_handler(null, (server, msg, path, query) => {

    //     msg.set_response(
    //         'text/html',
    //         MemoryUse.COPY,
    //         `<!DOCTYPE html>
    //             <html lang="en">
    //             <head>
    //                 <meta charset="UTF-8">
    //                 <meta http-equiv="X-UA-Compatible" content="IE=edge">
    //                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //                 <title>Document</title>
    //             </head>
    //             <body>
    //                 <h2>Logged in sucessfully. You may now close the tab<h2/>
    //             </body>
    //             </html>`
    //     )


    //     // @ts-ignore
    //     const code: string = query.code

    //     if (!code)
    //         return

    //     log(code)

        addAccountToSettings({
            provider: 'Office365', 
            authCode: '0.AUgACo10sm6FhEG9qIMfn_qKSHC6OiWTM6lAks4SlpBdJfoQAFg.AgABAAIAAAD--DLA3VO7QrddgJg7WevrAgDs_wQA9P-zSm_BQe8pLekHSovbe26KYWHtvwkcPqdpE2idVNjKClIs2NdfohxaK-PV7bV6RZxAw4bDPfV5LfVyqDzVwAAS73T5ktwRQ647qnE0iWqajSsWGruG2gbpicarE4JTdZeUpdCvetiMiLC3WDfTotm2Vi0YZKjH1D4s6csZtUydKQyRl6u4gmd2u3A7ouNGNS8ZEmKpry74O17nXO8RE5GcNnLRxNOi7q0rKmB5xIQJNxvSEZSjTavZLTq9K17sCW6by6O4FWFrHazU3pD9L36GoHtxg_YM-lkqVPU5WDxH1EFRbTKNr9ILaDCwXD38rEam43ByAwP8InAbyL8EUEpXjXXWqkg70bVLgcxALQpgh2wk-HMpMG6scbPSpc15GliKrYehCyG59gfmFmT1t42Wf8EyfjAgpGzhoqqcMNAzmQvju1smb8urtD4njsTHAfHbXjJLo1hBRFXnZYf2ZlP25i8aGkKUOrjfr46s6R3G8UUImqXZZ2H0DwVOLx6hZedB3mJRylsb2sGqDVobsjMXQyl-dSuxVdNDQfrQipx7Wmpt-jXLZpao457i0AQqMNzqH_FvXUUrG54xq6NfRAbHxELF6s3gIF5almJM-CiLw56yYGIdKNWFQnJgnCuSRyF9esGYbLf6G6n5wHGhSM4n7KzD8g0zrNgQWZ5UbOl-NwBbRRKTvGZg2WiR3-JKNPy4GjJ7c0hbFEL3mDar3a8w-AaLRZgYcyAuXWRz_31yac0p1JLDlszLeJBy6oey989ZoahdEONYlqXg'
        })

        // // @ts-ignore
        // log(query.code)



}