import { createSimpleMenuItem } from "../../lib/SimpleMenuItem";

export function createUpdateStationsMenuItem(){
    return createSimpleMenuItem({
        initialText: 'Update Radio Stationlist', 
        onActivated: () => global.log('todo')
    }).actor

}