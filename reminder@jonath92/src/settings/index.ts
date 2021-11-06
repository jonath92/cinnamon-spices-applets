const { Gtk } = imports.gi;
const Webkit2 = imports.gi.WebKit2;
const { Server, MemoryUse } = imports.gi.Soup
const { GtkWindow } = imports.gi.XApp
const { spawn_command_line_async } = imports.gi.GLib
import { OFFICE365_CLIENT_ID } from 'consts';
import { stringify } from 'query-string'
import { createAddedAccountListRow } from './AddedAccountListRow';
import { addAccountToSettings } from './appendSettings';
import { createNewAccountListRow } from './CreateNewAccountListRow';

imports.gi.versions.Gtk = '3.0'

Gtk.init(null);

const innerMagin = 30

const queryParams = stringify({
    client_id: OFFICE365_CLIENT_ID,
    scope: "offline_access calendars.read",
    response_type: "code",
    redirect_uri: 'http://localhost:8080',
})

const loginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${queryParams}`;

const { Box, Orientation, Align, ListBox, Label } = Gtk


// TODO: find free ports first
const server = new Server({ port: 8080 })
startServer()

log(ARGV)


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

    server.connect('request-finished', (serv, message: imports.gi.Soup.Message, client) => {
        server.disconnect()
    })

    server.add_handler(null, (server, msg, path, query) => {

        msg.set_response(
            'text/html',
            MemoryUse.COPY,
            `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                </head>
                <body>
                    <h2>Logged in sucessfully. You may now close the tab<h2/>
                </body>
                </html>`
        )


        // @ts-ignore
        const code: string = query.code

        if (!code)
            return

        addAccountToSettings({
            mail: 'dummy3',
            provider: 'Office365', 
            authCode: code
        })

        // @ts-ignore
        log(query.code)



    })


    server.run_async()

}