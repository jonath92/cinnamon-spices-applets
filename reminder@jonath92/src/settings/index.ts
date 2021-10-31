const { Gtk } = imports.gi;
const Webkit2 = imports.gi.WebKit2;
const { Server, MemoryUse } = imports.gi.Soup
const { GtkWindow } = imports.gi.XApp
const { spawn_command_line_async } = imports.gi.GLib
import { stringify } from 'query-string'
import { createAddedAccountListRow } from './AddedAccountListRow';
import { createNewAccountListRow } from './CreateNewAccountListRow';

imports.gi.versions.Gtk = '3.0'

Gtk.init(null);

const innerMagin = 30

const queryParams = stringify({
    client_id: '9542590d-b6f8-4c09-8fb7-75ba7c2f8147',
    scope: "offline_access calendars.read",
    response_type: "code",
    redirect_uri: 'http://localhost:8080',
})

const loginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${queryParams}`;

const { Window, WindowType, Box, Orientation, Toolbar, ToolItem, Button, IconSize, StackSwitcher, MenuButton, Image, Menu, Align, MenuItem, SeparatorMenuItem, ScrolledWindow, PolicyType, Stack, Builder, ListBox, ListBoxRow, Label, StyleContext, ColorChooserDialog, Dialog } = Gtk

const { EventMask } = imports.gi.Gdk

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

    // log(`row activated, ${row}`)
    // const dialog = createAddAccountDialog()
    // dialog.show_all()
    // @ts-ignore
    //const colorChooserDialog = new ColorChooserDialog({title: 'Select a Color'})
    //colorChooserDialog.show_all()
    //@ts-ignore
})


mainBox.add(availableAccountList)


function createAddAccountDialog(){
    const dialog = new Dialog({
        title: 'Google Account', 
        default_width: 500, 
        default_height: 800
    })

    const dialogMainBox = new Box({
      orientation: Orientation.HORIZONTAL
    })

    dialogMainBox.add(new Button({
        label: 'Connect', 
    }))

    dialog.add_action_widget(dialogMainBox, 1)

    return dialog
}








const builder = new Builder()
builder.add_from_file('/home/jonathan/.local/share/cinnamon/applets/reminder@jonath92/settings-view.ui')
const main_box = builder.get_object('main_box')

log(main_box)


// const main_box = new Box({ orientation: Orientation.VERTICAL })
// @ts-ignore
window.add(mainBox)

// const toolbar = new Toolbar()
// toolbar.get_style_context().add_class("primary-toolbar")
// main_box.add(toolbar)

// const toolitem = new ToolItem()
// toolitem.set_expand(true)
// toolbar.add(toolitem)
// const toolbutton_box = new Box({ orientation: Orientation.HORIZONTAL })
// toolitem.add(toolbutton_box)

// const instance_button_box = new Box({ orientation: Orientation.HORIZONTAL })
// instance_button_box.get_style_context().add_class('linked')
// toolbutton_box.pack_start(instance_button_box, false, false, 0)

// const prev_button = Button.new_from_icon_name('go-previous-symbolic', IconSize.BUTTON)
// prev_button.set_tooltip_text("Previous instance")
// instance_button_box.add(prev_button)

// const next_button = Button.new_from_icon_name('go-next-symbolic', IconSize.BUTTON)
// next_button.set_tooltip_text('Next instance')
// instance_button_box.add(next_button)

// const stack_switcher = new StackSwitcher()
// toolbutton_box.set_center_widget(stack_switcher)

// const menu_button = new MenuButton()
// const image = Image.new_from_icon_name('open-menu-symbolic', IconSize.BUTTON)
// menu_button.add(image)
// menu_button.set_tooltip_text('More options')
// toolbutton_box.pack_end(menu_button, false, false, 0)

// const menu = new Menu()
// menu.set_halign(Align.END)

// const restore_option = new MenuItem({ label: 'Import from a file' })
// menu.append(restore_option)
// restore_option.connect('activate', () => log('todo'))
// restore_option.show()

// const backup_option = new MenuItem({ label: 'Export to a file' })
// menu.append(backup_option)
// backup_option.connect('activate', () => log('todo'))
// backup_option.show()

// const reset_option = new MenuItem({ label: 'Reset to defaults' })
// menu.append(restore_option)
// restore_option.connect('activate', () => log('todo'))
// restore_option.show()

// const seperator = new SeparatorMenuItem()
// menu.append(seperator)
// seperator.show()

// menu_button.set_popup(menu)
// const scw = new ScrolledWindow()
// scw.set_policy(PolicyType.NEVER, PolicyType.NEVER)
// main_box.pack_start(scw, true, true, 0)
// const instance_stack = new Stack()
// scw.add(instance_stack)





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

window.add(button)

window.show_all();

Gtk.main();


window.connect('destroy', () => {
    server.disconnect()
    Gtk.main_quit()
    log('window destroyed')
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