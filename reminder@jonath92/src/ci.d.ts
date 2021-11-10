/// <reference path="/home/jonathan/Projekte/types-gjs/Atk-1.0.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/ByteArray.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/cairo-1.0.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/Caribou.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/CDesktopEnums.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/Clutter.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/Cvc.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/Gdk-2.0.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/GdkPixbuf-2.0.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/Gio-2.0.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/Glib-2.0.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/GObject-2.0.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/Meta.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/Pango-1.0.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/Soup.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/St.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/WebKit2.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/xlib-2.0.d.ts" />
/// <reference path="/home/jonathan/Projekte/types-gjs/UPowerGlib.d.ts" />

// import "@ci-types/cjs";
///// <reference path="/home/jonathan/Projekte/types-cjs/index.d.ts" />


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