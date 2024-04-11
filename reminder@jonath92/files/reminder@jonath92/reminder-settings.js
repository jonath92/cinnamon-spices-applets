var reminderApplet;

(() => {
    "use strict";
    var __webpack_modules__ = {
        20: module => {
            var token = "%[a-f0-9]{2}";
            var singleMatcher = new RegExp(token, "gi");
            var multiMatcher = new RegExp("(" + token + ")+", "gi");
            function decodeComponents(components, split) {
                try {
                    return decodeURIComponent(components.join(""));
                } catch (err) {}
                if (1 === components.length) return components;
                split = split || 1;
                var left = components.slice(0, split);
                var right = components.slice(split);
                return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
            }
            function decode(input) {
                try {
                    return decodeURIComponent(input);
                } catch (err) {
                    var tokens = input.match(singleMatcher);
                    for (var i = 1; i < tokens.length; i++) {
                        input = decodeComponents(tokens, i).join("");
                        tokens = input.match(singleMatcher);
                    }
                    return input;
                }
            }
            function customDecodeURIComponent(input) {
                var replaceMap = {
                    "%FE%FF": "��",
                    "%FF%FE": "��"
                };
                var match = multiMatcher.exec(input);
                while (match) {
                    try {
                        replaceMap[match[0]] = decodeURIComponent(match[0]);
                    } catch (err) {
                        var result = decode(match[0]);
                        if (result !== match[0]) replaceMap[match[0]] = result;
                    }
                    match = multiMatcher.exec(input);
                }
                replaceMap["%C2"] = "�";
                var entries = Object.keys(replaceMap);
                for (var i = 0; i < entries.length; i++) {
                    var key = entries[i];
                    input = input.replace(new RegExp(key, "g"), replaceMap[key]);
                }
                return input;
            }
            module.exports = function(encodedURI) {
                if ("string" !== typeof encodedURI) throw new TypeError("Expected `encodedURI` to be of type `string`, got `" + typeof encodedURI + "`");
                try {
                    encodedURI = encodedURI.replace(/\+/g, " ");
                    return decodeURIComponent(encodedURI);
                } catch (err) {
                    return customDecodeURIComponent(encodedURI);
                }
            };
        },
        806: module => {
            module.exports = function(obj, predicate) {
                var ret = {};
                var keys = Object.keys(obj);
                var isArr = Array.isArray(predicate);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var val = obj[key];
                    if (isArr ? -1 !== predicate.indexOf(key) : predicate(key, val, obj)) ret[key] = val;
                }
                return ret;
            };
        },
        563: (__unused_webpack_module, exports, __webpack_require__) => {
            const strictUriEncode = __webpack_require__(610);
            const decodeComponent = __webpack_require__(20);
            const splitOnFirst = __webpack_require__(500);
            const filterObject = __webpack_require__(806);
            const isNullOrUndefined = value => null === value || void 0 === value;
            const encodeFragmentIdentifier = Symbol("encodeFragmentIdentifier");
            function encoderForArrayFormat(options) {
                switch (options.arrayFormat) {
                  case "index":
                    return key => (result, value) => {
                        const index = result.length;
                        if (void 0 === value || options.skipNull && null === value || options.skipEmptyString && "" === value) return result;
                        if (null === value) return [ ...result, [ encode(key, options), "[", index, "]" ].join("") ];
                        return [ ...result, [ encode(key, options), "[", encode(index, options), "]=", encode(value, options) ].join("") ];
                    };

                  case "bracket":
                    return key => (result, value) => {
                        if (void 0 === value || options.skipNull && null === value || options.skipEmptyString && "" === value) return result;
                        if (null === value) return [ ...result, [ encode(key, options), "[]" ].join("") ];
                        return [ ...result, [ encode(key, options), "[]=", encode(value, options) ].join("") ];
                    };

                  case "colon-list-separator":
                    return key => (result, value) => {
                        if (void 0 === value || options.skipNull && null === value || options.skipEmptyString && "" === value) return result;
                        if (null === value) return [ ...result, [ encode(key, options), ":list=" ].join("") ];
                        return [ ...result, [ encode(key, options), ":list=", encode(value, options) ].join("") ];
                    };

                  case "comma":
                  case "separator":
                  case "bracket-separator":
                    {
                        const keyValueSep = "bracket-separator" === options.arrayFormat ? "[]=" : "=";
                        return key => (result, value) => {
                            if (void 0 === value || options.skipNull && null === value || options.skipEmptyString && "" === value) return result;
                            value = null === value ? "" : value;
                            if (0 === result.length) return [ [ encode(key, options), keyValueSep, encode(value, options) ].join("") ];
                            return [ [ result, encode(value, options) ].join(options.arrayFormatSeparator) ];
                        };
                    }

                  default:
                    return key => (result, value) => {
                        if (void 0 === value || options.skipNull && null === value || options.skipEmptyString && "" === value) return result;
                        if (null === value) return [ ...result, encode(key, options) ];
                        return [ ...result, [ encode(key, options), "=", encode(value, options) ].join("") ];
                    };
                }
            }
            function parserForArrayFormat(options) {
                let result;
                switch (options.arrayFormat) {
                  case "index":
                    return (key, value, accumulator) => {
                        result = /\[(\d*)\]$/.exec(key);
                        key = key.replace(/\[\d*\]$/, "");
                        if (!result) {
                            accumulator[key] = value;
                            return;
                        }
                        if (void 0 === accumulator[key]) accumulator[key] = {};
                        accumulator[key][result[1]] = value;
                    };

                  case "bracket":
                    return (key, value, accumulator) => {
                        result = /(\[\])$/.exec(key);
                        key = key.replace(/\[\]$/, "");
                        if (!result) {
                            accumulator[key] = value;
                            return;
                        }
                        if (void 0 === accumulator[key]) {
                            accumulator[key] = [ value ];
                            return;
                        }
                        accumulator[key] = [].concat(accumulator[key], value);
                    };

                  case "colon-list-separator":
                    return (key, value, accumulator) => {
                        result = /(:list)$/.exec(key);
                        key = key.replace(/:list$/, "");
                        if (!result) {
                            accumulator[key] = value;
                            return;
                        }
                        if (void 0 === accumulator[key]) {
                            accumulator[key] = [ value ];
                            return;
                        }
                        accumulator[key] = [].concat(accumulator[key], value);
                    };

                  case "comma":
                  case "separator":
                    return (key, value, accumulator) => {
                        const isArray = "string" === typeof value && value.includes(options.arrayFormatSeparator);
                        const isEncodedArray = "string" === typeof value && !isArray && decode(value, options).includes(options.arrayFormatSeparator);
                        value = isEncodedArray ? decode(value, options) : value;
                        const newValue = isArray || isEncodedArray ? value.split(options.arrayFormatSeparator).map((item => decode(item, options))) : null === value ? value : decode(value, options);
                        accumulator[key] = newValue;
                    };

                  case "bracket-separator":
                    return (key, value, accumulator) => {
                        const isArray = /(\[\])$/.test(key);
                        key = key.replace(/\[\]$/, "");
                        if (!isArray) {
                            accumulator[key] = value ? decode(value, options) : value;
                            return;
                        }
                        const arrayValue = null === value ? [] : value.split(options.arrayFormatSeparator).map((item => decode(item, options)));
                        if (void 0 === accumulator[key]) {
                            accumulator[key] = arrayValue;
                            return;
                        }
                        accumulator[key] = [].concat(accumulator[key], arrayValue);
                    };

                  default:
                    return (key, value, accumulator) => {
                        if (void 0 === accumulator[key]) {
                            accumulator[key] = value;
                            return;
                        }
                        accumulator[key] = [].concat(accumulator[key], value);
                    };
                }
            }
            function validateArrayFormatSeparator(value) {
                if ("string" !== typeof value || 1 !== value.length) throw new TypeError("arrayFormatSeparator must be single character string");
            }
            function encode(value, options) {
                if (options.encode) return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
                return value;
            }
            function decode(value, options) {
                if (options.decode) return decodeComponent(value);
                return value;
            }
            function keysSorter(input) {
                if (Array.isArray(input)) return input.sort();
                if ("object" === typeof input) return keysSorter(Object.keys(input)).sort(((a, b) => Number(a) - Number(b))).map((key => input[key]));
                return input;
            }
            function removeHash(input) {
                const hashStart = input.indexOf("#");
                if (-1 !== hashStart) input = input.slice(0, hashStart);
                return input;
            }
            function getHash(url) {
                let hash = "";
                const hashStart = url.indexOf("#");
                if (-1 !== hashStart) hash = url.slice(hashStart);
                return hash;
            }
            function extract(input) {
                input = removeHash(input);
                const queryStart = input.indexOf("?");
                if (-1 === queryStart) return "";
                return input.slice(queryStart + 1);
            }
            function parseValue(value, options) {
                if (options.parseNumbers && !Number.isNaN(Number(value)) && "string" === typeof value && "" !== value.trim()) value = Number(value); else if (options.parseBooleans && null !== value && ("true" === value.toLowerCase() || "false" === value.toLowerCase())) value = "true" === value.toLowerCase();
                return value;
            }
            function parse(query, options) {
                options = Object.assign({
                    decode: true,
                    sort: true,
                    arrayFormat: "none",
                    arrayFormatSeparator: ",",
                    parseNumbers: false,
                    parseBooleans: false
                }, options);
                validateArrayFormatSeparator(options.arrayFormatSeparator);
                const formatter = parserForArrayFormat(options);
                const ret = Object.create(null);
                if ("string" !== typeof query) return ret;
                query = query.trim().replace(/^[?#&]/, "");
                if (!query) return ret;
                for (const param of query.split("&")) {
                    if ("" === param) continue;
                    let [key, value] = splitOnFirst(options.decode ? param.replace(/\+/g, " ") : param, "=");
                    value = void 0 === value ? null : [ "comma", "separator", "bracket-separator" ].includes(options.arrayFormat) ? value : decode(value, options);
                    formatter(decode(key, options), value, ret);
                }
                for (const key of Object.keys(ret)) {
                    const value = ret[key];
                    if ("object" === typeof value && null !== value) for (const k of Object.keys(value)) value[k] = parseValue(value[k], options); else ret[key] = parseValue(value, options);
                }
                if (false === options.sort) return ret;
                return (true === options.sort ? Object.keys(ret).sort() : Object.keys(ret).sort(options.sort)).reduce(((result, key) => {
                    const value = ret[key];
                    if (Boolean(value) && "object" === typeof value && !Array.isArray(value)) result[key] = keysSorter(value); else result[key] = value;
                    return result;
                }), Object.create(null));
            }
            exports.extract = extract;
            exports.parse = parse;
            exports.stringify = (object, options) => {
                if (!object) return "";
                options = Object.assign({
                    encode: true,
                    strict: true,
                    arrayFormat: "none",
                    arrayFormatSeparator: ","
                }, options);
                validateArrayFormatSeparator(options.arrayFormatSeparator);
                const shouldFilter = key => options.skipNull && isNullOrUndefined(object[key]) || options.skipEmptyString && "" === object[key];
                const formatter = encoderForArrayFormat(options);
                const objectCopy = {};
                for (const key of Object.keys(object)) if (!shouldFilter(key)) objectCopy[key] = object[key];
                const keys = Object.keys(objectCopy);
                if (false !== options.sort) keys.sort(options.sort);
                return keys.map((key => {
                    const value = object[key];
                    if (void 0 === value) return "";
                    if (null === value) return encode(key, options);
                    if (Array.isArray(value)) {
                        if (0 === value.length && "bracket-separator" === options.arrayFormat) return encode(key, options) + "[]";
                        return value.reduce(formatter(key), []).join("&");
                    }
                    return encode(key, options) + "=" + encode(value, options);
                })).filter((x => x.length > 0)).join("&");
            };
            exports.parseUrl = (url, options) => {
                options = Object.assign({
                    decode: true
                }, options);
                const [url_, hash] = splitOnFirst(url, "#");
                return Object.assign({
                    url: url_.split("?")[0] || "",
                    query: parse(extract(url), options)
                }, options && options.parseFragmentIdentifier && hash ? {
                    fragmentIdentifier: decode(hash, options)
                } : {});
            };
            exports.stringifyUrl = (object, options) => {
                options = Object.assign({
                    encode: true,
                    strict: true,
                    [encodeFragmentIdentifier]: true
                }, options);
                const url = removeHash(object.url).split("?")[0] || "";
                const queryFromUrl = exports.extract(object.url);
                const parsedQueryFromUrl = exports.parse(queryFromUrl, {
                    sort: false
                });
                const query = Object.assign(parsedQueryFromUrl, object.query);
                let queryString = exports.stringify(query, options);
                if (queryString) queryString = `?${queryString}`;
                let hash = getHash(object.url);
                if (object.fragmentIdentifier) hash = `#${options[encodeFragmentIdentifier] ? encode(object.fragmentIdentifier, options) : object.fragmentIdentifier}`;
                return `${url}${queryString}${hash}`;
            };
            exports.pick = (input, filter, options) => {
                options = Object.assign({
                    parseFragmentIdentifier: true,
                    [encodeFragmentIdentifier]: false
                }, options);
                const {url, query, fragmentIdentifier} = exports.parseUrl(input, options);
                return exports.stringifyUrl({
                    url,
                    query: filterObject(query, filter),
                    fragmentIdentifier
                }, options);
            };
            exports.exclude = (input, filter, options) => {
                const exclusionFilter = Array.isArray(filter) ? key => !filter.includes(key) : (key, value) => !filter(key, value);
                return exports.pick(input, exclusionFilter, options);
            };
        },
        500: module => {
            module.exports = (string, separator) => {
                if (!("string" === typeof string && "string" === typeof separator)) throw new TypeError("Expected the arguments to be of type `string`");
                if ("" === separator) return [ string ];
                const separatorIndex = string.indexOf(separator);
                if (-1 === separatorIndex) return [ string ];
                return [ string.slice(0, separatorIndex), string.slice(separatorIndex + separator.length) ];
            };
        },
        610: module => {
            module.exports = str => encodeURIComponent(str).replace(/[!'()*]/g, (x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`));
        }
    };
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (void 0 !== cachedModule) return cachedModule.exports;
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        return module.exports;
    }
    (() => {
        __webpack_require__.r = exports => {
            if ("undefined" !== typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports, Symbol.toStringTag, {
                value: "Module"
            });
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
        };
    })();
    var __webpack_exports__ = {};
    (() => {
        __webpack_require__.r(__webpack_exports__);
        const {get_home_dir} = imports.gi.GLib;
        const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${{
            uuid: "reminder@jonath92",
            path: "/home/jonathan/Projekte/cinnamon-spices-applets/reminder@jonath92/files/reminder@jonath92"
        }.uuid}`;
        const APPLET_PATH = {
            uuid: "reminder@jonath92",
            path: "/home/jonathan/Projekte/cinnamon-spices-applets/reminder@jonath92/files/reminder@jonath92"
        }.path;
        ({
            uuid: "reminder@jonath92",
            path: "/home/jonathan/Projekte/cinnamon-spices-applets/reminder@jonath92/files/reminder@jonath92"
        }).uuid.split("@")[0];
        const OFFICE365_CLIENT_ID = "253aba70-3393-40a9-92ce-1296905d25fa";
        const OFFICE365_CLIENT_SECRET = "sva7Q~VDZS4yNJJ_4X3VDE4Rsh4SzP1AUpP.p";
        const OFFICE365_TOKEN_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
        const OFFICE365_USER_ENDPOINT = "https://graph.microsoft.com/v1.0/me";
        const OFFICE365_CALENDAR_ENDPOINT = "https://graph.microsoft.com/v1.0/me/calendarview";
        var query_string = __webpack_require__(563);
        const {ListBoxRow, Box, Image, Align, Orientation, Label} = imports.gi.Gtk;
        function createAddedAccountListRow() {
            const listboxRow = new ListBoxRow({
                can_focus: true,
                width_request: 100,
                height_request: 80
            });
            const googleBox = new Box({
                can_focus: true,
                spacing: 6
            });
            const googleImg = new Image({
                pixel_size: 40,
                icon_name: "goa-account-google",
                icon_size: 3
            });
            const labelBox = new Box({
                halign: Align.START,
                valign: Align.CENTER,
                orientation: Orientation.VERTICAL
            });
            labelBox.add(new Label({
                label: "Google",
                halign: Align.START
            }));
            labelBox.add(new Label({
                label: "<i>JonathanHeard92@gmail.com</i>",
                use_markup: true,
                margin_top: 2
            }));
            googleBox.add(googleImg);
            googleBox.add(labelBox);
            listboxRow.add(googleBox);
            return listboxRow;
        }
        const {Message, SessionAsync, Session} = imports.gi.Soup;
        const {PRIORITY_DEFAULT} = imports.gi.GLib;
        const httpSession = new Session;
        function isHttpError(x) {
            return "string" === typeof x.reason_phrase;
        }
        const ByteArray = imports.byteArray;
        function loadJsonAsync(args) {
            const {url, method = "GET", bodyParams, queryParams, headers} = args;
            const uri = queryParams ? `${url}?${(0, query_string.stringify)(queryParams)}` : url;
            const message = Message.new(method, uri);
            Object.entries(headers).forEach((([key, value]) => {
                message.request_headers.append(key, value);
            }));
            if (bodyParams) {
                const bodyParamsStringified = (0, query_string.stringify)(bodyParams);
                message.request_body.append(ByteArray.fromString(bodyParamsStringified, "UTF-8"));
            }
            return new Promise(((resolve, reject) => {
                httpSession.send_and_read_async(message, PRIORITY_DEFAULT, null, ((session, result) => {
                    const res = httpSession.send_and_read_finish(result);
                    const responseBody = null != res ? ByteArray.toString(ByteArray.fromGBytes(res)) : null;
                    if (!responseBody) return;
                    const data = JSON.parse(responseBody);
                    resolve(data);
                }));
            }));
        }
        class LuxonError extends Error {}
        class InvalidDateTimeError extends LuxonError {
            constructor(reason) {
                super(`Invalid DateTime: ${reason.toMessage()}`);
            }
        }
        class InvalidIntervalError extends LuxonError {
            constructor(reason) {
                super(`Invalid Interval: ${reason.toMessage()}`);
            }
        }
        class InvalidDurationError extends LuxonError {
            constructor(reason) {
                super(`Invalid Duration: ${reason.toMessage()}`);
            }
        }
        class ConflictingSpecificationError extends LuxonError {}
        class InvalidUnitError extends LuxonError {
            constructor(unit) {
                super(`Invalid unit ${unit}`);
            }
        }
        class InvalidArgumentError extends LuxonError {}
        class ZoneIsAbstractError extends LuxonError {
            constructor() {
                super("Zone is an abstract class");
            }
        }
        const n = "numeric", s = "short", l = "long";
        const DATE_SHORT = {
            year: n,
            month: n,
            day: n
        };
        const DATE_MED = {
            year: n,
            month: s,
            day: n
        };
        const DATE_MED_WITH_WEEKDAY = {
            year: n,
            month: s,
            day: n,
            weekday: s
        };
        const DATE_FULL = {
            year: n,
            month: l,
            day: n
        };
        const DATE_HUGE = {
            year: n,
            month: l,
            day: n,
            weekday: l
        };
        const TIME_SIMPLE = {
            hour: n,
            minute: n
        };
        const TIME_WITH_SECONDS = {
            hour: n,
            minute: n,
            second: n
        };
        const TIME_WITH_SHORT_OFFSET = {
            hour: n,
            minute: n,
            second: n,
            timeZoneName: s
        };
        const TIME_WITH_LONG_OFFSET = {
            hour: n,
            minute: n,
            second: n,
            timeZoneName: l
        };
        const TIME_24_SIMPLE = {
            hour: n,
            minute: n,
            hourCycle: "h23"
        };
        const TIME_24_WITH_SECONDS = {
            hour: n,
            minute: n,
            second: n,
            hourCycle: "h23"
        };
        const TIME_24_WITH_SHORT_OFFSET = {
            hour: n,
            minute: n,
            second: n,
            hourCycle: "h23",
            timeZoneName: s
        };
        const TIME_24_WITH_LONG_OFFSET = {
            hour: n,
            minute: n,
            second: n,
            hourCycle: "h23",
            timeZoneName: l
        };
        const DATETIME_SHORT = {
            year: n,
            month: n,
            day: n,
            hour: n,
            minute: n
        };
        const DATETIME_SHORT_WITH_SECONDS = {
            year: n,
            month: n,
            day: n,
            hour: n,
            minute: n,
            second: n
        };
        const DATETIME_MED = {
            year: n,
            month: s,
            day: n,
            hour: n,
            minute: n
        };
        const DATETIME_MED_WITH_SECONDS = {
            year: n,
            month: s,
            day: n,
            hour: n,
            minute: n,
            second: n
        };
        const DATETIME_MED_WITH_WEEKDAY = {
            year: n,
            month: s,
            day: n,
            weekday: s,
            hour: n,
            minute: n
        };
        const DATETIME_FULL = {
            year: n,
            month: l,
            day: n,
            hour: n,
            minute: n,
            timeZoneName: s
        };
        const DATETIME_FULL_WITH_SECONDS = {
            year: n,
            month: l,
            day: n,
            hour: n,
            minute: n,
            second: n,
            timeZoneName: s
        };
        const DATETIME_HUGE = {
            year: n,
            month: l,
            day: n,
            weekday: l,
            hour: n,
            minute: n,
            timeZoneName: l
        };
        const DATETIME_HUGE_WITH_SECONDS = {
            year: n,
            month: l,
            day: n,
            weekday: l,
            hour: n,
            minute: n,
            second: n,
            timeZoneName: l
        };
        function isUndefined(o) {
            return "undefined" === typeof o;
        }
        function isNumber(o) {
            return "number" === typeof o;
        }
        function isInteger(o) {
            return "number" === typeof o && o % 1 === 0;
        }
        function isString(o) {
            return "string" === typeof o;
        }
        function isDate(o) {
            return "[object Date]" === Object.prototype.toString.call(o);
        }
        function hasRelative() {
            try {
                return "undefined" !== typeof Intl && !!Intl.RelativeTimeFormat;
            } catch (e) {
                return false;
            }
        }
        function maybeArray(thing) {
            return Array.isArray(thing) ? thing : [ thing ];
        }
        function bestBy(arr, by, compare) {
            if (0 === arr.length) return;
            return arr.reduce(((best, next) => {
                const pair = [ by(next), next ];
                if (!best) return pair; else if (compare(best[0], pair[0]) === best[0]) return best; else return pair;
            }), null)[1];
        }
        function util_pick(obj, keys) {
            return keys.reduce(((a, k) => {
                a[k] = obj[k];
                return a;
            }), {});
        }
        function util_hasOwnProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }
        function integerBetween(thing, bottom, top) {
            return isInteger(thing) && thing >= bottom && thing <= top;
        }
        function floorMod(x, n) {
            return x - n * Math.floor(x / n);
        }
        function padStart(input, n = 2) {
            const isNeg = input < 0;
            let padded;
            if (isNeg) padded = "-" + ("" + -input).padStart(n, "0"); else padded = ("" + input).padStart(n, "0");
            return padded;
        }
        function parseInteger(string) {
            if (isUndefined(string) || null === string || "" === string) return; else return parseInt(string, 10);
        }
        function parseFloating(string) {
            if (isUndefined(string) || null === string || "" === string) return; else return parseFloat(string);
        }
        function parseMillis(fraction) {
            if (isUndefined(fraction) || null === fraction || "" === fraction) return; else {
                const f = 1e3 * parseFloat("0." + fraction);
                return Math.floor(f);
            }
        }
        function roundTo(number, digits, towardZero = false) {
            const factor = 10 ** digits, rounder = towardZero ? Math.trunc : Math.round;
            return rounder(number * factor) / factor;
        }
        function isLeapYear(year) {
            return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        }
        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }
        function daysInMonth(year, month) {
            const modMonth = floorMod(month - 1, 12) + 1, modYear = year + (month - modMonth) / 12;
            if (2 === modMonth) return isLeapYear(modYear) ? 29 : 28; else return [ 31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ][modMonth - 1];
        }
        function objToLocalTS(obj) {
            let d = Date.UTC(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second, obj.millisecond);
            if (obj.year < 100 && obj.year >= 0) {
                d = new Date(d);
                d.setUTCFullYear(d.getUTCFullYear() - 1900);
            }
            return +d;
        }
        function weeksInWeekYear(weekYear) {
            const p1 = (weekYear + Math.floor(weekYear / 4) - Math.floor(weekYear / 100) + Math.floor(weekYear / 400)) % 7, last = weekYear - 1, p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
            return 4 === p1 || 3 === p2 ? 53 : 52;
        }
        function untruncateYear(year) {
            if (year > 99) return year; else return year > 60 ? 1900 + year : 2e3 + year;
        }
        function parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
            const date = new Date(ts), intlOpts = {
                hourCycle: "h23",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            };
            if (timeZone) intlOpts.timeZone = timeZone;
            const modified = {
                timeZoneName: offsetFormat,
                ...intlOpts
            };
            const parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find((m => "timezonename" === m.type.toLowerCase()));
            return parsed ? parsed.value : null;
        }
        function signedOffset(offHourStr, offMinuteStr) {
            let offHour = parseInt(offHourStr, 10);
            if (Number.isNaN(offHour)) offHour = 0;
            const offMin = parseInt(offMinuteStr, 10) || 0, offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
            return 60 * offHour + offMinSigned;
        }
        function asNumber(value) {
            const numericValue = Number(value);
            if ("boolean" === typeof value || "" === value || Number.isNaN(numericValue)) throw new InvalidArgumentError(`Invalid unit value ${value}`);
            return numericValue;
        }
        function normalizeObject(obj, normalizer) {
            const normalized = {};
            for (const u in obj) if (util_hasOwnProperty(obj, u)) {
                const v = obj[u];
                if (void 0 === v || null === v) continue;
                normalized[normalizer(u)] = asNumber(v);
            }
            return normalized;
        }
        function formatOffset(offset, format) {
            const hours = Math.trunc(Math.abs(offset / 60)), minutes = Math.trunc(Math.abs(offset % 60)), sign = offset >= 0 ? "+" : "-";
            switch (format) {
              case "short":
                return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;

              case "narrow":
                return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;

              case "techie":
                return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;

              default:
                throw new RangeError(`Value format ${format} is out of range for property format`);
            }
        }
        function timeObject(obj) {
            return util_pick(obj, [ "hour", "minute", "second", "millisecond" ]);
        }
        const ianaRegex = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
        const monthsLong = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        const monthsShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        const monthsNarrow = [ "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D" ];
        function months(length) {
            switch (length) {
              case "narrow":
                return [ ...monthsNarrow ];

              case "short":
                return [ ...monthsShort ];

              case "long":
                return [ ...monthsLong ];

              case "numeric":
                return [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12" ];

              case "2-digit":
                return [ "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12" ];

              default:
                return null;
            }
        }
        const weekdaysLong = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ];
        const weekdaysShort = [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ];
        const weekdaysNarrow = [ "M", "T", "W", "T", "F", "S", "S" ];
        function weekdays(length) {
            switch (length) {
              case "narrow":
                return [ ...weekdaysNarrow ];

              case "short":
                return [ ...weekdaysShort ];

              case "long":
                return [ ...weekdaysLong ];

              case "numeric":
                return [ "1", "2", "3", "4", "5", "6", "7" ];

              default:
                return null;
            }
        }
        const meridiems = [ "AM", "PM" ];
        const erasLong = [ "Before Christ", "Anno Domini" ];
        const erasShort = [ "BC", "AD" ];
        const erasNarrow = [ "B", "A" ];
        function eras(length) {
            switch (length) {
              case "narrow":
                return [ ...erasNarrow ];

              case "short":
                return [ ...erasShort ];

              case "long":
                return [ ...erasLong ];

              default:
                return null;
            }
        }
        function meridiemForDateTime(dt) {
            return meridiems[dt.hour < 12 ? 0 : 1];
        }
        function weekdayForDateTime(dt, length) {
            return weekdays(length)[dt.weekday - 1];
        }
        function monthForDateTime(dt, length) {
            return months(length)[dt.month - 1];
        }
        function eraForDateTime(dt, length) {
            return eras(length)[dt.year < 0 ? 0 : 1];
        }
        function formatRelativeTime(unit, count, numeric = "always", narrow = false) {
            const units = {
                years: [ "year", "yr." ],
                quarters: [ "quarter", "qtr." ],
                months: [ "month", "mo." ],
                weeks: [ "week", "wk." ],
                days: [ "day", "day", "days" ],
                hours: [ "hour", "hr." ],
                minutes: [ "minute", "min." ],
                seconds: [ "second", "sec." ]
            };
            const lastable = -1 === [ "hours", "minutes", "seconds" ].indexOf(unit);
            if ("auto" === numeric && lastable) {
                const isDay = "days" === unit;
                switch (count) {
                  case 1:
                    return isDay ? "tomorrow" : `next ${units[unit][0]}`;

                  case -1:
                    return isDay ? "yesterday" : `last ${units[unit][0]}`;

                  case 0:
                    return isDay ? "today" : `this ${units[unit][0]}`;

                  default:
                }
            }
            const isInPast = Object.is(count, -0) || count < 0, fmtValue = Math.abs(count), singular = 1 === fmtValue, lilUnits = units[unit], fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
            return isInPast ? `${fmtValue} ${fmtUnit} ago` : `in ${fmtValue} ${fmtUnit}`;
        }
        function stringifyTokens(splits, tokenToString) {
            let s = "";
            for (const token of splits) if (token.literal) s += token.val; else s += tokenToString(token.val);
            return s;
        }
        const macroTokenToFormatOpts = {
            D: DATE_SHORT,
            DD: DATE_MED,
            DDD: DATE_FULL,
            DDDD: DATE_HUGE,
            t: TIME_SIMPLE,
            tt: TIME_WITH_SECONDS,
            ttt: TIME_WITH_SHORT_OFFSET,
            tttt: TIME_WITH_LONG_OFFSET,
            T: TIME_24_SIMPLE,
            TT: TIME_24_WITH_SECONDS,
            TTT: TIME_24_WITH_SHORT_OFFSET,
            TTTT: TIME_24_WITH_LONG_OFFSET,
            f: DATETIME_SHORT,
            ff: DATETIME_MED,
            fff: DATETIME_FULL,
            ffff: DATETIME_HUGE,
            F: DATETIME_SHORT_WITH_SECONDS,
            FF: DATETIME_MED_WITH_SECONDS,
            FFF: DATETIME_FULL_WITH_SECONDS,
            FFFF: DATETIME_HUGE_WITH_SECONDS
        };
        class Formatter {
            static create(locale, opts = {}) {
                return new Formatter(locale, opts);
            }
            static parseFormat(fmt) {
                let current = null, currentFull = "", bracketed = false;
                const splits = [];
                for (let i = 0; i < fmt.length; i++) {
                    const c = fmt.charAt(i);
                    if ("'" === c) {
                        if (currentFull.length > 0) splits.push({
                            literal: bracketed,
                            val: currentFull
                        });
                        current = null;
                        currentFull = "";
                        bracketed = !bracketed;
                    } else if (bracketed) currentFull += c; else if (c === current) currentFull += c; else {
                        if (currentFull.length > 0) splits.push({
                            literal: false,
                            val: currentFull
                        });
                        currentFull = c;
                        current = c;
                    }
                }
                if (currentFull.length > 0) splits.push({
                    literal: bracketed,
                    val: currentFull
                });
                return splits;
            }
            static macroTokenToFormatOpts(token) {
                return macroTokenToFormatOpts[token];
            }
            constructor(locale, formatOpts) {
                this.opts = formatOpts;
                this.loc = locale;
                this.systemLoc = null;
            }
            formatWithSystemDefault(dt, opts) {
                if (null === this.systemLoc) this.systemLoc = this.loc.redefaultToSystem();
                const df = this.systemLoc.dtFormatter(dt, {
                    ...this.opts,
                    ...opts
                });
                return df.format();
            }
            formatDateTime(dt, opts = {}) {
                const df = this.loc.dtFormatter(dt, {
                    ...this.opts,
                    ...opts
                });
                return df.format();
            }
            formatDateTimeParts(dt, opts = {}) {
                const df = this.loc.dtFormatter(dt, {
                    ...this.opts,
                    ...opts
                });
                return df.formatToParts();
            }
            resolvedOptions(dt, opts = {}) {
                const df = this.loc.dtFormatter(dt, {
                    ...this.opts,
                    ...opts
                });
                return df.resolvedOptions();
            }
            num(n, p = 0) {
                if (this.opts.forceSimple) return padStart(n, p);
                const opts = {
                    ...this.opts
                };
                if (p > 0) opts.padTo = p;
                return this.loc.numberFormatter(opts).format(n);
            }
            formatDateTimeFromString(dt, fmt) {
                const knownEnglish = "en" === this.loc.listingMode(), useDateTimeFormatter = this.loc.outputCalendar && "gregory" !== this.loc.outputCalendar, string = (opts, extract) => this.loc.extract(dt, opts, extract), formatOffset = opts => {
                    if (dt.isOffsetFixed && 0 === dt.offset && opts.allowZ) return "Z";
                    return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
                }, meridiem = () => knownEnglish ? meridiemForDateTime(dt) : string({
                    hour: "numeric",
                    hourCycle: "h12"
                }, "dayperiod"), month = (length, standalone) => knownEnglish ? monthForDateTime(dt, length) : string(standalone ? {
                    month: length
                } : {
                    month: length,
                    day: "numeric"
                }, "month"), weekday = (length, standalone) => knownEnglish ? weekdayForDateTime(dt, length) : string(standalone ? {
                    weekday: length
                } : {
                    weekday: length,
                    month: "long",
                    day: "numeric"
                }, "weekday"), maybeMacro = token => {
                    const formatOpts = Formatter.macroTokenToFormatOpts(token);
                    if (formatOpts) return this.formatWithSystemDefault(dt, formatOpts); else return token;
                }, era = length => knownEnglish ? eraForDateTime(dt, length) : string({
                    era: length
                }, "era"), tokenToString = token => {
                    switch (token) {
                      case "S":
                        return this.num(dt.millisecond);

                      case "u":
                      case "SSS":
                        return this.num(dt.millisecond, 3);

                      case "s":
                        return this.num(dt.second);

                      case "ss":
                        return this.num(dt.second, 2);

                      case "uu":
                        return this.num(Math.floor(dt.millisecond / 10), 2);

                      case "uuu":
                        return this.num(Math.floor(dt.millisecond / 100));

                      case "m":
                        return this.num(dt.minute);

                      case "mm":
                        return this.num(dt.minute, 2);

                      case "h":
                        return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);

                      case "hh":
                        return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);

                      case "H":
                        return this.num(dt.hour);

                      case "HH":
                        return this.num(dt.hour, 2);

                      case "Z":
                        return formatOffset({
                            format: "narrow",
                            allowZ: this.opts.allowZ
                        });

                      case "ZZ":
                        return formatOffset({
                            format: "short",
                            allowZ: this.opts.allowZ
                        });

                      case "ZZZ":
                        return formatOffset({
                            format: "techie",
                            allowZ: this.opts.allowZ
                        });

                      case "ZZZZ":
                        return dt.zone.offsetName(dt.ts, {
                            format: "short",
                            locale: this.loc.locale
                        });

                      case "ZZZZZ":
                        return dt.zone.offsetName(dt.ts, {
                            format: "long",
                            locale: this.loc.locale
                        });

                      case "z":
                        return dt.zoneName;

                      case "a":
                        return meridiem();

                      case "d":
                        return useDateTimeFormatter ? string({
                            day: "numeric"
                        }, "day") : this.num(dt.day);

                      case "dd":
                        return useDateTimeFormatter ? string({
                            day: "2-digit"
                        }, "day") : this.num(dt.day, 2);

                      case "c":
                        return this.num(dt.weekday);

                      case "ccc":
                        return weekday("short", true);

                      case "cccc":
                        return weekday("long", true);

                      case "ccccc":
                        return weekday("narrow", true);

                      case "E":
                        return this.num(dt.weekday);

                      case "EEE":
                        return weekday("short", false);

                      case "EEEE":
                        return weekday("long", false);

                      case "EEEEE":
                        return weekday("narrow", false);

                      case "L":
                        return useDateTimeFormatter ? string({
                            month: "numeric",
                            day: "numeric"
                        }, "month") : this.num(dt.month);

                      case "LL":
                        return useDateTimeFormatter ? string({
                            month: "2-digit",
                            day: "numeric"
                        }, "month") : this.num(dt.month, 2);

                      case "LLL":
                        return month("short", true);

                      case "LLLL":
                        return month("long", true);

                      case "LLLLL":
                        return month("narrow", true);

                      case "M":
                        return useDateTimeFormatter ? string({
                            month: "numeric"
                        }, "month") : this.num(dt.month);

                      case "MM":
                        return useDateTimeFormatter ? string({
                            month: "2-digit"
                        }, "month") : this.num(dt.month, 2);

                      case "MMM":
                        return month("short", false);

                      case "MMMM":
                        return month("long", false);

                      case "MMMMM":
                        return month("narrow", false);

                      case "y":
                        return useDateTimeFormatter ? string({
                            year: "numeric"
                        }, "year") : this.num(dt.year);

                      case "yy":
                        return useDateTimeFormatter ? string({
                            year: "2-digit"
                        }, "year") : this.num(dt.year.toString().slice(-2), 2);

                      case "yyyy":
                        return useDateTimeFormatter ? string({
                            year: "numeric"
                        }, "year") : this.num(dt.year, 4);

                      case "yyyyyy":
                        return useDateTimeFormatter ? string({
                            year: "numeric"
                        }, "year") : this.num(dt.year, 6);

                      case "G":
                        return era("short");

                      case "GG":
                        return era("long");

                      case "GGGGG":
                        return era("narrow");

                      case "kk":
                        return this.num(dt.weekYear.toString().slice(-2), 2);

                      case "kkkk":
                        return this.num(dt.weekYear, 4);

                      case "W":
                        return this.num(dt.weekNumber);

                      case "WW":
                        return this.num(dt.weekNumber, 2);

                      case "o":
                        return this.num(dt.ordinal);

                      case "ooo":
                        return this.num(dt.ordinal, 3);

                      case "q":
                        return this.num(dt.quarter);

                      case "qq":
                        return this.num(dt.quarter, 2);

                      case "X":
                        return this.num(Math.floor(dt.ts / 1e3));

                      case "x":
                        return this.num(dt.ts);

                      default:
                        return maybeMacro(token);
                    }
                };
                return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
            }
            formatDurationFromString(dur, fmt) {
                const tokenToField = token => {
                    switch (token[0]) {
                      case "S":
                        return "millisecond";

                      case "s":
                        return "second";

                      case "m":
                        return "minute";

                      case "h":
                        return "hour";

                      case "d":
                        return "day";

                      case "w":
                        return "week";

                      case "M":
                        return "month";

                      case "y":
                        return "year";

                      default:
                        return null;
                    }
                }, tokenToString = lildur => token => {
                    const mapped = tokenToField(token);
                    if (mapped) return this.num(lildur.get(mapped), token.length); else return token;
                }, tokens = Formatter.parseFormat(fmt), realTokens = tokens.reduce(((found, {literal, val}) => literal ? found : found.concat(val)), []), collapsed = dur.shiftTo(...realTokens.map(tokenToField).filter((t => t)));
                return stringifyTokens(tokens, tokenToString(collapsed));
            }
        }
        class Invalid {
            constructor(reason, explanation) {
                this.reason = reason;
                this.explanation = explanation;
            }
            toMessage() {
                if (this.explanation) return `${this.reason}: ${this.explanation}`; else return this.reason;
            }
        }
        class Zone {
            get type() {
                throw new ZoneIsAbstractError;
            }
            get name() {
                throw new ZoneIsAbstractError;
            }
            get ianaName() {
                return this.name;
            }
            get isUniversal() {
                throw new ZoneIsAbstractError;
            }
            offsetName(ts, opts) {
                throw new ZoneIsAbstractError;
            }
            formatOffset(ts, format) {
                throw new ZoneIsAbstractError;
            }
            offset(ts) {
                throw new ZoneIsAbstractError;
            }
            equals(otherZone) {
                throw new ZoneIsAbstractError;
            }
            get isValid() {
                throw new ZoneIsAbstractError;
            }
        }
        let singleton = null;
        class SystemZone extends Zone {
            static get instance() {
                if (null === singleton) singleton = new SystemZone;
                return singleton;
            }
            get type() {
                return "system";
            }
            get name() {
                return (new Intl.DateTimeFormat).resolvedOptions().timeZone;
            }
            get isUniversal() {
                return false;
            }
            offsetName(ts, {format, locale}) {
                return parseZoneInfo(ts, format, locale);
            }
            formatOffset(ts, format) {
                return formatOffset(this.offset(ts), format);
            }
            offset(ts) {
                return -new Date(ts).getTimezoneOffset();
            }
            equals(otherZone) {
                return "system" === otherZone.type;
            }
            get isValid() {
                return true;
            }
        }
        let dtfCache = {};
        function makeDTF(zone) {
            if (!dtfCache[zone]) dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
                hour12: false,
                timeZone: zone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                era: "short"
            });
            return dtfCache[zone];
        }
        const typeToPos = {
            year: 0,
            month: 1,
            day: 2,
            era: 3,
            hour: 4,
            minute: 5,
            second: 6
        };
        function hackyOffset(dtf, date) {
            const formatted = dtf.format(date).replace(/\u200E/g, ""), parsed = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(formatted), [, fMonth, fDay, fYear, fadOrBc, fHour, fMinute, fSecond] = parsed;
            return [ fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond ];
        }
        function partsOffset(dtf, date) {
            const formatted = dtf.formatToParts(date);
            const filled = [];
            for (let i = 0; i < formatted.length; i++) {
                const {type, value} = formatted[i];
                const pos = typeToPos[type];
                if ("era" === type) filled[pos] = value; else if (!isUndefined(pos)) filled[pos] = parseInt(value, 10);
            }
            return filled;
        }
        let ianaZoneCache = {};
        class IANAZone extends Zone {
            static create(name) {
                if (!ianaZoneCache[name]) ianaZoneCache[name] = new IANAZone(name);
                return ianaZoneCache[name];
            }
            static resetCache() {
                ianaZoneCache = {};
                dtfCache = {};
            }
            static isValidSpecifier(s) {
                return this.isValidZone(s);
            }
            static isValidZone(zone) {
                if (!zone) return false;
                try {
                    new Intl.DateTimeFormat("en-US", {
                        timeZone: zone
                    }).format();
                    return true;
                } catch (e) {
                    return false;
                }
            }
            constructor(name) {
                super();
                this.zoneName = name;
                this.valid = IANAZone.isValidZone(name);
            }
            get type() {
                return "iana";
            }
            get name() {
                return this.zoneName;
            }
            get isUniversal() {
                return false;
            }
            offsetName(ts, {format, locale}) {
                return parseZoneInfo(ts, format, locale, this.name);
            }
            formatOffset(ts, format) {
                return formatOffset(this.offset(ts), format);
            }
            offset(ts) {
                const date = new Date(ts);
                if (isNaN(date)) return NaN;
                const dtf = makeDTF(this.name);
                let [year, month, day, adOrBc, hour, minute, second] = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date);
                if ("BC" === adOrBc) year = -Math.abs(year) + 1;
                const adjustedHour = 24 === hour ? 0 : hour;
                const asUTC = objToLocalTS({
                    year,
                    month,
                    day,
                    hour: adjustedHour,
                    minute,
                    second,
                    millisecond: 0
                });
                let asTS = +date;
                const over = asTS % 1e3;
                asTS -= over >= 0 ? over : 1e3 + over;
                return (asUTC - asTS) / (60 * 1e3);
            }
            equals(otherZone) {
                return "iana" === otherZone.type && otherZone.name === this.name;
            }
            get isValid() {
                return this.valid;
            }
        }
        let fixedOffsetZone_singleton = null;
        class FixedOffsetZone extends Zone {
            static get utcInstance() {
                if (null === fixedOffsetZone_singleton) fixedOffsetZone_singleton = new FixedOffsetZone(0);
                return fixedOffsetZone_singleton;
            }
            static instance(offset) {
                return 0 === offset ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
            }
            static parseSpecifier(s) {
                if (s) {
                    const r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
                    if (r) return new FixedOffsetZone(signedOffset(r[1], r[2]));
                }
                return null;
            }
            constructor(offset) {
                super();
                this.fixed = offset;
            }
            get type() {
                return "fixed";
            }
            get name() {
                return 0 === this.fixed ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
            }
            get ianaName() {
                if (0 === this.fixed) return "Etc/UTC"; else return `Etc/GMT${formatOffset(-this.fixed, "narrow")}`;
            }
            offsetName() {
                return this.name;
            }
            formatOffset(ts, format) {
                return formatOffset(this.fixed, format);
            }
            get isUniversal() {
                return true;
            }
            offset() {
                return this.fixed;
            }
            equals(otherZone) {
                return "fixed" === otherZone.type && otherZone.fixed === this.fixed;
            }
            get isValid() {
                return true;
            }
        }
        class InvalidZone extends Zone {
            constructor(zoneName) {
                super();
                this.zoneName = zoneName;
            }
            get type() {
                return "invalid";
            }
            get name() {
                return this.zoneName;
            }
            get isUniversal() {
                return false;
            }
            offsetName() {
                return null;
            }
            formatOffset() {
                return "";
            }
            offset() {
                return NaN;
            }
            equals() {
                return false;
            }
            get isValid() {
                return false;
            }
        }
        function normalizeZone(input, defaultZone) {
            if (isUndefined(input) || null === input) return defaultZone; else if (input instanceof Zone) return input; else if (isString(input)) {
                const lowered = input.toLowerCase();
                if ("local" === lowered || "system" === lowered) return defaultZone; else if ("utc" === lowered || "gmt" === lowered) return FixedOffsetZone.utcInstance; else return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input);
            } else if (isNumber(input)) return FixedOffsetZone.instance(input); else if ("object" === typeof input && input.offset && "number" === typeof input.offset) return input; else return new InvalidZone(input);
        }
        let throwOnInvalid, now = () => Date.now(), defaultZone = "system", defaultLocale = null, defaultNumberingSystem = null, defaultOutputCalendar = null;
        class Settings {
            static get now() {
                return now;
            }
            static set now(n) {
                now = n;
            }
            static set defaultZone(zone) {
                defaultZone = zone;
            }
            static get defaultZone() {
                return normalizeZone(defaultZone, SystemZone.instance);
            }
            static get defaultLocale() {
                return defaultLocale;
            }
            static set defaultLocale(locale) {
                defaultLocale = locale;
            }
            static get defaultNumberingSystem() {
                return defaultNumberingSystem;
            }
            static set defaultNumberingSystem(numberingSystem) {
                defaultNumberingSystem = numberingSystem;
            }
            static get defaultOutputCalendar() {
                return defaultOutputCalendar;
            }
            static set defaultOutputCalendar(outputCalendar) {
                defaultOutputCalendar = outputCalendar;
            }
            static get throwOnInvalid() {
                return throwOnInvalid;
            }
            static set throwOnInvalid(t) {
                throwOnInvalid = t;
            }
            static resetCaches() {
                Locale.resetCache();
                IANAZone.resetCache();
            }
        }
        let intlLFCache = {};
        function getCachedLF(locString, opts = {}) {
            const key = JSON.stringify([ locString, opts ]);
            let dtf = intlLFCache[key];
            if (!dtf) {
                dtf = new Intl.ListFormat(locString, opts);
                intlLFCache[key] = dtf;
            }
            return dtf;
        }
        let intlDTCache = {};
        function getCachedDTF(locString, opts = {}) {
            const key = JSON.stringify([ locString, opts ]);
            let dtf = intlDTCache[key];
            if (!dtf) {
                dtf = new Intl.DateTimeFormat(locString, opts);
                intlDTCache[key] = dtf;
            }
            return dtf;
        }
        let intlNumCache = {};
        function getCachedINF(locString, opts = {}) {
            const key = JSON.stringify([ locString, opts ]);
            let inf = intlNumCache[key];
            if (!inf) {
                inf = new Intl.NumberFormat(locString, opts);
                intlNumCache[key] = inf;
            }
            return inf;
        }
        let intlRelCache = {};
        function getCachedRTF(locString, opts = {}) {
            const {base, ...cacheKeyOpts} = opts;
            const key = JSON.stringify([ locString, cacheKeyOpts ]);
            let inf = intlRelCache[key];
            if (!inf) {
                inf = new Intl.RelativeTimeFormat(locString, opts);
                intlRelCache[key] = inf;
            }
            return inf;
        }
        let sysLocaleCache = null;
        function systemLocale() {
            if (sysLocaleCache) return sysLocaleCache; else {
                sysLocaleCache = (new Intl.DateTimeFormat).resolvedOptions().locale;
                return sysLocaleCache;
            }
        }
        function parseLocaleString(localeStr) {
            const uIndex = localeStr.indexOf("-u-");
            if (-1 === uIndex) return [ localeStr ]; else {
                let options;
                const smaller = localeStr.substring(0, uIndex);
                try {
                    options = getCachedDTF(localeStr).resolvedOptions();
                } catch (e) {
                    options = getCachedDTF(smaller).resolvedOptions();
                }
                const {numberingSystem, calendar} = options;
                return [ smaller, numberingSystem, calendar ];
            }
        }
        function intlConfigString(localeStr, numberingSystem, outputCalendar) {
            if (outputCalendar || numberingSystem) {
                localeStr += "-u";
                if (outputCalendar) localeStr += `-ca-${outputCalendar}`;
                if (numberingSystem) localeStr += `-nu-${numberingSystem}`;
                return localeStr;
            } else return localeStr;
        }
        function mapMonths(f) {
            const ms = [];
            for (let i = 1; i <= 12; i++) {
                const dt = DateTime.utc(2016, i, 1);
                ms.push(f(dt));
            }
            return ms;
        }
        function mapWeekdays(f) {
            const ms = [];
            for (let i = 1; i <= 7; i++) {
                const dt = DateTime.utc(2016, 11, 13 + i);
                ms.push(f(dt));
            }
            return ms;
        }
        function listStuff(loc, length, defaultOK, englishFn, intlFn) {
            const mode = loc.listingMode(defaultOK);
            if ("error" === mode) return null; else if ("en" === mode) return englishFn(length); else return intlFn(length);
        }
        function supportsFastNumbers(loc) {
            if (loc.numberingSystem && "latn" !== loc.numberingSystem) return false; else return "latn" === loc.numberingSystem || !loc.locale || loc.locale.startsWith("en") || "latn" === new Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem;
        }
        class PolyNumberFormatter {
            constructor(intl, forceSimple, opts) {
                this.padTo = opts.padTo || 0;
                this.floor = opts.floor || false;
                const {padTo, floor, ...otherOpts} = opts;
                if (!forceSimple || Object.keys(otherOpts).length > 0) {
                    const intlOpts = {
                        useGrouping: false,
                        ...opts
                    };
                    if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
                    this.inf = getCachedINF(intl, intlOpts);
                }
            }
            format(i) {
                if (this.inf) {
                    const fixed = this.floor ? Math.floor(i) : i;
                    return this.inf.format(fixed);
                } else {
                    const fixed = this.floor ? Math.floor(i) : roundTo(i, 3);
                    return padStart(fixed, this.padTo);
                }
            }
        }
        class PolyDateFormatter {
            constructor(dt, intl, opts) {
                this.opts = opts;
                let z;
                if (dt.zone.isUniversal) {
                    const gmtOffset = -1 * (dt.offset / 60);
                    const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
                    if (0 !== dt.offset && IANAZone.create(offsetZ).valid) {
                        z = offsetZ;
                        this.dt = dt;
                    } else {
                        z = "UTC";
                        if (opts.timeZoneName) this.dt = dt; else this.dt = 0 === dt.offset ? dt : DateTime.fromMillis(dt.ts + 60 * dt.offset * 1e3);
                    }
                } else if ("system" === dt.zone.type) this.dt = dt; else {
                    this.dt = dt;
                    z = dt.zone.name;
                }
                const intlOpts = {
                    ...this.opts
                };
                if (z) intlOpts.timeZone = z;
                this.dtf = getCachedDTF(intl, intlOpts);
            }
            format() {
                return this.dtf.format(this.dt.toJSDate());
            }
            formatToParts() {
                return this.dtf.formatToParts(this.dt.toJSDate());
            }
            resolvedOptions() {
                return this.dtf.resolvedOptions();
            }
        }
        class PolyRelFormatter {
            constructor(intl, isEnglish, opts) {
                this.opts = {
                    style: "long",
                    ...opts
                };
                if (!isEnglish && hasRelative()) this.rtf = getCachedRTF(intl, opts);
            }
            format(count, unit) {
                if (this.rtf) return this.rtf.format(count, unit); else return formatRelativeTime(unit, count, this.opts.numeric, "long" !== this.opts.style);
            }
            formatToParts(count, unit) {
                if (this.rtf) return this.rtf.formatToParts(count, unit); else return [];
            }
        }
        class Locale {
            static fromOpts(opts) {
                return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.defaultToEN);
            }
            static create(locale, numberingSystem, outputCalendar, defaultToEN = false) {
                const specifiedLocale = locale || Settings.defaultLocale;
                const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
                const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
                const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
                return new Locale(localeR, numberingSystemR, outputCalendarR, specifiedLocale);
            }
            static resetCache() {
                sysLocaleCache = null;
                intlDTCache = {};
                intlNumCache = {};
                intlRelCache = {};
            }
            static fromObject({locale, numberingSystem, outputCalendar} = {}) {
                return Locale.create(locale, numberingSystem, outputCalendar);
            }
            constructor(locale, numbering, outputCalendar, specifiedLocale) {
                const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);
                this.locale = parsedLocale;
                this.numberingSystem = numbering || parsedNumberingSystem || null;
                this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
                this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
                this.weekdaysCache = {
                    format: {},
                    standalone: {}
                };
                this.monthsCache = {
                    format: {},
                    standalone: {}
                };
                this.meridiemCache = null;
                this.eraCache = {};
                this.specifiedLocale = specifiedLocale;
                this.fastNumbersCached = null;
            }
            get fastNumbers() {
                if (null == this.fastNumbersCached) this.fastNumbersCached = supportsFastNumbers(this);
                return this.fastNumbersCached;
            }
            listingMode() {
                const isActuallyEn = this.isEnglish();
                const hasNoWeirdness = (null === this.numberingSystem || "latn" === this.numberingSystem) && (null === this.outputCalendar || "gregory" === this.outputCalendar);
                return isActuallyEn && hasNoWeirdness ? "en" : "intl";
            }
            clone(alts) {
                if (!alts || 0 === Object.getOwnPropertyNames(alts).length) return this; else return Locale.create(alts.locale || this.specifiedLocale, alts.numberingSystem || this.numberingSystem, alts.outputCalendar || this.outputCalendar, alts.defaultToEN || false);
            }
            redefaultToEN(alts = {}) {
                return this.clone({
                    ...alts,
                    defaultToEN: true
                });
            }
            redefaultToSystem(alts = {}) {
                return this.clone({
                    ...alts,
                    defaultToEN: false
                });
            }
            months(length, format = false, defaultOK = true) {
                return listStuff(this, length, defaultOK, months, (() => {
                    const intl = format ? {
                        month: length,
                        day: "numeric"
                    } : {
                        month: length
                    }, formatStr = format ? "format" : "standalone";
                    if (!this.monthsCache[formatStr][length]) this.monthsCache[formatStr][length] = mapMonths((dt => this.extract(dt, intl, "month")));
                    return this.monthsCache[formatStr][length];
                }));
            }
            weekdays(length, format = false, defaultOK = true) {
                return listStuff(this, length, defaultOK, weekdays, (() => {
                    const intl = format ? {
                        weekday: length,
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    } : {
                        weekday: length
                    }, formatStr = format ? "format" : "standalone";
                    if (!this.weekdaysCache[formatStr][length]) this.weekdaysCache[formatStr][length] = mapWeekdays((dt => this.extract(dt, intl, "weekday")));
                    return this.weekdaysCache[formatStr][length];
                }));
            }
            meridiems(defaultOK = true) {
                return listStuff(this, void 0, defaultOK, (() => meridiems), (() => {
                    if (!this.meridiemCache) {
                        const intl = {
                            hour: "numeric",
                            hourCycle: "h12"
                        };
                        this.meridiemCache = [ DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19) ].map((dt => this.extract(dt, intl, "dayperiod")));
                    }
                    return this.meridiemCache;
                }));
            }
            eras(length, defaultOK = true) {
                return listStuff(this, length, defaultOK, eras, (() => {
                    const intl = {
                        era: length
                    };
                    if (!this.eraCache[length]) this.eraCache[length] = [ DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1) ].map((dt => this.extract(dt, intl, "era")));
                    return this.eraCache[length];
                }));
            }
            extract(dt, intlOpts, field) {
                const df = this.dtFormatter(dt, intlOpts), results = df.formatToParts(), matching = results.find((m => m.type.toLowerCase() === field));
                return matching ? matching.value : null;
            }
            numberFormatter(opts = {}) {
                return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
            }
            dtFormatter(dt, intlOpts = {}) {
                return new PolyDateFormatter(dt, this.intl, intlOpts);
            }
            relFormatter(opts = {}) {
                return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
            }
            listFormatter(opts = {}) {
                return getCachedLF(this.intl, opts);
            }
            isEnglish() {
                return "en" === this.locale || "en-us" === this.locale.toLowerCase() || new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us");
            }
            equals(other) {
                return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
            }
        }
        function combineRegexes(...regexes) {
            const full = regexes.reduce(((f, r) => f + r.source), "");
            return RegExp(`^${full}$`);
        }
        function combineExtractors(...extractors) {
            return m => extractors.reduce((([mergedVals, mergedZone, cursor], ex) => {
                const [val, zone, next] = ex(m, cursor);
                return [ {
                    ...mergedVals,
                    ...val
                }, zone || mergedZone, next ];
            }), [ {}, null, 1 ]).slice(0, 2);
        }
        function parse(s, ...patterns) {
            if (null == s) return [ null, null ];
            for (const [regex, extractor] of patterns) {
                const m = regex.exec(s);
                if (m) return extractor(m);
            }
            return [ null, null ];
        }
        function simpleParse(...keys) {
            return (match, cursor) => {
                const ret = {};
                let i;
                for (i = 0; i < keys.length; i++) ret[keys[i]] = parseInteger(match[cursor + i]);
                return [ ret, null, cursor + i ];
            };
        }
        const offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/;
        const isoExtendedZone = `(?:${offsetRegex.source}?(?:\\[(${ianaRegex.source})\\])?)?`;
        const isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
        const isoTimeRegex = RegExp(`${isoTimeBaseRegex.source}${isoExtendedZone}`);
        const isoTimeExtensionRegex = RegExp(`(?:T${isoTimeRegex.source})?`);
        const isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
        const isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
        const isoOrdinalRegex = /(\d{4})-?(\d{3})/;
        const extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay");
        const extractISOOrdinalData = simpleParse("year", "ordinal");
        const sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/;
        const sqlTimeRegex = RegExp(`${isoTimeBaseRegex.source} ?(?:${offsetRegex.source}|(${ianaRegex.source}))?`);
        const sqlTimeExtensionRegex = RegExp(`(?: ${sqlTimeRegex.source})?`);
        function regexParser_int(match, pos, fallback) {
            const m = match[pos];
            return isUndefined(m) ? fallback : parseInteger(m);
        }
        function extractISOYmd(match, cursor) {
            const item = {
                year: regexParser_int(match, cursor),
                month: regexParser_int(match, cursor + 1, 1),
                day: regexParser_int(match, cursor + 2, 1)
            };
            return [ item, null, cursor + 3 ];
        }
        function extractISOTime(match, cursor) {
            const item = {
                hours: regexParser_int(match, cursor, 0),
                minutes: regexParser_int(match, cursor + 1, 0),
                seconds: regexParser_int(match, cursor + 2, 0),
                milliseconds: parseMillis(match[cursor + 3])
            };
            return [ item, null, cursor + 4 ];
        }
        function extractISOOffset(match, cursor) {
            const local = !match[cursor] && !match[cursor + 1], fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]), zone = local ? null : FixedOffsetZone.instance(fullOffset);
            return [ {}, zone, cursor + 3 ];
        }
        function extractIANAZone(match, cursor) {
            const zone = match[cursor] ? IANAZone.create(match[cursor]) : null;
            return [ {}, zone, cursor + 1 ];
        }
        const isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);
        const isoDuration = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
        function extractISODuration(match) {
            const [s, yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] = match;
            const hasNegativePrefix = "-" === s[0];
            const negativeSeconds = secondStr && "-" === secondStr[0];
            const maybeNegate = (num, force = false) => void 0 !== num && (force || num && hasNegativePrefix) ? -num : num;
            return [ {
                years: maybeNegate(parseFloating(yearStr)),
                months: maybeNegate(parseFloating(monthStr)),
                weeks: maybeNegate(parseFloating(weekStr)),
                days: maybeNegate(parseFloating(dayStr)),
                hours: maybeNegate(parseFloating(hourStr)),
                minutes: maybeNegate(parseFloating(minuteStr)),
                seconds: maybeNegate(parseFloating(secondStr), "-0" === secondStr),
                milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds)
            } ];
        }
        const obsOffsets = {
            GMT: 0,
            EDT: -4 * 60,
            EST: -5 * 60,
            CDT: -5 * 60,
            CST: -6 * 60,
            MDT: -6 * 60,
            MST: -7 * 60,
            PDT: -7 * 60,
            PST: -8 * 60
        };
        function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
            const result = {
                year: 2 === yearStr.length ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
                month: monthsShort.indexOf(monthStr) + 1,
                day: parseInteger(dayStr),
                hour: parseInteger(hourStr),
                minute: parseInteger(minuteStr)
            };
            if (secondStr) result.second = parseInteger(secondStr);
            if (weekdayStr) result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
            return result;
        }
        const rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
        function extractRFC2822(match) {
            const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr, obsOffset, milOffset, offHourStr, offMinuteStr] = match, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
            let offset;
            if (obsOffset) offset = obsOffsets[obsOffset]; else if (milOffset) offset = 0; else offset = signedOffset(offHourStr, offMinuteStr);
            return [ result, new FixedOffsetZone(offset) ];
        }
        function preprocessRFC2822(s) {
            return s.replace(/\([^)]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
        }
        const rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/, rfc850 = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/, ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
        function extractRFC1123Or850(match) {
            const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
            return [ result, FixedOffsetZone.utcInstance ];
        }
        function extractASCII(match) {
            const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
            return [ result, FixedOffsetZone.utcInstance ];
        }
        const isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
        const isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
        const isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
        const isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
        const extractISOYmdTimeAndOffset = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset, extractIANAZone);
        const extractISOWeekTimeAndOffset = combineExtractors(extractISOWeekData, extractISOTime, extractISOOffset, extractIANAZone);
        const extractISOOrdinalDateAndTime = combineExtractors(extractISOOrdinalData, extractISOTime, extractISOOffset, extractIANAZone);
        const extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
        function parseISODate(s) {
            return parse(s, [ isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset ], [ isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset ], [ isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime ], [ isoTimeCombinedRegex, extractISOTimeAndOffset ]);
        }
        function parseRFC2822Date(s) {
            return parse(preprocessRFC2822(s), [ rfc2822, extractRFC2822 ]);
        }
        function parseHTTPDate(s) {
            return parse(s, [ rfc1123, extractRFC1123Or850 ], [ rfc850, extractRFC1123Or850 ], [ ascii, extractASCII ]);
        }
        function parseISODuration(s) {
            return parse(s, [ isoDuration, extractISODuration ]);
        }
        const extractISOTimeOnly = combineExtractors(extractISOTime);
        function parseISOTimeOnly(s) {
            return parse(s, [ isoTimeOnly, extractISOTimeOnly ]);
        }
        const sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
        const sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
        const extractISOTimeOffsetAndIANAZone = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
        function parseSQL(s) {
            return parse(s, [ sqlYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset ], [ sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone ]);
        }
        const INVALID = "Invalid Duration";
        const lowOrderMatrix = {
            weeks: {
                days: 7,
                hours: 7 * 24,
                minutes: 7 * 24 * 60,
                seconds: 7 * 24 * 60 * 60,
                milliseconds: 7 * 24 * 60 * 60 * 1e3
            },
            days: {
                hours: 24,
                minutes: 24 * 60,
                seconds: 24 * 60 * 60,
                milliseconds: 24 * 60 * 60 * 1e3
            },
            hours: {
                minutes: 60,
                seconds: 60 * 60,
                milliseconds: 60 * 60 * 1e3
            },
            minutes: {
                seconds: 60,
                milliseconds: 60 * 1e3
            },
            seconds: {
                milliseconds: 1e3
            }
        }, casualMatrix = {
            years: {
                quarters: 4,
                months: 12,
                weeks: 52,
                days: 365,
                hours: 365 * 24,
                minutes: 365 * 24 * 60,
                seconds: 365 * 24 * 60 * 60,
                milliseconds: 365 * 24 * 60 * 60 * 1e3
            },
            quarters: {
                months: 3,
                weeks: 13,
                days: 91,
                hours: 91 * 24,
                minutes: 91 * 24 * 60,
                seconds: 91 * 24 * 60 * 60,
                milliseconds: 91 * 24 * 60 * 60 * 1e3
            },
            months: {
                weeks: 4,
                days: 30,
                hours: 30 * 24,
                minutes: 30 * 24 * 60,
                seconds: 30 * 24 * 60 * 60,
                milliseconds: 30 * 24 * 60 * 60 * 1e3
            },
            ...lowOrderMatrix
        }, daysInYearAccurate = 146097 / 400, daysInMonthAccurate = 146097 / 4800, accurateMatrix = {
            years: {
                quarters: 4,
                months: 12,
                weeks: daysInYearAccurate / 7,
                days: daysInYearAccurate,
                hours: 24 * daysInYearAccurate,
                minutes: 24 * daysInYearAccurate * 60,
                seconds: 24 * daysInYearAccurate * 60 * 60,
                milliseconds: 24 * daysInYearAccurate * 60 * 60 * 1e3
            },
            quarters: {
                months: 3,
                weeks: daysInYearAccurate / 28,
                days: daysInYearAccurate / 4,
                hours: 24 * daysInYearAccurate / 4,
                minutes: 24 * daysInYearAccurate * 60 / 4,
                seconds: 24 * daysInYearAccurate * 60 * 60 / 4,
                milliseconds: 24 * daysInYearAccurate * 60 * 60 * 1e3 / 4
            },
            months: {
                weeks: daysInMonthAccurate / 7,
                days: daysInMonthAccurate,
                hours: 24 * daysInMonthAccurate,
                minutes: 24 * daysInMonthAccurate * 60,
                seconds: 24 * daysInMonthAccurate * 60 * 60,
                milliseconds: 24 * daysInMonthAccurate * 60 * 60 * 1e3
            },
            ...lowOrderMatrix
        };
        const orderedUnits = [ "years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds" ];
        const reverseUnits = orderedUnits.slice(0).reverse();
        function clone(dur, alts, clear = false) {
            const conf = {
                values: clear ? alts.values : {
                    ...dur.values,
                    ...alts.values || {}
                },
                loc: dur.loc.clone(alts.loc),
                conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy
            };
            return new Duration(conf);
        }
        function antiTrunc(n) {
            return n < 0 ? Math.floor(n) : Math.ceil(n);
        }
        function convert(matrix, fromMap, fromUnit, toMap, toUnit) {
            const conv = matrix[toUnit][fromUnit], raw = fromMap[fromUnit] / conv, sameSign = Math.sign(raw) === Math.sign(toMap[toUnit]), added = !sameSign && 0 !== toMap[toUnit] && Math.abs(raw) <= 1 ? antiTrunc(raw) : Math.trunc(raw);
            toMap[toUnit] += added;
            fromMap[fromUnit] -= added * conv;
        }
        function normalizeValues(matrix, vals) {
            reverseUnits.reduce(((previous, current) => {
                if (!isUndefined(vals[current])) {
                    if (previous) convert(matrix, vals, previous, vals, current);
                    return current;
                } else return previous;
            }), null);
        }
        class Duration {
            constructor(config) {
                const accurate = "longterm" === config.conversionAccuracy || false;
                this.values = config.values;
                this.loc = config.loc || Locale.create();
                this.conversionAccuracy = accurate ? "longterm" : "casual";
                this.invalid = config.invalid || null;
                this.matrix = accurate ? accurateMatrix : casualMatrix;
                this.isLuxonDuration = true;
            }
            static fromMillis(count, opts) {
                return Duration.fromObject({
                    milliseconds: count
                }, opts);
            }
            static fromObject(obj, opts = {}) {
                if (null == obj || "object" !== typeof obj) throw new InvalidArgumentError(`Duration.fromObject: argument expected to be an object, got ${null === obj ? "null" : typeof obj}`);
                return new Duration({
                    values: normalizeObject(obj, Duration.normalizeUnit),
                    loc: Locale.fromObject(opts),
                    conversionAccuracy: opts.conversionAccuracy
                });
            }
            static fromDurationLike(durationLike) {
                if (isNumber(durationLike)) return Duration.fromMillis(durationLike); else if (Duration.isDuration(durationLike)) return durationLike; else if ("object" === typeof durationLike) return Duration.fromObject(durationLike); else throw new InvalidArgumentError(`Unknown duration argument ${durationLike} of type ${typeof durationLike}`);
            }
            static fromISO(text, opts) {
                const [parsed] = parseISODuration(text);
                if (parsed) return Duration.fromObject(parsed, opts); else return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
            }
            static fromISOTime(text, opts) {
                const [parsed] = parseISOTimeOnly(text);
                if (parsed) return Duration.fromObject(parsed, opts); else return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
            }
            static invalid(reason, explanation = null) {
                if (!reason) throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
                const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
                if (Settings.throwOnInvalid) throw new InvalidDurationError(invalid); else return new Duration({
                    invalid
                });
            }
            static normalizeUnit(unit) {
                const normalized = {
                    year: "years",
                    years: "years",
                    quarter: "quarters",
                    quarters: "quarters",
                    month: "months",
                    months: "months",
                    week: "weeks",
                    weeks: "weeks",
                    day: "days",
                    days: "days",
                    hour: "hours",
                    hours: "hours",
                    minute: "minutes",
                    minutes: "minutes",
                    second: "seconds",
                    seconds: "seconds",
                    millisecond: "milliseconds",
                    milliseconds: "milliseconds"
                }[unit ? unit.toLowerCase() : unit];
                if (!normalized) throw new InvalidUnitError(unit);
                return normalized;
            }
            static isDuration(o) {
                return o && o.isLuxonDuration || false;
            }
            get locale() {
                return this.isValid ? this.loc.locale : null;
            }
            get numberingSystem() {
                return this.isValid ? this.loc.numberingSystem : null;
            }
            toFormat(fmt, opts = {}) {
                const fmtOpts = {
                    ...opts,
                    floor: false !== opts.round && false !== opts.floor
                };
                return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID;
            }
            toHuman(opts = {}) {
                const l = orderedUnits.map((unit => {
                    const val = this.values[unit];
                    if (isUndefined(val)) return null;
                    return this.loc.numberFormatter({
                        style: "unit",
                        unitDisplay: "long",
                        ...opts,
                        unit: unit.slice(0, -1)
                    }).format(val);
                })).filter((n => n));
                return this.loc.listFormatter({
                    type: "conjunction",
                    style: opts.listStyle || "narrow",
                    ...opts
                }).format(l);
            }
            toObject() {
                if (!this.isValid) return {};
                return {
                    ...this.values
                };
            }
            toISO() {
                if (!this.isValid) return null;
                let s = "P";
                if (0 !== this.years) s += this.years + "Y";
                if (0 !== this.months || 0 !== this.quarters) s += this.months + 3 * this.quarters + "M";
                if (0 !== this.weeks) s += this.weeks + "W";
                if (0 !== this.days) s += this.days + "D";
                if (0 !== this.hours || 0 !== this.minutes || 0 !== this.seconds || 0 !== this.milliseconds) s += "T";
                if (0 !== this.hours) s += this.hours + "H";
                if (0 !== this.minutes) s += this.minutes + "M";
                if (0 !== this.seconds || 0 !== this.milliseconds) s += roundTo(this.seconds + this.milliseconds / 1e3, 3) + "S";
                if ("P" === s) s += "T0S";
                return s;
            }
            toISOTime(opts = {}) {
                if (!this.isValid) return null;
                const millis = this.toMillis();
                if (millis < 0 || millis >= 864e5) return null;
                opts = {
                    suppressMilliseconds: false,
                    suppressSeconds: false,
                    includePrefix: false,
                    format: "extended",
                    ...opts
                };
                const value = this.shiftTo("hours", "minutes", "seconds", "milliseconds");
                let fmt = "basic" === opts.format ? "hhmm" : "hh:mm";
                if (!opts.suppressSeconds || 0 !== value.seconds || 0 !== value.milliseconds) {
                    fmt += "basic" === opts.format ? "ss" : ":ss";
                    if (!opts.suppressMilliseconds || 0 !== value.milliseconds) fmt += ".SSS";
                }
                let str = value.toFormat(fmt);
                if (opts.includePrefix) str = "T" + str;
                return str;
            }
            toJSON() {
                return this.toISO();
            }
            toString() {
                return this.toISO();
            }
            toMillis() {
                return this.as("milliseconds");
            }
            valueOf() {
                return this.toMillis();
            }
            plus(duration) {
                if (!this.isValid) return this;
                const dur = Duration.fromDurationLike(duration), result = {};
                for (const k of orderedUnits) if (util_hasOwnProperty(dur.values, k) || util_hasOwnProperty(this.values, k)) result[k] = dur.get(k) + this.get(k);
                return clone(this, {
                    values: result
                }, true);
            }
            minus(duration) {
                if (!this.isValid) return this;
                const dur = Duration.fromDurationLike(duration);
                return this.plus(dur.negate());
            }
            mapUnits(fn) {
                if (!this.isValid) return this;
                const result = {};
                for (const k of Object.keys(this.values)) result[k] = asNumber(fn(this.values[k], k));
                return clone(this, {
                    values: result
                }, true);
            }
            get(unit) {
                return this[Duration.normalizeUnit(unit)];
            }
            set(values) {
                if (!this.isValid) return this;
                const mixed = {
                    ...this.values,
                    ...normalizeObject(values, Duration.normalizeUnit)
                };
                return clone(this, {
                    values: mixed
                });
            }
            reconfigure({locale, numberingSystem, conversionAccuracy} = {}) {
                const loc = this.loc.clone({
                    locale,
                    numberingSystem
                }), opts = {
                    loc
                };
                if (conversionAccuracy) opts.conversionAccuracy = conversionAccuracy;
                return clone(this, opts);
            }
            as(unit) {
                return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
            }
            normalize() {
                if (!this.isValid) return this;
                const vals = this.toObject();
                normalizeValues(this.matrix, vals);
                return clone(this, {
                    values: vals
                }, true);
            }
            shiftTo(...units) {
                if (!this.isValid) return this;
                if (0 === units.length) return this;
                units = units.map((u => Duration.normalizeUnit(u)));
                const built = {}, accumulated = {}, vals = this.toObject();
                let lastUnit;
                for (const k of orderedUnits) if (units.indexOf(k) >= 0) {
                    lastUnit = k;
                    let own = 0;
                    for (const ak in accumulated) {
                        own += this.matrix[ak][k] * accumulated[ak];
                        accumulated[ak] = 0;
                    }
                    if (isNumber(vals[k])) own += vals[k];
                    const i = Math.trunc(own);
                    built[k] = i;
                    accumulated[k] = (1e3 * own - 1e3 * i) / 1e3;
                    for (const down in vals) if (orderedUnits.indexOf(down) > orderedUnits.indexOf(k)) convert(this.matrix, vals, down, built, k);
                } else if (isNumber(vals[k])) accumulated[k] = vals[k];
                for (const key in accumulated) if (0 !== accumulated[key]) built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
                return clone(this, {
                    values: built
                }, true).normalize();
            }
            negate() {
                if (!this.isValid) return this;
                const negated = {};
                for (const k of Object.keys(this.values)) negated[k] = 0 === this.values[k] ? 0 : -this.values[k];
                return clone(this, {
                    values: negated
                }, true);
            }
            get years() {
                return this.isValid ? this.values.years || 0 : NaN;
            }
            get quarters() {
                return this.isValid ? this.values.quarters || 0 : NaN;
            }
            get months() {
                return this.isValid ? this.values.months || 0 : NaN;
            }
            get weeks() {
                return this.isValid ? this.values.weeks || 0 : NaN;
            }
            get days() {
                return this.isValid ? this.values.days || 0 : NaN;
            }
            get hours() {
                return this.isValid ? this.values.hours || 0 : NaN;
            }
            get minutes() {
                return this.isValid ? this.values.minutes || 0 : NaN;
            }
            get seconds() {
                return this.isValid ? this.values.seconds || 0 : NaN;
            }
            get milliseconds() {
                return this.isValid ? this.values.milliseconds || 0 : NaN;
            }
            get isValid() {
                return null === this.invalid;
            }
            get invalidReason() {
                return this.invalid ? this.invalid.reason : null;
            }
            get invalidExplanation() {
                return this.invalid ? this.invalid.explanation : null;
            }
            equals(other) {
                if (!this.isValid || !other.isValid) return false;
                if (!this.loc.equals(other.loc)) return false;
                function eq(v1, v2) {
                    if (void 0 === v1 || 0 === v1) return void 0 === v2 || 0 === v2;
                    return v1 === v2;
                }
                for (const u of orderedUnits) if (!eq(this.values[u], other.values[u])) return false;
                return true;
            }
        }
        const interval_INVALID = "Invalid Interval";
        function validateStartEnd(start, end) {
            if (!start || !start.isValid) return Interval.invalid("missing or invalid start"); else if (!end || !end.isValid) return Interval.invalid("missing or invalid end"); else if (end < start) return Interval.invalid("end before start", `The end of an interval must be after its start, but you had start=${start.toISO()} and end=${end.toISO()}`); else return null;
        }
        class Interval {
            constructor(config) {
                this.s = config.start;
                this.e = config.end;
                this.invalid = config.invalid || null;
                this.isLuxonInterval = true;
            }
            static invalid(reason, explanation = null) {
                if (!reason) throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
                const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
                if (Settings.throwOnInvalid) throw new InvalidIntervalError(invalid); else return new Interval({
                    invalid
                });
            }
            static fromDateTimes(start, end) {
                const builtStart = friendlyDateTime(start), builtEnd = friendlyDateTime(end);
                const validateError = validateStartEnd(builtStart, builtEnd);
                if (null == validateError) return new Interval({
                    start: builtStart,
                    end: builtEnd
                }); else return validateError;
            }
            static after(start, duration) {
                const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(start);
                return Interval.fromDateTimes(dt, dt.plus(dur));
            }
            static before(end, duration) {
                const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(end);
                return Interval.fromDateTimes(dt.minus(dur), dt);
            }
            static fromISO(text, opts) {
                const [s, e] = (text || "").split("/", 2);
                if (s && e) {
                    let start, startIsValid;
                    try {
                        start = DateTime.fromISO(s, opts);
                        startIsValid = start.isValid;
                    } catch (e) {
                        startIsValid = false;
                    }
                    let end, endIsValid;
                    try {
                        end = DateTime.fromISO(e, opts);
                        endIsValid = end.isValid;
                    } catch (e) {
                        endIsValid = false;
                    }
                    if (startIsValid && endIsValid) return Interval.fromDateTimes(start, end);
                    if (startIsValid) {
                        const dur = Duration.fromISO(e, opts);
                        if (dur.isValid) return Interval.after(start, dur);
                    } else if (endIsValid) {
                        const dur = Duration.fromISO(s, opts);
                        if (dur.isValid) return Interval.before(end, dur);
                    }
                }
                return Interval.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
            }
            static isInterval(o) {
                return o && o.isLuxonInterval || false;
            }
            get start() {
                return this.isValid ? this.s : null;
            }
            get end() {
                return this.isValid ? this.e : null;
            }
            get isValid() {
                return null === this.invalidReason;
            }
            get invalidReason() {
                return this.invalid ? this.invalid.reason : null;
            }
            get invalidExplanation() {
                return this.invalid ? this.invalid.explanation : null;
            }
            length(unit = "milliseconds") {
                return this.isValid ? this.toDuration(unit).get(unit) : NaN;
            }
            count(unit = "milliseconds") {
                if (!this.isValid) return NaN;
                const start = this.start.startOf(unit), end = this.end.startOf(unit);
                return Math.floor(end.diff(start, unit).get(unit)) + 1;
            }
            hasSame(unit) {
                return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
            }
            isEmpty() {
                return this.s.valueOf() === this.e.valueOf();
            }
            isAfter(dateTime) {
                if (!this.isValid) return false;
                return this.s > dateTime;
            }
            isBefore(dateTime) {
                if (!this.isValid) return false;
                return this.e <= dateTime;
            }
            contains(dateTime) {
                if (!this.isValid) return false;
                return this.s <= dateTime && this.e > dateTime;
            }
            set({start, end} = {}) {
                if (!this.isValid) return this;
                return Interval.fromDateTimes(start || this.s, end || this.e);
            }
            splitAt(...dateTimes) {
                if (!this.isValid) return [];
                const sorted = dateTimes.map(friendlyDateTime).filter((d => this.contains(d))).sort(), results = [];
                let {s} = this, i = 0;
                while (s < this.e) {
                    const added = sorted[i] || this.e, next = +added > +this.e ? this.e : added;
                    results.push(Interval.fromDateTimes(s, next));
                    s = next;
                    i += 1;
                }
                return results;
            }
            splitBy(duration) {
                const dur = Duration.fromDurationLike(duration);
                if (!this.isValid || !dur.isValid || 0 === dur.as("milliseconds")) return [];
                let next, {s} = this, idx = 1;
                const results = [];
                while (s < this.e) {
                    const added = this.start.plus(dur.mapUnits((x => x * idx)));
                    next = +added > +this.e ? this.e : added;
                    results.push(Interval.fromDateTimes(s, next));
                    s = next;
                    idx += 1;
                }
                return results;
            }
            divideEqually(numberOfParts) {
                if (!this.isValid) return [];
                return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
            }
            overlaps(other) {
                return this.e > other.s && this.s < other.e;
            }
            abutsStart(other) {
                if (!this.isValid) return false;
                return +this.e === +other.s;
            }
            abutsEnd(other) {
                if (!this.isValid) return false;
                return +other.e === +this.s;
            }
            engulfs(other) {
                if (!this.isValid) return false;
                return this.s <= other.s && this.e >= other.e;
            }
            equals(other) {
                if (!this.isValid || !other.isValid) return false;
                return this.s.equals(other.s) && this.e.equals(other.e);
            }
            intersection(other) {
                if (!this.isValid) return this;
                const s = this.s > other.s ? this.s : other.s, e = this.e < other.e ? this.e : other.e;
                if (s >= e) return null; else return Interval.fromDateTimes(s, e);
            }
            union(other) {
                if (!this.isValid) return this;
                const s = this.s < other.s ? this.s : other.s, e = this.e > other.e ? this.e : other.e;
                return Interval.fromDateTimes(s, e);
            }
            static merge(intervals) {
                const [found, final] = intervals.sort(((a, b) => a.s - b.s)).reduce((([sofar, current], item) => {
                    if (!current) return [ sofar, item ]; else if (current.overlaps(item) || current.abutsStart(item)) return [ sofar, current.union(item) ]; else return [ sofar.concat([ current ]), item ];
                }), [ [], null ]);
                if (final) found.push(final);
                return found;
            }
            static xor(intervals) {
                let start = null, currentCount = 0;
                const results = [], ends = intervals.map((i => [ {
                    time: i.s,
                    type: "s"
                }, {
                    time: i.e,
                    type: "e"
                } ])), flattened = Array.prototype.concat(...ends), arr = flattened.sort(((a, b) => a.time - b.time));
                for (const i of arr) {
                    currentCount += "s" === i.type ? 1 : -1;
                    if (1 === currentCount) start = i.time; else {
                        if (start && +start !== +i.time) results.push(Interval.fromDateTimes(start, i.time));
                        start = null;
                    }
                }
                return Interval.merge(results);
            }
            difference(...intervals) {
                return Interval.xor([ this ].concat(intervals)).map((i => this.intersection(i))).filter((i => i && !i.isEmpty()));
            }
            toString() {
                if (!this.isValid) return interval_INVALID;
                return `[${this.s.toISO()} – ${this.e.toISO()})`;
            }
            toISO(opts) {
                if (!this.isValid) return interval_INVALID;
                return `${this.s.toISO(opts)}/${this.e.toISO(opts)}`;
            }
            toISODate() {
                if (!this.isValid) return interval_INVALID;
                return `${this.s.toISODate()}/${this.e.toISODate()}`;
            }
            toISOTime(opts) {
                if (!this.isValid) return interval_INVALID;
                return `${this.s.toISOTime(opts)}/${this.e.toISOTime(opts)}`;
            }
            toFormat(dateFormat, {separator = " – "} = {}) {
                if (!this.isValid) return interval_INVALID;
                return `${this.s.toFormat(dateFormat)}${separator}${this.e.toFormat(dateFormat)}`;
            }
            toDuration(unit, opts) {
                if (!this.isValid) return Duration.invalid(this.invalidReason);
                return this.e.diff(this.s, unit, opts);
            }
            mapEndpoints(mapFn) {
                return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
            }
        }
        class Info {
            static hasDST(zone = Settings.defaultZone) {
                const proto = DateTime.now().setZone(zone).set({
                    month: 12
                });
                return !zone.isUniversal && proto.offset !== proto.set({
                    month: 6
                }).offset;
            }
            static isValidIANAZone(zone) {
                return IANAZone.isValidZone(zone);
            }
            static normalizeZone(input) {
                return normalizeZone(input, Settings.defaultZone);
            }
            static months(length = "long", {locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory"} = {}) {
                return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length);
            }
            static monthsFormat(length = "long", {locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory"} = {}) {
                return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length, true);
            }
            static weekdays(length = "long", {locale = null, numberingSystem = null, locObj = null} = {}) {
                return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length);
            }
            static weekdaysFormat(length = "long", {locale = null, numberingSystem = null, locObj = null} = {}) {
                return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length, true);
            }
            static meridiems({locale = null} = {}) {
                return Locale.create(locale).meridiems();
            }
            static eras(length = "short", {locale = null} = {}) {
                return Locale.create(locale, null, "gregory").eras(length);
            }
            static features() {
                return {
                    relative: hasRelative()
                };
            }
        }
        function dayDiff(earlier, later) {
            const utcDayStart = dt => dt.toUTC(0, {
                keepLocalTime: true
            }).startOf("day").valueOf(), ms = utcDayStart(later) - utcDayStart(earlier);
            return Math.floor(Duration.fromMillis(ms).as("days"));
        }
        function highOrderDiffs(cursor, later, units) {
            const differs = [ [ "years", (a, b) => b.year - a.year ], [ "quarters", (a, b) => b.quarter - a.quarter ], [ "months", (a, b) => b.month - a.month + 12 * (b.year - a.year) ], [ "weeks", (a, b) => {
                const days = dayDiff(a, b);
                return (days - days % 7) / 7;
            } ], [ "days", dayDiff ] ];
            const results = {};
            let lowestOrder, highWater;
            for (const [unit, differ] of differs) if (units.indexOf(unit) >= 0) {
                lowestOrder = unit;
                let delta = differ(cursor, later);
                highWater = cursor.plus({
                    [unit]: delta
                });
                if (highWater > later) {
                    cursor = cursor.plus({
                        [unit]: delta - 1
                    });
                    delta -= 1;
                } else cursor = highWater;
                results[unit] = delta;
            }
            return [ cursor, results, highWater, lowestOrder ];
        }
        function diff(earlier, later, units, opts) {
            let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);
            const remainingMillis = later - cursor;
            const lowerOrderUnits = units.filter((u => [ "hours", "minutes", "seconds", "milliseconds" ].indexOf(u) >= 0));
            if (0 === lowerOrderUnits.length) {
                if (highWater < later) highWater = cursor.plus({
                    [lowestOrder]: 1
                });
                if (highWater !== cursor) results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
            }
            const duration = Duration.fromObject(results, opts);
            if (lowerOrderUnits.length > 0) return Duration.fromMillis(remainingMillis, opts).shiftTo(...lowerOrderUnits).plus(duration); else return duration;
        }
        const numberingSystems = {
            arab: "[٠-٩]",
            arabext: "[۰-۹]",
            bali: "[᭐-᭙]",
            beng: "[০-৯]",
            deva: "[०-९]",
            fullwide: "[０-９]",
            gujr: "[૦-૯]",
            hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
            khmr: "[០-៩]",
            knda: "[೦-೯]",
            laoo: "[໐-໙]",
            limb: "[᥆-᥏]",
            mlym: "[൦-൯]",
            mong: "[᠐-᠙]",
            mymr: "[၀-၉]",
            orya: "[୦-୯]",
            tamldec: "[௦-௯]",
            telu: "[౦-౯]",
            thai: "[๐-๙]",
            tibt: "[༠-༩]",
            latn: "\\d"
        };
        const numberingSystemsUTF16 = {
            arab: [ 1632, 1641 ],
            arabext: [ 1776, 1785 ],
            bali: [ 6992, 7001 ],
            beng: [ 2534, 2543 ],
            deva: [ 2406, 2415 ],
            fullwide: [ 65296, 65303 ],
            gujr: [ 2790, 2799 ],
            khmr: [ 6112, 6121 ],
            knda: [ 3302, 3311 ],
            laoo: [ 3792, 3801 ],
            limb: [ 6470, 6479 ],
            mlym: [ 3430, 3439 ],
            mong: [ 6160, 6169 ],
            mymr: [ 4160, 4169 ],
            orya: [ 2918, 2927 ],
            tamldec: [ 3046, 3055 ],
            telu: [ 3174, 3183 ],
            thai: [ 3664, 3673 ],
            tibt: [ 3872, 3881 ]
        };
        const hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
        function parseDigits(str) {
            let value = parseInt(str, 10);
            if (isNaN(value)) {
                value = "";
                for (let i = 0; i < str.length; i++) {
                    const code = str.charCodeAt(i);
                    if (-1 !== str[i].search(numberingSystems.hanidec)) value += hanidecChars.indexOf(str[i]); else for (const key in numberingSystemsUTF16) {
                        const [min, max] = numberingSystemsUTF16[key];
                        if (code >= min && code <= max) value += code - min;
                    }
                }
                return parseInt(value, 10);
            } else return value;
        }
        function digitRegex({numberingSystem}, append = "") {
            return new RegExp(`${numberingSystems[numberingSystem || "latn"]}${append}`);
        }
        const MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";
        function intUnit(regex, post = (i => i)) {
            return {
                regex,
                deser: ([s]) => post(parseDigits(s))
            };
        }
        const NBSP = String.fromCharCode(160);
        const spaceOrNBSP = `[ ${NBSP}]`;
        const spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");
        function fixListRegex(s) {
            return s.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
        }
        function stripInsensitivities(s) {
            return s.replace(/\./g, "").replace(spaceOrNBSPRegExp, " ").toLowerCase();
        }
        function oneOf(strings, startIndex) {
            if (null === strings) return null; else return {
                regex: RegExp(strings.map(fixListRegex).join("|")),
                deser: ([s]) => strings.findIndex((i => stripInsensitivities(s) === stripInsensitivities(i))) + startIndex
            };
        }
        function offset(regex, groups) {
            return {
                regex,
                deser: ([, h, m]) => signedOffset(h, m),
                groups
            };
        }
        function simple(regex) {
            return {
                regex,
                deser: ([s]) => s
            };
        }
        function escapeToken(value) {
            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
        }
        function unitForToken(token, loc) {
            const one = digitRegex(loc), two = digitRegex(loc, "{2}"), three = digitRegex(loc, "{3}"), four = digitRegex(loc, "{4}"), six = digitRegex(loc, "{6}"), oneOrTwo = digitRegex(loc, "{1,2}"), oneToThree = digitRegex(loc, "{1,3}"), oneToSix = digitRegex(loc, "{1,6}"), oneToNine = digitRegex(loc, "{1,9}"), twoToFour = digitRegex(loc, "{2,4}"), fourToSix = digitRegex(loc, "{4,6}"), literal = t => ({
                regex: RegExp(escapeToken(t.val)),
                deser: ([s]) => s,
                literal: true
            }), unitate = t => {
                if (token.literal) return literal(t);
                switch (t.val) {
                  case "G":
                    return oneOf(loc.eras("short", false), 0);

                  case "GG":
                    return oneOf(loc.eras("long", false), 0);

                  case "y":
                    return intUnit(oneToSix);

                  case "yy":
                    return intUnit(twoToFour, untruncateYear);

                  case "yyyy":
                    return intUnit(four);

                  case "yyyyy":
                    return intUnit(fourToSix);

                  case "yyyyyy":
                    return intUnit(six);

                  case "M":
                    return intUnit(oneOrTwo);

                  case "MM":
                    return intUnit(two);

                  case "MMM":
                    return oneOf(loc.months("short", true, false), 1);

                  case "MMMM":
                    return oneOf(loc.months("long", true, false), 1);

                  case "L":
                    return intUnit(oneOrTwo);

                  case "LL":
                    return intUnit(two);

                  case "LLL":
                    return oneOf(loc.months("short", false, false), 1);

                  case "LLLL":
                    return oneOf(loc.months("long", false, false), 1);

                  case "d":
                    return intUnit(oneOrTwo);

                  case "dd":
                    return intUnit(two);

                  case "o":
                    return intUnit(oneToThree);

                  case "ooo":
                    return intUnit(three);

                  case "HH":
                    return intUnit(two);

                  case "H":
                    return intUnit(oneOrTwo);

                  case "hh":
                    return intUnit(two);

                  case "h":
                    return intUnit(oneOrTwo);

                  case "mm":
                    return intUnit(two);

                  case "m":
                    return intUnit(oneOrTwo);

                  case "q":
                    return intUnit(oneOrTwo);

                  case "qq":
                    return intUnit(two);

                  case "s":
                    return intUnit(oneOrTwo);

                  case "ss":
                    return intUnit(two);

                  case "S":
                    return intUnit(oneToThree);

                  case "SSS":
                    return intUnit(three);

                  case "u":
                    return simple(oneToNine);

                  case "uu":
                    return simple(oneOrTwo);

                  case "uuu":
                    return intUnit(one);

                  case "a":
                    return oneOf(loc.meridiems(), 0);

                  case "kkkk":
                    return intUnit(four);

                  case "kk":
                    return intUnit(twoToFour, untruncateYear);

                  case "W":
                    return intUnit(oneOrTwo);

                  case "WW":
                    return intUnit(two);

                  case "E":
                  case "c":
                    return intUnit(one);

                  case "EEE":
                    return oneOf(loc.weekdays("short", false, false), 1);

                  case "EEEE":
                    return oneOf(loc.weekdays("long", false, false), 1);

                  case "ccc":
                    return oneOf(loc.weekdays("short", true, false), 1);

                  case "cccc":
                    return oneOf(loc.weekdays("long", true, false), 1);

                  case "Z":
                  case "ZZ":
                    return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);

                  case "ZZZ":
                    return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);

                  case "z":
                    return simple(/[a-z_+-/]{1,256}?/i);

                  default:
                    return literal(t);
                }
            };
            const unit = unitate(token) || {
                invalidReason: MISSING_FTP
            };
            unit.token = token;
            return unit;
        }
        const partTypeStyleToTokenVal = {
            year: {
                "2-digit": "yy",
                numeric: "yyyyy"
            },
            month: {
                numeric: "M",
                "2-digit": "MM",
                short: "MMM",
                long: "MMMM"
            },
            day: {
                numeric: "d",
                "2-digit": "dd"
            },
            weekday: {
                short: "EEE",
                long: "EEEE"
            },
            dayperiod: "a",
            dayPeriod: "a",
            hour: {
                numeric: "h",
                "2-digit": "hh"
            },
            minute: {
                numeric: "m",
                "2-digit": "mm"
            },
            second: {
                numeric: "s",
                "2-digit": "ss"
            }
        };
        function tokenForPart(part, locale, formatOpts) {
            const {type, value} = part;
            if ("literal" === type) return {
                literal: true,
                val: value
            };
            const style = formatOpts[type];
            let val = partTypeStyleToTokenVal[type];
            if ("object" === typeof val) val = val[style];
            if (val) return {
                literal: false,
                val
            };
            return;
        }
        function buildRegex(units) {
            const re = units.map((u => u.regex)).reduce(((f, r) => `${f}(${r.source})`), "");
            return [ `^${re}$`, units ];
        }
        function match(input, regex, handlers) {
            const matches = input.match(regex);
            if (matches) {
                const all = {};
                let matchIndex = 1;
                for (const i in handlers) if (util_hasOwnProperty(handlers, i)) {
                    const h = handlers[i], groups = h.groups ? h.groups + 1 : 1;
                    if (!h.literal && h.token) all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
                    matchIndex += groups;
                }
                return [ matches, all ];
            } else return [ matches, {} ];
        }
        function dateTimeFromMatches(matches) {
            const toField = token => {
                switch (token) {
                  case "S":
                    return "millisecond";

                  case "s":
                    return "second";

                  case "m":
                    return "minute";

                  case "h":
                  case "H":
                    return "hour";

                  case "d":
                    return "day";

                  case "o":
                    return "ordinal";

                  case "L":
                  case "M":
                    return "month";

                  case "y":
                    return "year";

                  case "E":
                  case "c":
                    return "weekday";

                  case "W":
                    return "weekNumber";

                  case "k":
                    return "weekYear";

                  case "q":
                    return "quarter";

                  default:
                    return null;
                }
            };
            let zone = null;
            let specificOffset;
            if (!isUndefined(matches.z)) zone = IANAZone.create(matches.z);
            if (!isUndefined(matches.Z)) {
                if (!zone) zone = new FixedOffsetZone(matches.Z);
                specificOffset = matches.Z;
            }
            if (!isUndefined(matches.q)) matches.M = 3 * (matches.q - 1) + 1;
            if (!isUndefined(matches.h)) if (matches.h < 12 && 1 === matches.a) matches.h += 12; else if (12 === matches.h && 0 === matches.a) matches.h = 0;
            if (0 === matches.G && matches.y) matches.y = -matches.y;
            if (!isUndefined(matches.u)) matches.S = parseMillis(matches.u);
            const vals = Object.keys(matches).reduce(((r, k) => {
                const f = toField(k);
                if (f) r[f] = matches[k];
                return r;
            }), {});
            return [ vals, zone, specificOffset ];
        }
        let dummyDateTimeCache = null;
        function getDummyDateTime() {
            if (!dummyDateTimeCache) dummyDateTimeCache = DateTime.fromMillis(1555555555555);
            return dummyDateTimeCache;
        }
        function maybeExpandMacroToken(token, locale) {
            if (token.literal) return token;
            const formatOpts = Formatter.macroTokenToFormatOpts(token.val);
            if (!formatOpts) return token;
            const formatter = Formatter.create(locale, formatOpts);
            const parts = formatter.formatDateTimeParts(getDummyDateTime());
            const tokens = parts.map((p => tokenForPart(p, locale, formatOpts)));
            if (tokens.includes(void 0)) return token;
            return tokens;
        }
        function expandMacroTokens(tokens, locale) {
            return Array.prototype.concat(...tokens.map((t => maybeExpandMacroToken(t, locale))));
        }
        function explainFromTokens(locale, input, format) {
            const tokens = expandMacroTokens(Formatter.parseFormat(format), locale), units = tokens.map((t => unitForToken(t, locale))), disqualifyingUnit = units.find((t => t.invalidReason));
            if (disqualifyingUnit) return {
                input,
                tokens,
                invalidReason: disqualifyingUnit.invalidReason
            }; else {
                const [regexString, handlers] = buildRegex(units), regex = RegExp(regexString, "i"), [rawMatches, matches] = match(input, regex, handlers), [result, zone, specificOffset] = matches ? dateTimeFromMatches(matches) : [ null, null, void 0 ];
                if (util_hasOwnProperty(matches, "a") && util_hasOwnProperty(matches, "H")) throw new ConflictingSpecificationError("Can't include meridiem when specifying 24-hour format");
                return {
                    input,
                    tokens,
                    regex,
                    rawMatches,
                    matches,
                    result,
                    zone,
                    specificOffset
                };
            }
        }
        function parseFromTokens(locale, input, format) {
            const {result, zone, specificOffset, invalidReason} = explainFromTokens(locale, input, format);
            return [ result, zone, specificOffset, invalidReason ];
        }
        const nonLeapLadder = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ], leapLadder = [ 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ];
        function unitOutOfRange(unit, value) {
            return new Invalid("unit out of range", `you specified ${value} (of type ${typeof value}) as a ${unit}, which is invalid`);
        }
        function dayOfWeek(year, month, day) {
            const d = new Date(Date.UTC(year, month - 1, day));
            if (year < 100 && year >= 0) d.setUTCFullYear(d.getUTCFullYear() - 1900);
            const js = d.getUTCDay();
            return 0 === js ? 7 : js;
        }
        function computeOrdinal(year, month, day) {
            return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
        }
        function uncomputeOrdinal(year, ordinal) {
            const table = isLeapYear(year) ? leapLadder : nonLeapLadder, month0 = table.findIndex((i => i < ordinal)), day = ordinal - table[month0];
            return {
                month: month0 + 1,
                day
            };
        }
        function gregorianToWeek(gregObj) {
            const {year, month, day} = gregObj, ordinal = computeOrdinal(year, month, day), weekday = dayOfWeek(year, month, day);
            let weekYear, weekNumber = Math.floor((ordinal - weekday + 10) / 7);
            if (weekNumber < 1) {
                weekYear = year - 1;
                weekNumber = weeksInWeekYear(weekYear);
            } else if (weekNumber > weeksInWeekYear(year)) {
                weekYear = year + 1;
                weekNumber = 1;
            } else weekYear = year;
            return {
                weekYear,
                weekNumber,
                weekday,
                ...timeObject(gregObj)
            };
        }
        function weekToGregorian(weekData) {
            const {weekYear, weekNumber, weekday} = weekData, weekdayOfJan4 = dayOfWeek(weekYear, 1, 4), yearInDays = daysInYear(weekYear);
            let year, ordinal = 7 * weekNumber + weekday - weekdayOfJan4 - 3;
            if (ordinal < 1) {
                year = weekYear - 1;
                ordinal += daysInYear(year);
            } else if (ordinal > yearInDays) {
                year = weekYear + 1;
                ordinal -= daysInYear(weekYear);
            } else year = weekYear;
            const {month, day} = uncomputeOrdinal(year, ordinal);
            return {
                year,
                month,
                day,
                ...timeObject(weekData)
            };
        }
        function gregorianToOrdinal(gregData) {
            const {year, month, day} = gregData;
            const ordinal = computeOrdinal(year, month, day);
            return {
                year,
                ordinal,
                ...timeObject(gregData)
            };
        }
        function ordinalToGregorian(ordinalData) {
            const {year, ordinal} = ordinalData;
            const {month, day} = uncomputeOrdinal(year, ordinal);
            return {
                year,
                month,
                day,
                ...timeObject(ordinalData)
            };
        }
        function hasInvalidWeekData(obj) {
            const validYear = isInteger(obj.weekYear), validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear)), validWeekday = integerBetween(obj.weekday, 1, 7);
            if (!validYear) return unitOutOfRange("weekYear", obj.weekYear); else if (!validWeek) return unitOutOfRange("week", obj.week); else if (!validWeekday) return unitOutOfRange("weekday", obj.weekday); else return false;
        }
        function hasInvalidOrdinalData(obj) {
            const validYear = isInteger(obj.year), validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));
            if (!validYear) return unitOutOfRange("year", obj.year); else if (!validOrdinal) return unitOutOfRange("ordinal", obj.ordinal); else return false;
        }
        function hasInvalidGregorianData(obj) {
            const validYear = isInteger(obj.year), validMonth = integerBetween(obj.month, 1, 12), validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));
            if (!validYear) return unitOutOfRange("year", obj.year); else if (!validMonth) return unitOutOfRange("month", obj.month); else if (!validDay) return unitOutOfRange("day", obj.day); else return false;
        }
        function hasInvalidTimeData(obj) {
            const {hour, minute, second, millisecond} = obj;
            const validHour = integerBetween(hour, 0, 23) || 24 === hour && 0 === minute && 0 === second && 0 === millisecond, validMinute = integerBetween(minute, 0, 59), validSecond = integerBetween(second, 0, 59), validMillisecond = integerBetween(millisecond, 0, 999);
            if (!validHour) return unitOutOfRange("hour", hour); else if (!validMinute) return unitOutOfRange("minute", minute); else if (!validSecond) return unitOutOfRange("second", second); else if (!validMillisecond) return unitOutOfRange("millisecond", millisecond); else return false;
        }
        const datetime_INVALID = "Invalid DateTime";
        const MAX_DATE = 864e13;
        function unsupportedZone(zone) {
            return new Invalid("unsupported zone", `the zone "${zone.name}" is not supported`);
        }
        function possiblyCachedWeekData(dt) {
            if (null === dt.weekData) dt.weekData = gregorianToWeek(dt.c);
            return dt.weekData;
        }
        function datetime_clone(inst, alts) {
            const current = {
                ts: inst.ts,
                zone: inst.zone,
                c: inst.c,
                o: inst.o,
                loc: inst.loc,
                invalid: inst.invalid
            };
            return new DateTime({
                ...current,
                ...alts,
                old: current
            });
        }
        function fixOffset(localTS, o, tz) {
            let utcGuess = localTS - 60 * o * 1e3;
            const o2 = tz.offset(utcGuess);
            if (o === o2) return [ utcGuess, o ];
            utcGuess -= 60 * (o2 - o) * 1e3;
            const o3 = tz.offset(utcGuess);
            if (o2 === o3) return [ utcGuess, o2 ];
            return [ localTS - 60 * Math.min(o2, o3) * 1e3, Math.max(o2, o3) ];
        }
        function tsToObj(ts, offset) {
            ts += 60 * offset * 1e3;
            const d = new Date(ts);
            return {
                year: d.getUTCFullYear(),
                month: d.getUTCMonth() + 1,
                day: d.getUTCDate(),
                hour: d.getUTCHours(),
                minute: d.getUTCMinutes(),
                second: d.getUTCSeconds(),
                millisecond: d.getUTCMilliseconds()
            };
        }
        function objToTS(obj, offset, zone) {
            return fixOffset(objToLocalTS(obj), offset, zone);
        }
        function adjustTime(inst, dur) {
            const oPre = inst.o, year = inst.c.year + Math.trunc(dur.years), month = inst.c.month + Math.trunc(dur.months) + 3 * Math.trunc(dur.quarters), c = {
                ...inst.c,
                year,
                month,
                day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + 7 * Math.trunc(dur.weeks)
            }, millisToAdd = Duration.fromObject({
                years: dur.years - Math.trunc(dur.years),
                quarters: dur.quarters - Math.trunc(dur.quarters),
                months: dur.months - Math.trunc(dur.months),
                weeks: dur.weeks - Math.trunc(dur.weeks),
                days: dur.days - Math.trunc(dur.days),
                hours: dur.hours,
                minutes: dur.minutes,
                seconds: dur.seconds,
                milliseconds: dur.milliseconds
            }).as("milliseconds"), localTS = objToLocalTS(c);
            let [ts, o] = fixOffset(localTS, oPre, inst.zone);
            if (0 !== millisToAdd) {
                ts += millisToAdd;
                o = inst.zone.offset(ts);
            }
            return {
                ts,
                o
            };
        }
        function parseDataToDateTime(parsed, parsedZone, opts, format, text, specificOffset) {
            const {setZone, zone} = opts;
            if (parsed && 0 !== Object.keys(parsed).length) {
                const interpretationZone = parsedZone || zone, inst = DateTime.fromObject(parsed, {
                    ...opts,
                    zone: interpretationZone,
                    specificOffset
                });
                return setZone ? inst : inst.setZone(zone);
            } else return DateTime.invalid(new Invalid("unparsable", `the input "${text}" can't be parsed as ${format}`));
        }
        function toTechFormat(dt, format, allowZ = true) {
            return dt.isValid ? Formatter.create(Locale.create("en-US"), {
                allowZ,
                forceSimple: true
            }).formatDateTimeFromString(dt, format) : null;
        }
        function toISODate(o, extended) {
            const longFormat = o.c.year > 9999 || o.c.year < 0;
            let c = "";
            if (longFormat && o.c.year >= 0) c += "+";
            c += padStart(o.c.year, longFormat ? 6 : 4);
            if (extended) {
                c += "-";
                c += padStart(o.c.month);
                c += "-";
                c += padStart(o.c.day);
            } else {
                c += padStart(o.c.month);
                c += padStart(o.c.day);
            }
            return c;
        }
        function toISOTime(o, extended, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone) {
            let c = padStart(o.c.hour);
            if (extended) {
                c += ":";
                c += padStart(o.c.minute);
                if (0 !== o.c.second || !suppressSeconds) c += ":";
            } else c += padStart(o.c.minute);
            if (0 !== o.c.second || !suppressSeconds) {
                c += padStart(o.c.second);
                if (0 !== o.c.millisecond || !suppressMilliseconds) {
                    c += ".";
                    c += padStart(o.c.millisecond, 3);
                }
            }
            if (includeOffset) if (o.isOffsetFixed && 0 === o.offset && !extendedZone) c += "Z"; else if (o.o < 0) {
                c += "-";
                c += padStart(Math.trunc(-o.o / 60));
                c += ":";
                c += padStart(Math.trunc(-o.o % 60));
            } else {
                c += "+";
                c += padStart(Math.trunc(o.o / 60));
                c += ":";
                c += padStart(Math.trunc(o.o % 60));
            }
            if (extendedZone) c += "[" + o.zone.ianaName + "]";
            return c;
        }
        const defaultUnitValues = {
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        }, defaultWeekUnitValues = {
            weekNumber: 1,
            weekday: 1,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        }, defaultOrdinalUnitValues = {
            ordinal: 1,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        };
        const datetime_orderedUnits = [ "year", "month", "day", "hour", "minute", "second", "millisecond" ], orderedWeekUnits = [ "weekYear", "weekNumber", "weekday", "hour", "minute", "second", "millisecond" ], orderedOrdinalUnits = [ "year", "ordinal", "hour", "minute", "second", "millisecond" ];
        function normalizeUnit(unit) {
            const normalized = {
                year: "year",
                years: "year",
                month: "month",
                months: "month",
                day: "day",
                days: "day",
                hour: "hour",
                hours: "hour",
                minute: "minute",
                minutes: "minute",
                quarter: "quarter",
                quarters: "quarter",
                second: "second",
                seconds: "second",
                millisecond: "millisecond",
                milliseconds: "millisecond",
                weekday: "weekday",
                weekdays: "weekday",
                weeknumber: "weekNumber",
                weeksnumber: "weekNumber",
                weeknumbers: "weekNumber",
                weekyear: "weekYear",
                weekyears: "weekYear",
                ordinal: "ordinal"
            }[unit.toLowerCase()];
            if (!normalized) throw new InvalidUnitError(unit);
            return normalized;
        }
        function quickDT(obj, opts) {
            const zone = normalizeZone(opts.zone, Settings.defaultZone), loc = Locale.fromObject(opts), tsNow = Settings.now();
            let ts, o;
            if (!isUndefined(obj.year)) {
                for (const u of datetime_orderedUnits) if (isUndefined(obj[u])) obj[u] = defaultUnitValues[u];
                const invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);
                if (invalid) return DateTime.invalid(invalid);
                const offsetProvis = zone.offset(tsNow);
                [ts, o] = objToTS(obj, offsetProvis, zone);
            } else ts = tsNow;
            return new DateTime({
                ts,
                zone,
                loc,
                o
            });
        }
        function diffRelative(start, end, opts) {
            const round = isUndefined(opts.round) ? true : opts.round, format = (c, unit) => {
                c = roundTo(c, round || opts.calendary ? 0 : 2, true);
                const formatter = end.loc.clone(opts).relFormatter(opts);
                return formatter.format(c, unit);
            }, differ = unit => {
                if (opts.calendary) if (!end.hasSame(start, unit)) return end.startOf(unit).diff(start.startOf(unit), unit).get(unit); else return 0; else return end.diff(start, unit).get(unit);
            };
            if (opts.unit) return format(differ(opts.unit), opts.unit);
            for (const unit of opts.units) {
                const count = differ(unit);
                if (Math.abs(count) >= 1) return format(count, unit);
            }
            return format(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
        }
        function lastOpts(argList) {
            let args, opts = {};
            if (argList.length > 0 && "object" === typeof argList[argList.length - 1]) {
                opts = argList[argList.length - 1];
                args = Array.from(argList).slice(0, argList.length - 1);
            } else args = Array.from(argList);
            return [ opts, args ];
        }
        class DateTime {
            constructor(config) {
                const zone = config.zone || Settings.defaultZone;
                let invalid = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
                this.ts = isUndefined(config.ts) ? Settings.now() : config.ts;
                let c = null, o = null;
                if (!invalid) {
                    const unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);
                    if (unchanged) [c, o] = [ config.old.c, config.old.o ]; else {
                        const ot = zone.offset(this.ts);
                        c = tsToObj(this.ts, ot);
                        invalid = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
                        c = invalid ? null : c;
                        o = invalid ? null : ot;
                    }
                }
                this._zone = zone;
                this.loc = config.loc || Locale.create();
                this.invalid = invalid;
                this.weekData = null;
                this.c = c;
                this.o = o;
                this.isLuxonDateTime = true;
            }
            static now() {
                return new DateTime({});
            }
            static local() {
                const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
                return quickDT({
                    year,
                    month,
                    day,
                    hour,
                    minute,
                    second,
                    millisecond
                }, opts);
            }
            static utc() {
                const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
                opts.zone = FixedOffsetZone.utcInstance;
                return quickDT({
                    year,
                    month,
                    day,
                    hour,
                    minute,
                    second,
                    millisecond
                }, opts);
            }
            static fromJSDate(date, options = {}) {
                const ts = isDate(date) ? date.valueOf() : NaN;
                if (Number.isNaN(ts)) return DateTime.invalid("invalid input");
                const zoneToUse = normalizeZone(options.zone, Settings.defaultZone);
                if (!zoneToUse.isValid) return DateTime.invalid(unsupportedZone(zoneToUse));
                return new DateTime({
                    ts,
                    zone: zoneToUse,
                    loc: Locale.fromObject(options)
                });
            }
            static fromMillis(milliseconds, options = {}) {
                if (!isNumber(milliseconds)) throw new InvalidArgumentError(`fromMillis requires a numerical input, but received a ${typeof milliseconds} with value ${milliseconds}`); else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) return DateTime.invalid("Timestamp out of range"); else return new DateTime({
                    ts: milliseconds,
                    zone: normalizeZone(options.zone, Settings.defaultZone),
                    loc: Locale.fromObject(options)
                });
            }
            static fromSeconds(seconds, options = {}) {
                if (!isNumber(seconds)) throw new InvalidArgumentError("fromSeconds requires a numerical input"); else return new DateTime({
                    ts: 1e3 * seconds,
                    zone: normalizeZone(options.zone, Settings.defaultZone),
                    loc: Locale.fromObject(options)
                });
            }
            static fromObject(obj, opts = {}) {
                obj = obj || {};
                const zoneToUse = normalizeZone(opts.zone, Settings.defaultZone);
                if (!zoneToUse.isValid) return DateTime.invalid(unsupportedZone(zoneToUse));
                const tsNow = Settings.now(), offsetProvis = !isUndefined(opts.specificOffset) ? opts.specificOffset : zoneToUse.offset(tsNow), normalized = normalizeObject(obj, normalizeUnit), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber, loc = Locale.fromObject(opts);
                if ((containsGregor || containsOrdinal) && definiteWeekDef) throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
                if (containsGregorMD && containsOrdinal) throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
                const useWeekData = definiteWeekDef || normalized.weekday && !containsGregor;
                let units, defaultValues, objNow = tsToObj(tsNow, offsetProvis);
                if (useWeekData) {
                    units = orderedWeekUnits;
                    defaultValues = defaultWeekUnitValues;
                    objNow = gregorianToWeek(objNow);
                } else if (containsOrdinal) {
                    units = orderedOrdinalUnits;
                    defaultValues = defaultOrdinalUnitValues;
                    objNow = gregorianToOrdinal(objNow);
                } else {
                    units = datetime_orderedUnits;
                    defaultValues = defaultUnitValues;
                }
                let foundFirst = false;
                for (const u of units) {
                    const v = normalized[u];
                    if (!isUndefined(v)) foundFirst = true; else if (foundFirst) normalized[u] = defaultValues[u]; else normalized[u] = objNow[u];
                }
                const higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized), invalid = higherOrderInvalid || hasInvalidTimeData(normalized);
                if (invalid) return DateTime.invalid(invalid);
                const gregorian = useWeekData ? weekToGregorian(normalized) : containsOrdinal ? ordinalToGregorian(normalized) : normalized, [tsFinal, offsetFinal] = objToTS(gregorian, offsetProvis, zoneToUse), inst = new DateTime({
                    ts: tsFinal,
                    zone: zoneToUse,
                    o: offsetFinal,
                    loc
                });
                if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) return DateTime.invalid("mismatched weekday", `you can't specify both a weekday of ${normalized.weekday} and a date of ${inst.toISO()}`);
                return inst;
            }
            static fromISO(text, opts = {}) {
                const [vals, parsedZone] = parseISODate(text);
                return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
            }
            static fromRFC2822(text, opts = {}) {
                const [vals, parsedZone] = parseRFC2822Date(text);
                return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
            }
            static fromHTTP(text, opts = {}) {
                const [vals, parsedZone] = parseHTTPDate(text);
                return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
            }
            static fromFormat(text, fmt, opts = {}) {
                if (isUndefined(text) || isUndefined(fmt)) throw new InvalidArgumentError("fromFormat requires an input string and a format");
                const {locale = null, numberingSystem = null} = opts, localeToUse = Locale.fromOpts({
                    locale,
                    numberingSystem,
                    defaultToEN: true
                }), [vals, parsedZone, specificOffset, invalid] = parseFromTokens(localeToUse, text, fmt);
                if (invalid) return DateTime.invalid(invalid); else return parseDataToDateTime(vals, parsedZone, opts, `format ${fmt}`, text, specificOffset);
            }
            static fromString(text, fmt, opts = {}) {
                return DateTime.fromFormat(text, fmt, opts);
            }
            static fromSQL(text, opts = {}) {
                const [vals, parsedZone] = parseSQL(text);
                return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
            }
            static invalid(reason, explanation = null) {
                if (!reason) throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
                const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
                if (Settings.throwOnInvalid) throw new InvalidDateTimeError(invalid); else return new DateTime({
                    invalid
                });
            }
            static isDateTime(o) {
                return o && o.isLuxonDateTime || false;
            }
            get(unit) {
                return this[unit];
            }
            get isValid() {
                return null === this.invalid;
            }
            get invalidReason() {
                return this.invalid ? this.invalid.reason : null;
            }
            get invalidExplanation() {
                return this.invalid ? this.invalid.explanation : null;
            }
            get locale() {
                return this.isValid ? this.loc.locale : null;
            }
            get numberingSystem() {
                return this.isValid ? this.loc.numberingSystem : null;
            }
            get outputCalendar() {
                return this.isValid ? this.loc.outputCalendar : null;
            }
            get zone() {
                return this._zone;
            }
            get zoneName() {
                return this.isValid ? this.zone.name : null;
            }
            get year() {
                return this.isValid ? this.c.year : NaN;
            }
            get quarter() {
                return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
            }
            get month() {
                return this.isValid ? this.c.month : NaN;
            }
            get day() {
                return this.isValid ? this.c.day : NaN;
            }
            get hour() {
                return this.isValid ? this.c.hour : NaN;
            }
            get minute() {
                return this.isValid ? this.c.minute : NaN;
            }
            get second() {
                return this.isValid ? this.c.second : NaN;
            }
            get millisecond() {
                return this.isValid ? this.c.millisecond : NaN;
            }
            get weekYear() {
                return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
            }
            get weekNumber() {
                return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
            }
            get weekday() {
                return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
            }
            get ordinal() {
                return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
            }
            get monthShort() {
                return this.isValid ? Info.months("short", {
                    locObj: this.loc
                })[this.month - 1] : null;
            }
            get monthLong() {
                return this.isValid ? Info.months("long", {
                    locObj: this.loc
                })[this.month - 1] : null;
            }
            get weekdayShort() {
                return this.isValid ? Info.weekdays("short", {
                    locObj: this.loc
                })[this.weekday - 1] : null;
            }
            get weekdayLong() {
                return this.isValid ? Info.weekdays("long", {
                    locObj: this.loc
                })[this.weekday - 1] : null;
            }
            get offset() {
                return this.isValid ? +this.o : NaN;
            }
            get offsetNameShort() {
                if (this.isValid) return this.zone.offsetName(this.ts, {
                    format: "short",
                    locale: this.locale
                }); else return null;
            }
            get offsetNameLong() {
                if (this.isValid) return this.zone.offsetName(this.ts, {
                    format: "long",
                    locale: this.locale
                }); else return null;
            }
            get isOffsetFixed() {
                return this.isValid ? this.zone.isUniversal : null;
            }
            get isInDST() {
                if (this.isOffsetFixed) return false; else return this.offset > this.set({
                    month: 1,
                    day: 1
                }).offset || this.offset > this.set({
                    month: 5
                }).offset;
            }
            get isInLeapYear() {
                return isLeapYear(this.year);
            }
            get daysInMonth() {
                return daysInMonth(this.year, this.month);
            }
            get daysInYear() {
                return this.isValid ? daysInYear(this.year) : NaN;
            }
            get weeksInWeekYear() {
                return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
            }
            resolvedLocaleOptions(opts = {}) {
                const {locale, numberingSystem, calendar} = Formatter.create(this.loc.clone(opts), opts).resolvedOptions(this);
                return {
                    locale,
                    numberingSystem,
                    outputCalendar: calendar
                };
            }
            toUTC(offset = 0, opts = {}) {
                return this.setZone(FixedOffsetZone.instance(offset), opts);
            }
            toLocal() {
                return this.setZone(Settings.defaultZone);
            }
            setZone(zone, {keepLocalTime = false, keepCalendarTime = false} = {}) {
                zone = normalizeZone(zone, Settings.defaultZone);
                if (zone.equals(this.zone)) return this; else if (!zone.isValid) return DateTime.invalid(unsupportedZone(zone)); else {
                    let newTS = this.ts;
                    if (keepLocalTime || keepCalendarTime) {
                        const offsetGuess = zone.offset(this.ts);
                        const asObj = this.toObject();
                        [newTS] = objToTS(asObj, offsetGuess, zone);
                    }
                    return datetime_clone(this, {
                        ts: newTS,
                        zone
                    });
                }
            }
            reconfigure({locale, numberingSystem, outputCalendar} = {}) {
                const loc = this.loc.clone({
                    locale,
                    numberingSystem,
                    outputCalendar
                });
                return datetime_clone(this, {
                    loc
                });
            }
            setLocale(locale) {
                return this.reconfigure({
                    locale
                });
            }
            set(values) {
                if (!this.isValid) return this;
                const normalized = normalizeObject(values, normalizeUnit), settingWeekStuff = !isUndefined(normalized.weekYear) || !isUndefined(normalized.weekNumber) || !isUndefined(normalized.weekday), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
                if ((containsGregor || containsOrdinal) && definiteWeekDef) throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
                if (containsGregorMD && containsOrdinal) throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
                let mixed;
                if (settingWeekStuff) mixed = weekToGregorian({
                    ...gregorianToWeek(this.c),
                    ...normalized
                }); else if (!isUndefined(normalized.ordinal)) mixed = ordinalToGregorian({
                    ...gregorianToOrdinal(this.c),
                    ...normalized
                }); else {
                    mixed = {
                        ...this.toObject(),
                        ...normalized
                    };
                    if (isUndefined(normalized.day)) mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
                }
                const [ts, o] = objToTS(mixed, this.o, this.zone);
                return datetime_clone(this, {
                    ts,
                    o
                });
            }
            plus(duration) {
                if (!this.isValid) return this;
                const dur = Duration.fromDurationLike(duration);
                return datetime_clone(this, adjustTime(this, dur));
            }
            minus(duration) {
                if (!this.isValid) return this;
                const dur = Duration.fromDurationLike(duration).negate();
                return datetime_clone(this, adjustTime(this, dur));
            }
            startOf(unit) {
                if (!this.isValid) return this;
                const o = {}, normalizedUnit = Duration.normalizeUnit(unit);
                switch (normalizedUnit) {
                  case "years":
                    o.month = 1;

                  case "quarters":
                  case "months":
                    o.day = 1;

                  case "weeks":
                  case "days":
                    o.hour = 0;

                  case "hours":
                    o.minute = 0;

                  case "minutes":
                    o.second = 0;

                  case "seconds":
                    o.millisecond = 0;
                    break;

                  case "milliseconds":
                    break;
                }
                if ("weeks" === normalizedUnit) o.weekday = 1;
                if ("quarters" === normalizedUnit) {
                    const q = Math.ceil(this.month / 3);
                    o.month = 3 * (q - 1) + 1;
                }
                return this.set(o);
            }
            endOf(unit) {
                return this.isValid ? this.plus({
                    [unit]: 1
                }).startOf(unit).minus(1) : this;
            }
            toFormat(fmt, opts = {}) {
                return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : datetime_INVALID;
            }
            toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
                return this.isValid ? Formatter.create(this.loc.clone(opts), formatOpts).formatDateTime(this) : datetime_INVALID;
            }
            toLocaleParts(opts = {}) {
                return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
            }
            toISO({format = "extended", suppressSeconds = false, suppressMilliseconds = false, includeOffset = true, extendedZone = false} = {}) {
                if (!this.isValid) return null;
                const ext = "extended" === format;
                let c = toISODate(this, ext);
                c += "T";
                c += toISOTime(this, ext, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
                return c;
            }
            toISODate({format = "extended"} = {}) {
                if (!this.isValid) return null;
                return toISODate(this, "extended" === format);
            }
            toISOWeekDate() {
                return toTechFormat(this, "kkkk-'W'WW-c");
            }
            toISOTime({suppressMilliseconds = false, suppressSeconds = false, includeOffset = true, includePrefix = false, extendedZone = false, format = "extended"} = {}) {
                if (!this.isValid) return null;
                let c = includePrefix ? "T" : "";
                return c + toISOTime(this, "extended" === format, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
            }
            toRFC2822() {
                return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
            }
            toHTTP() {
                return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
            }
            toSQLDate() {
                if (!this.isValid) return null;
                return toISODate(this, true);
            }
            toSQLTime({includeOffset = true, includeZone = false, includeOffsetSpace = true} = {}) {
                let fmt = "HH:mm:ss.SSS";
                if (includeZone || includeOffset) {
                    if (includeOffsetSpace) fmt += " ";
                    if (includeZone) fmt += "z"; else if (includeOffset) fmt += "ZZ";
                }
                return toTechFormat(this, fmt, true);
            }
            toSQL(opts = {}) {
                if (!this.isValid) return null;
                return `${this.toSQLDate()} ${this.toSQLTime(opts)}`;
            }
            toString() {
                return this.isValid ? this.toISO() : datetime_INVALID;
            }
            valueOf() {
                return this.toMillis();
            }
            toMillis() {
                return this.isValid ? this.ts : NaN;
            }
            toSeconds() {
                return this.isValid ? this.ts / 1e3 : NaN;
            }
            toUnixInteger() {
                return this.isValid ? Math.floor(this.ts / 1e3) : NaN;
            }
            toJSON() {
                return this.toISO();
            }
            toBSON() {
                return this.toJSDate();
            }
            toObject(opts = {}) {
                if (!this.isValid) return {};
                const base = {
                    ...this.c
                };
                if (opts.includeConfig) {
                    base.outputCalendar = this.outputCalendar;
                    base.numberingSystem = this.loc.numberingSystem;
                    base.locale = this.loc.locale;
                }
                return base;
            }
            toJSDate() {
                return new Date(this.isValid ? this.ts : NaN);
            }
            diff(otherDateTime, unit = "milliseconds", opts = {}) {
                if (!this.isValid || !otherDateTime.isValid) return Duration.invalid("created by diffing an invalid DateTime");
                const durOpts = {
                    locale: this.locale,
                    numberingSystem: this.numberingSystem,
                    ...opts
                };
                const units = maybeArray(unit).map(Duration.normalizeUnit), otherIsLater = otherDateTime.valueOf() > this.valueOf(), earlier = otherIsLater ? this : otherDateTime, later = otherIsLater ? otherDateTime : this, diffed = diff(earlier, later, units, durOpts);
                return otherIsLater ? diffed.negate() : diffed;
            }
            diffNow(unit = "milliseconds", opts = {}) {
                return this.diff(DateTime.now(), unit, opts);
            }
            until(otherDateTime) {
                return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
            }
            hasSame(otherDateTime, unit) {
                if (!this.isValid) return false;
                const inputMs = otherDateTime.valueOf();
                const adjustedToZone = this.setZone(otherDateTime.zone, {
                    keepLocalTime: true
                });
                return adjustedToZone.startOf(unit) <= inputMs && inputMs <= adjustedToZone.endOf(unit);
            }
            equals(other) {
                return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
            }
            toRelative(options = {}) {
                if (!this.isValid) return null;
                const base = options.base || DateTime.fromObject({}, {
                    zone: this.zone
                }), padding = options.padding ? this < base ? -options.padding : options.padding : 0;
                let units = [ "years", "months", "days", "hours", "minutes", "seconds" ];
                let unit = options.unit;
                if (Array.isArray(options.unit)) {
                    units = options.unit;
                    unit = void 0;
                }
                return diffRelative(base, this.plus(padding), {
                    ...options,
                    numeric: "always",
                    units,
                    unit
                });
            }
            toRelativeCalendar(options = {}) {
                if (!this.isValid) return null;
                return diffRelative(options.base || DateTime.fromObject({}, {
                    zone: this.zone
                }), this, {
                    ...options,
                    numeric: "auto",
                    units: [ "years", "months", "days" ],
                    calendary: true
                });
            }
            static min(...dateTimes) {
                if (!dateTimes.every(DateTime.isDateTime)) throw new InvalidArgumentError("min requires all arguments be DateTimes");
                return bestBy(dateTimes, (i => i.valueOf()), Math.min);
            }
            static max(...dateTimes) {
                if (!dateTimes.every(DateTime.isDateTime)) throw new InvalidArgumentError("max requires all arguments be DateTimes");
                return bestBy(dateTimes, (i => i.valueOf()), Math.max);
            }
            static fromFormatExplain(text, fmt, options = {}) {
                const {locale = null, numberingSystem = null} = options, localeToUse = Locale.fromOpts({
                    locale,
                    numberingSystem,
                    defaultToEN: true
                });
                return explainFromTokens(localeToUse, text, fmt);
            }
            static fromStringExplain(text, fmt, options = {}) {
                return DateTime.fromFormatExplain(text, fmt, options);
            }
            static get DATE_SHORT() {
                return DATE_SHORT;
            }
            static get DATE_MED() {
                return DATE_MED;
            }
            static get DATE_MED_WITH_WEEKDAY() {
                return DATE_MED_WITH_WEEKDAY;
            }
            static get DATE_FULL() {
                return DATE_FULL;
            }
            static get DATE_HUGE() {
                return DATE_HUGE;
            }
            static get TIME_SIMPLE() {
                return TIME_SIMPLE;
            }
            static get TIME_WITH_SECONDS() {
                return TIME_WITH_SECONDS;
            }
            static get TIME_WITH_SHORT_OFFSET() {
                return TIME_WITH_SHORT_OFFSET;
            }
            static get TIME_WITH_LONG_OFFSET() {
                return TIME_WITH_LONG_OFFSET;
            }
            static get TIME_24_SIMPLE() {
                return TIME_24_SIMPLE;
            }
            static get TIME_24_WITH_SECONDS() {
                return TIME_24_WITH_SECONDS;
            }
            static get TIME_24_WITH_SHORT_OFFSET() {
                return TIME_24_WITH_SHORT_OFFSET;
            }
            static get TIME_24_WITH_LONG_OFFSET() {
                return TIME_24_WITH_LONG_OFFSET;
            }
            static get DATETIME_SHORT() {
                return DATETIME_SHORT;
            }
            static get DATETIME_SHORT_WITH_SECONDS() {
                return DATETIME_SHORT_WITH_SECONDS;
            }
            static get DATETIME_MED() {
                return DATETIME_MED;
            }
            static get DATETIME_MED_WITH_SECONDS() {
                return DATETIME_MED_WITH_SECONDS;
            }
            static get DATETIME_MED_WITH_WEEKDAY() {
                return DATETIME_MED_WITH_WEEKDAY;
            }
            static get DATETIME_FULL() {
                return DATETIME_FULL;
            }
            static get DATETIME_FULL_WITH_SECONDS() {
                return DATETIME_FULL_WITH_SECONDS;
            }
            static get DATETIME_HUGE() {
                return DATETIME_HUGE;
            }
            static get DATETIME_HUGE_WITH_SECONDS() {
                return DATETIME_HUGE_WITH_SECONDS;
            }
        }
        function friendlyDateTime(dateTimeish) {
            if (DateTime.isDateTime(dateTimeish)) return dateTimeish; else if (dateTimeish && dateTimeish.valueOf && isNumber(dateTimeish.valueOf())) return DateTime.fromJSDate(dateTimeish); else if (dateTimeish && "object" === typeof dateTimeish) return DateTime.fromObject(dateTimeish); else throw new InvalidArgumentError(`Unknown datetime argument: ${dateTimeish}, of type ${typeof dateTimeish}`);
        }
        const LOG_FILE_PATH = `${APPLET_PATH}/log`;
        const {new_for_path} = imports.gi.Gio.File;
        new_for_path(LOG_FILE_PATH);
        const {FileCreateFlags, Subprocess, SubprocessFlags} = imports.gi.Gio;
        const {Bytes, PRIORITY_DEFAULT: Logger_PRIORITY_DEFAULT} = imports.gi.GLib;
        ({
            uuid: "reminder@jonath92",
            path: "/home/jonathan/Projekte/cinnamon-spices-applets/reminder@jonath92/files/reminder@jonath92"
        }).uuid;
        const script = `\necho "BEGIN";\n\nwhile read line; do\n  echo "$line" >> /home/jonathan/Tmp/logger ;\n  sleep 1;\ndone;\n`;
        function writeInput(stdin, value) {
            (new Date).toLocaleString();
            stdin.write_bytes_async(new Bytes(`${value}\n`), Logger_PRIORITY_DEFAULT, null, ((stdin, res) => {
                try {
                    stdin.write_bytes_finish(res);
                    log(`WROTE: ${value}`);
                } catch (e) {
                    logError(e);
                }
            }));
        }
        let stdinStream;
        try {
            log("inside try block");
            const proc = Subprocess.new([ "bash", "-c", script ], SubprocessFlags.STDIN_PIPE | SubprocessFlags.STDOUT_PIPE);
            proc.wait_async(null, ((proc, res) => {
                try {
                    proc.wait_finish(res);
                } catch (e) {
                    logError(e);
                }
            }));
            stdinStream = proc.get_stdin_pipe();
        } catch (error) {}
        function logInfo(message) {
            if (!stdinStream) {
                log("Something went wrong. StdInStream not defined.");
                return;
            }
            writeInput(stdinStream, message);
        }
        class CalendarEvent {
            constructor(reminderId, remindTime, subject, startUTC, onlineMeetingUrl) {
                this.reminderId = reminderId;
                this.remindTime = remindTime;
                this.subject = subject;
                this.startUTC = startUTC;
                this.onlineMeetingUrl = onlineMeetingUrl;
            }
            static newFromOffice365response(office365Response) {
                const {id, reminderMinutesBeforeStart, subject, start, onlineMeeting} = office365Response;
                const startUTC = DateTime.fromISO(start.dateTime + "Z");
                const reminderStartTime = startUTC.minus({
                    minutes: reminderMinutesBeforeStart
                });
                return new CalendarEvent(id, reminderStartTime, subject, startUTC, (null === onlineMeeting || void 0 === onlineMeeting ? void 0 : onlineMeeting.joinUrl) || null);
            }
            get startFormated() {
                return this.startUTC.toLocaleString(DateTime.TIME_SIMPLE);
            }
        }
        const CLIENT_ID = OFFICE365_CLIENT_ID;
        const CLIENT_SECRET = OFFICE365_CLIENT_SECRET;
        class Office365Api {
            constructor(args) {
                const {authorizatonCode, refreshToken, onRefreshTokenChanged} = args;
                if (null == authorizatonCode && null == refreshToken) throw new Error("AuthorizationCode and refreshToken must not be both null or undefined");
                this.authorizatonCode = authorizatonCode;
                this.refreshToken = refreshToken;
                this.onRefreshTokenChanged = onRefreshTokenChanged;
            }
            async refreshTokens() {
                var _a;
                const clientIDSecret = {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET
                };
                const tokenRequest = this.refreshToken ? Object.assign(Object.assign({}, clientIDSecret), {
                    grant_type: "refresh_token",
                    refresh_token: this.refreshToken
                }) : Object.assign(Object.assign({}, clientIDSecret), {
                    grant_type: "authorization_code",
                    code: this.authorizatonCode,
                    redirect_uri: "http://localhost:8080"
                });
                log(`tokenRequest, ${JSON.stringify(tokenRequest)}`);
                const requestParams = {
                    method: "POST",
                    url: OFFICE365_TOKEN_ENDPOINT,
                    bodyParams: tokenRequest,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                };
                try {
                    const response = await loadJsonAsync(requestParams);
                    log(`response: ${JSON.stringify(response)}`);
                    const {access_token, refresh_token} = response;
                    this.accessToken = access_token;
                    if (this.refreshToken !== refresh_token) {
                        this.refreshToken = refresh_token;
                        null === (_a = this.onRefreshTokenChanged) || void 0 === _a ? void 0 : _a.call(this, refresh_token);
                    }
                } catch (error) {
                    global.logError(`couldn't refresh Token, error: ${JSON.stringify(error)}`);
                }
            }
            async getMailAdress() {
                logInfo("getMailAdress called");
                !this.accessToken && await this.refreshTokens();
                logInfo(`accessToken: ${this.accessToken}`);
                const requestParams = {
                    url: OFFICE365_USER_ENDPOINT,
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        "Content-Type": "application/json"
                    }
                };
                logInfo(`requestParams: ${JSON.stringify(requestParams)}`);
                return new Promise((async (resolve, reject) => {
                    try {
                        const response = await loadJsonAsync(requestParams);
                        logInfo(`response, ${JSON.stringify(response)}`);
                        resolve(null === response || void 0 === response ? void 0 : response.mail);
                    } catch (error) {
                        reject("couldn't get email adress");
                    }
                }));
            }
            async getTodayOffice365Events(attempt = 0) {
                const now = DateTime.now();
                const startOfDay = DateTime.fromObject({
                    day: now.day
                });
                const endOfDay = DateTime.fromObject({
                    day: now.day + 1
                });
                !this.accessToken && await this.refreshTokens();
                return new Promise((async (resolve, reject) => {
                    try {
                        const response = await loadJsonAsync({
                            url: OFFICE365_CALENDAR_ENDPOINT,
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${this.accessToken}`
                            },
                            queryParams: {
                                startdatetime: startOfDay.toISO(),
                                endDateTime: endOfDay.toISO()
                            }
                        });
                        resolve(response.value);
                    } catch (error) {
                        if (attempt >= 3) return;
                        if (isHttpError(error)) {
                            await this.handleHttpError(error);
                            this.getTodayOffice365Events(++attempt);
                            return;
                        }
                        reject(error);
                    }
                }));
            }
            async makeRequest(requestParams, attempt = 0) {
                !this.accessToken && await this.refreshTokens();
                return new Promise((async (resolve, reject) => {
                    try {
                        const response = await loadJsonAsync(requestParams);
                        resolve(response);
                    } catch (error) {
                        if (attempt >= 3) {
                            reject(error);
                            return;
                        }
                        if (isHttpError(error)) {
                            await this.handleHttpError(error);
                            this.makeRequest(requestParams, ++attempt);
                            return;
                        }
                    }
                }));
            }
            async getTodayEvents() {
                const todayOffice365Events = await this.getTodayOffice365Events();
                return todayOffice365Events.map((office365Event => CalendarEvent.newFromOffice365response(office365Event)));
            }
            async handleHttpError(error) {
                if ("Unauthorized" === error.reason_phrase) {
                    logInfo("Unauthorized Error. Microsft Graph Api Tokens probably not valid anymore ...");
                    await this.refreshTokens();
                }
            }
        }
        const {new_for_path: utils_new_for_path} = imports.gi.Gio.File;
        const SETTINGS_PATH = CONFIG_DIR + "/settings.json";
        imports.byteArray;
        const settingsFile = utils_new_for_path(SETTINGS_PATH);
        const {FileCreateFlags: utils_FileCreateFlags, Cancellable, SubprocessFlags: utils_SubprocessFlags, Subprocess: utils_Subprocess, IOErrorEnum, io_error_from_errno} = imports.gi.Gio;
        const {strerror} = imports.gi.GLib;
        function loadSettingsFromFile() {
            let settings = {
                accounts: []
            };
            try {
                const [success, contents] = settingsFile.load_contents(null);
                settings = JSON.parse(contents);
            } catch (error) {}
            return settings;
        }
        function saveSettingsToFile(settings) {
            log(`query exists: ${settingsFile.query_exists(null)}`);
            if (!settingsFile.query_exists(null)) {
                log("this is called");
                settingsFile.create(utils_FileCreateFlags.REPLACE_DESTINATION, null);
            }
            try {
                settingsFile.replace_contents(JSON.stringify(settings, null, 3), null, false, utils_FileCreateFlags.REPLACE_DESTINATION, null);
            } catch (error) {}
        }
        var __rest = void 0 && (void 0).__rest || function(s, e) {
            var t = {};
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
            if (null != s && "function" === typeof Object.getOwnPropertySymbols) {
                var i = 0;
                for (p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
            }
            return t;
        };
        async function addAccountToSettings(account) {
            var _a;
            const {authCode} = account, otherAccProps = __rest(account, [ "authCode" ]);
            const settings = loadSettingsFromFile();
            log("add Account to Settings called");
            const office365Api = new Office365Api({
                authorizatonCode: account.authCode
            });
            const mail = await office365Api.getMailAdress();
            null === (_a = settings.accounts) || void 0 === _a ? void 0 : _a.push(Object.assign(Object.assign({}, otherAccProps), {
                refreshToken: "sfsf",
                mail
            }));
            global.log(mail);
            saveSettingsToFile(settings);
        }
        const {ListBoxRow: CreateNewAccountListRow_ListBoxRow, Image: CreateNewAccountListRow_Image, Box: CreateNewAccountListRow_Box, Align: CreateNewAccountListRow_Align, Label: CreateNewAccountListRow_Label, Orientation: CreateNewAccountListRow_Orientation} = imports.gi.Gtk;
        function createNewAccountListRow() {
            const listboxRow = new CreateNewAccountListRow_ListBoxRow({
                can_focus: true,
                width_request: 100,
                height_request: 80
            });
            const googleBox = new CreateNewAccountListRow_Box({
                can_focus: true,
                spacing: 6
            });
            const googleImg = new CreateNewAccountListRow_Image({
                pixel_size: 40,
                icon_name: "goa-account-google",
                icon_size: 3
            });
            const labelBox = new CreateNewAccountListRow_Box({
                halign: CreateNewAccountListRow_Align.START,
                valign: CreateNewAccountListRow_Align.CENTER,
                orientation: CreateNewAccountListRow_Orientation.VERTICAL
            });
            labelBox.add(new CreateNewAccountListRow_Label({
                label: "Google",
                halign: CreateNewAccountListRow_Align.START
            }));
            googleBox.add(googleImg);
            googleBox.add(labelBox);
            listboxRow.add(googleBox);
            return listboxRow;
        }
        const {Gtk} = imports.gi;
        const {Server, MemoryUse} = imports.gi.Soup;
        const {GtkWindow} = imports.gi.XApp;
        const {spawn_command_line_async} = imports.gi.GLib;
        imports.gi.versions.Gtk = "3.0";
        Gtk.init(null);
        const innerMagin = 30;
        const queryParams = (0, query_string.stringify)({
            client_id: OFFICE365_CLIENT_ID,
            scope: "offline_access calendars.read",
            response_type: "code",
            redirect_uri: "http://localhost:8080"
        });
        const loginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${queryParams}`;
        log(loginUrl);
        const {Box: settings_Box, Orientation: settings_Orientation, Align: settings_Align, ListBox, Label: settings_Label} = Gtk;
        const server = new Server({
            port: 8080
        });
        startServer();
        log(ARGV);
        log("test from settings2");
        const settings_window = new GtkWindow({
            default_width: 800,
            default_height: 600,
            icon_name: "view-calendar",
            title: "Calendar Applet"
        });
        const mainBox = new settings_Box({
            visible: true,
            can_focus: true,
            border_width: 12,
            orientation: settings_Orientation.VERTICAL,
            margin_top: innerMagin,
            margin_bottom: innerMagin,
            margin_end: innerMagin,
            margin_start: innerMagin,
            spacing: innerMagin
        });
        const addedAccountsList = new ListBox;
        const addedGoogleAccount = createAddedAccountListRow();
        addedAccountsList.add(addedGoogleAccount);
        mainBox.add(addedAccountsList);
        const addAcountLabel = new settings_Label({
            use_markup: true,
            label: "<b>Add an account</b>",
            halign: settings_Align.START
        });
        mainBox.add(addAcountLabel);
        const availableAccountList = new ListBox;
        availableAccountList.add(createNewAccountListRow());
        availableAccountList.connect("row-activated", ((actor, row) => {
            spawn_command_line_async(`xdg-open ${loginUrl}`);
        }));
        mainBox.add(availableAccountList);
        settings_window.add(mainBox);
        settings_window.show_all();
        Gtk.main();
        settings_window.connect("destroy", (() => {
            server.disconnect();
            Gtk.main_quit();
            log("window destroyed");
        }));
        function startServer() {
            addAccountToSettings({
                provider: "Office365",
                authCode: "0.AUgACo10sm6FhEG9qIMfn_qKSHC6OiWTM6lAks4SlpBdJfoQAFg.AgABAAIAAAD--DLA3VO7QrddgJg7WevrAgDs_wQA9P-zSm_BQe8pLekHSovbe26KYWHtvwkcPqdpE2idVNjKClIs2NdfohxaK-PV7bV6RZxAw4bDPfV5LfVyqDzVwAAS73T5ktwRQ647qnE0iWqajSsWGruG2gbpicarE4JTdZeUpdCvetiMiLC3WDfTotm2Vi0YZKjH1D4s6csZtUydKQyRl6u4gmd2u3A7ouNGNS8ZEmKpry74O17nXO8RE5GcNnLRxNOi7q0rKmB5xIQJNxvSEZSjTavZLTq9K17sCW6by6O4FWFrHazU3pD9L36GoHtxg_YM-lkqVPU5WDxH1EFRbTKNr9ILaDCwXD38rEam43ByAwP8InAbyL8EUEpXjXXWqkg70bVLgcxALQpgh2wk-HMpMG6scbPSpc15GliKrYehCyG59gfmFmT1t42Wf8EyfjAgpGzhoqqcMNAzmQvju1smb8urtD4njsTHAfHbXjJLo1hBRFXnZYf2ZlP25i8aGkKUOrjfr46s6R3G8UUImqXZZ2H0DwVOLx6hZedB3mJRylsb2sGqDVobsjMXQyl-dSuxVdNDQfrQipx7Wmpt-jXLZpao457i0AQqMNzqH_FvXUUrG54xq6NfRAbHxELF6s3gIF5almJM-CiLw56yYGIdKNWFQnJgnCuSRyF9esGYbLf6G6n5wHGhSM4n7KzD8g0zrNgQWZ5UbOl-NwBbRRKTvGZg2WiR3-JKNPy4GjJ7c0hbFEL3mDar3a8w-AaLRZgYcyAuXWRz_31yac0p1JLDlszLeJBy6oey989ZoahdEONYlqXg"
            });
        }
    })();
    reminderApplet = __webpack_exports__;
})();