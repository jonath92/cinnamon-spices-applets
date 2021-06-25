import _ from 'lodash';
import numRef from './ref.json';

const Applet = imports.ui.applet;

export class MyApplet extends Applet.IconApplet {
    constructor(orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id)
        this.set_applet_icon_name("computer");
    }

    on_applet_clicked = function () {
        global.log(wordToNum('Two'))

    }
}


export function numToWord(num) {
    return _.reduce(
        numRef,
        (accum, ref) => {
            return ref.num === num ? ref.word : accum;
        },
        ''
    );
}

export function wordToNum(word) {
    return _.reduce(
        numRef,
        (accum, ref) => {
            return ref.word === word && word.toLowerCase() ? ref.num : accum;
        },
        -1
    );
}
