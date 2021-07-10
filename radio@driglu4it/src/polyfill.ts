declare global {
    interface String {
        replaceAll(substr: string, replacement: string): string
    }

    // Comment copied from node_modules/typescript/lib/lib.es2019.array.d.ts
    interface Array<T> {
        /**
         * Calls a defined callback function on each element of an array. Then, flattens the result into
         * a new array.
         * This is identical to a map followed by flat with depth 1.
         *
         * @param callback A function that accepts up to three arguments. The flatMap method calls the
         * callback function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the callback function. If
         * thisArg is omitted, undefined is used as the this value.
        */
        flatMap<U, This = undefined>(
            callback: (this: This, value: T, index: number, array: T[]) => U | ReadonlyArray<U>,
            thisArg?: This
        ): U[]
    }
}

export function initPolyfills() {

    // included in LM 20.2 (cinnamon 5.0.4) but not in LM 20.0 (cinnamon 4.6.7). End of support is April 2025 (20.1 not tested)
    // Copied from https://stackoverflow.com/a/17606289/11603006
    if (!String.prototype.hasOwnProperty('replaceAll')) {
        String.prototype.replaceAll = function (search: string, replacement: string) {
            var target = this;
            return target.split(search).join(replacement);
        };
    }

    // Copied from https://github.com/behnammodi/polyfill/blob/master/array.polyfill.js
    if (!Array.prototype.flatMap) {
        Object.defineProperty(Array.prototype, 'flatMap', {
            configurable: true,
            writable: true,
            value: function () {
                return Array.prototype.map.apply(this, arguments).flat(1);
            },
        });
    }
}