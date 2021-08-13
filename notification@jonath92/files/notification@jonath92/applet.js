const {notificationApplet} = require('./notification-applet');
    
function main(metadata, orientation, panel_height, instance_id) {
    return new notificationApplet.main({
        orientation,
        panelHeight: panel_height,
        instanceId: instance_id
    });
}