import "@ci-types/cjs";

interface Meta {
    uuid: string, 
    path: string    
}

declare const META: Meta

// TOOD: this should be handled in another repo
declare function log(arg: any): void
declare function print(arg: any): void

declare namespace imports.gi.versions {
    let Clutter: string
    let Gio: string
    let Gdk: string
    let GdkPixbuf: string
    let Gtk: string
}

// Arguments passed to script
declare const ARGV: string