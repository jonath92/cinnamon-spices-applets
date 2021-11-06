const {reminderApplet} = require('./reminder-applet');
    
function main(metadata, orientation, panel_height, instance_id) {
    
    return new reminderApplet.main({
        orientation,
        panelHeight: panel_height,
        instanceId: instance_id
    });
}