const { BoxLayout } = imports.gi.St

interface Arguments {
    onClick: () => void,
    onScroll: (scrollDirection: imports.gi.Clutter.ScrollDirection) => void,
    onMiddleClick: () => void,
    onRightClick: () => void,
}


export function createRadioAppletContainerNew(args: Arguments) {

    const { onClick, onMiddleClick, onRightClick, onScroll } = args

    const appletContainer = new BoxLayout({
        style_class: 'applet-box',
        reactive: true,
        track_hover: true
    })

    appletContainer.connect('button-press-event', (owner, event) => {

        const btnNumberCallback: Record<number, () => void> = {
            1: onClick,
            2: onMiddleClick,
            3: onRightClick
        }

        const btnNumber = event.get_button()
        btnNumberCallback[btnNumber]()

        return true
    })

    return appletContainer

}