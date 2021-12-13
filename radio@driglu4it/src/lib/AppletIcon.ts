const { panelManager } = imports.ui.main
const { getAppletDefinition } = imports.ui.appletManager;
const { Icon, IconType } = imports.gi.St


interface Props {
    iconType: imports.gi.St.IconType
}

export function createAppletIcon(props: Props){

    let {
        iconType
    } = props

    const appletDefinition = getAppletDefinition({
        applet_id: __meta.instanceId,
    })

    const panel = panelManager.panels.find(panel =>
        panel?.panelId === appletDefinition.panelId
    ) as imports.ui.panel.Panel

    const locationLabel = appletDefinition.location_label

    function getIconSize(){
        return panel.getPanelZoneIconSize(locationLabel, iconType)
    }

    function getStyleClass(){
        return iconType === IconType.SYMBOLIC ? 'system-status-icon' : 'applet-icon'
    }

    const icon = new Icon({
        icon_type: iconType, 
        style_class: getStyleClass(), 
        icon_size: getIconSize()
    })

    panel.connect('icon-size-changed', () => {
        icon.set_icon_size(getIconSize())
    })


    return {
        actor: icon, 
        setIconType: (newType: imports.gi.St.IconType) => {
            iconType = newType
            icon.style_class = getStyleClass()
        }
    }

}