const { Gtk } = imports.gi;
const Webkit2 = imports.gi.WebKit2;
const { Server, MemoryUse } = imports.gi.Soup
const { GtkWindow } = imports.gi.XApp
const { spawn_command_line_async } = imports.gi.GLib
import { stringify } from 'query-string'


Gtk.init(null);

const queryParams = stringify({
    client_id: '877b72ef-232d-424d-87c7-5b6636497a98',
    scope: "offline_access files.readwrite.all sites.readwrite.all",
    response_type: "code",
    redirect_uri: 'http://localhost:8080',
})

const loginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${queryParams}`;

const { Window, WindowType, Box, Orientation, Toolbar } = Gtk
// TODO: find free ports first
const server = new Server({ port: 8080 })

startServer()

const win = new GtkWindow()
win.set_default_size(800, 600)
// const mainBox = new Box({ orientation: Orientation.VERTICAL })
// win.add(mainBox)

// const toolbar = new Toolbar()
// toolbar.get_style_context().add_class("primary-toolbar")
// mainBox.add(toolbar)

const label = new Gtk.Label({
    label: 'dummy'
})

//@ts-ignore
const button = new Gtk.Button({
    label: 'Login'
})

button.connect('clicked', () => {
    // @ts-ignore
    log(imports.gi.XApp)
    // spawn_command_line_async(`xdg-open ${loginUrl}`)
    // log('button clicked')
})

win.add(button)

win.show_all();

Gtk.main();

win.connect('delete-event', () => {
    log('delete event')
})

win.connect('destroy', () => {
    server.disconnect()
    Gtk.main_quit()
    log('window destroyed')
})

win.connect('realize', () => {
    log('realize called')
})

win.connect('event', () => {
    log('any event')
})

win.connect('remove', () => {
    log('win removed')
})

function startServer() {


    server.connect('request-finished', (serv, message: imports.gi.Soup.Message, client) => {
        log('request finished')

        server.disconnect()

    })

    server.add_handler(null, (server, msg, path, query) => {
        log(JSON.stringify(query))

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

    })


    server.run_async()

}