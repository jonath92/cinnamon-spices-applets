declare global {
    interface String {
        replaceAll(substr: string, replacement: string): string
    }
}

export function polyfill() {

    // included in LM 20.2 (cinnamon 5.0.4) but not in LM 20.0 (20.1 not tested)
    if (!String.prototype.hasOwnProperty('replaceAll')) {
        String.prototype.replaceAll = function (search: string, replacement: string) {
            var target = this;
            return target.split(search).join(replacement);
        };
    }
}