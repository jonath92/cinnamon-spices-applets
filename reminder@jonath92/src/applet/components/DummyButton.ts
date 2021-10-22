const GObject = imports.gi.GObject;

// @ts-ignore
export const DummyButton = GObject.registerClass({
    GTypeName: 'Dummy'
}, class DummyButton extends imports.gi.St.Button {
    _init(params: any){
        // @ts-ignore
        super._init(params)

        this.label = 'iwas'

    }
}) 