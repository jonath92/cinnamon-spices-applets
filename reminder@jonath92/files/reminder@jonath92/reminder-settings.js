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
        ({
            uuid: "reminder@jonath92",
            path: "/home/jonathan/Projekte/cinnamon-spices-applets/reminder@jonath92/files/reminder@jonath92"
        }).path;
        ({
            uuid: "reminder@jonath92",
            path: "/home/jonathan/Projekte/cinnamon-spices-applets/reminder@jonath92/files/reminder@jonath92"
        }).uuid.split("@")[0];
        const OFFICE365_CLIENT_ID = "cbabb902-d276-4ea4-aa88-062a5889d6dc";
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
        const {new_for_path} = imports.gi.Gio.File;
        const SETTINGS_PATH = CONFIG_DIR + "/settings.json";
        imports.byteArray;
        const settingsFile = new_for_path(SETTINGS_PATH);
        const {FileCreateFlags} = imports.gi.Gio;
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
                settingsFile.create(FileCreateFlags.REPLACE_DESTINATION, null);
            }
            try {
                settingsFile.replace_contents(JSON.stringify(settings, null, 3), null, false, FileCreateFlags.REPLACE_DESTINATION, null);
            } catch (error) {}
        }
        function addAccountToSettings(account) {
            var _a;
            const settings = loadSettingsFromFile();
            null === (_a = settings.accounts) || void 0 === _a || _a.push(account);
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
        imports.gi.WebKit2;
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
        const {Box: settings_Box, Orientation: settings_Orientation, Align: settings_Align, ListBox, Label: settings_Label} = Gtk;
        const server = new Server({
            port: 8080
        });
        startServer();
        log(ARGV);
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
            server.connect("request-finished", ((serv, message, client) => {
                server.disconnect();
            }));
            server.add_handler(null, ((server, msg, path, query) => {
                msg.set_response("text/html", MemoryUse.COPY, `<!DOCTYPE html>\n                <html lang="en">\n                <head>\n                    <meta charset="UTF-8">\n                    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n                    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n                    <title>Document</title>\n                </head>\n                <body>\n                    <h2>Logged in sucessfully. You may now close the tab<h2/>\n                </body>\n                </html>`);
                const code = query.code;
                if (!code) return;
                addAccountToSettings({
                    mail: "dummy3",
                    provider: "Office365",
                    authCode: code
                });
                log(query.code);
            }));
            server.run_async();
        }
    })();
    reminderApplet = __webpack_exports__;
})();