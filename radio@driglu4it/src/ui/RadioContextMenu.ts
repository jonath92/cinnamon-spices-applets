import { createPopupMenu, PopupMenuArguments } from "../lib/PopupMenu";
import { createSimpleMenuItem, SimpleMenuItemArguments } from "../lib/SimpleMenuItem";

const { spawnCommandLine, spawnCommandLineAsyncIO } = imports.misc.util

export function createRadioContextMenu(args: PopupMenuArguments) {

    const contextMenu = createPopupMenu(args)


    const spawnCommandLineWithErrorLogging = (command: string) => {
        spawnCommandLineAsyncIO(command, (stdout, stderr) => {
            if (stderr) {
                global.logError(`Failed executing: ${command}. The following error occured: ${stderr}`)
            }
        })
    }

    const menuArgs: SimpleMenuItemArguments[] = [
        {
            iconName: 'dialog-question',
            text: 'About...',
            onActivated: () => {
                spawnCommandLineWithErrorLogging(`xlet-about-dialog applets ${__meta.uuid}`)
            }
        },
        {
            iconName: 'system-run',
            text: 'Configure...',
            onActivated: () => {
                spawnCommandLineWithErrorLogging(`xlet-settings applet ${__meta.uuid} ${__meta.instanceId} -t 0`)
            }
        }, {
            iconName: 'edit-delete',
            text: `Remove '${__meta.name}`,
            onActivated: () => global.log('todo')
        }
    ]

    menuArgs.forEach((menuArg) => {
        const menuItem = createSimpleMenuItem({
            ...menuArg, onActivated: (self) => {
                contextMenu.close()
                menuArg.onActivated && menuArg?.onActivated(self)
            }
        })
        contextMenu.add_child(menuItem.actor)
    })

    return contextMenu
}