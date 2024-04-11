var reminderApplet;

(() => {
    var __webpack_modules__ = {
        447: (__unused_webpack_module, exports) => {
            "use strict";
            true;
            var _a = imports.gi.St, BoxLayout = _a.BoxLayout, Bin = _a.Bin, Side = _a.Side;
            var _b = imports.ui.main, uiGroup = _b.uiGroup, layoutManager = _b.layoutManager, panelManager = _b.panelManager, pushModal = _b.pushModal, popModal = _b.popModal;
            var KEY_Escape = imports.gi.Clutter.KEY_Escape;
            var util_get_transformed_allocation = imports.gi.Cinnamon.util_get_transformed_allocation;
            var PanelLoc = imports.ui.popupMenu.PanelLoc;
            function createPopupMenu(args) {
                var launcher = args.launcher;
                var box = new BoxLayout({
                    style_class: "popup-menu-content",
                    vertical: true,
                    visible: false
                });
                var bin = new Bin({
                    style_class: "menu",
                    child: box,
                    visible: false
                });
                uiGroup.add_child(bin);
                box.connect("key-press-event", (function(actor, event) {
                    event.get_key_symbol() === KEY_Escape && close();
                }));
                launcher.connect("queue-relayout", (function() {
                    if (!box.visible) return;
                    setTimeout((function() {
                        setLayout();
                    }), 0);
                }));
                bin.connect("queue-relayout", (function() {
                    if (!box.visible) return;
                    setTimeout((function() {
                        setLayout();
                    }), 0);
                }));
                function setLayout() {
                    var freeSpace = calculateFreeSpace();
                    var maxHeight = calculateMaxHeight(freeSpace);
                    box.style = "max-height: " + maxHeight + "px;";
                    var _a = calculatePosition(maxHeight, freeSpace), xPos = _a[0], yPos = _a[1];
                    bin.set_position(Math.floor(xPos), Math.floor(yPos));
                }
                function calculateFreeSpace() {
                    var _a, _b, _c, _d;
                    var monitor = layoutManager.findMonitorForActor(launcher);
                    var visiblePanels = panelManager.getPanelsInMonitor(monitor.index);
                    var panelSizes = new Map(visiblePanels.map((function(panel) {
                        var width = 0, height = 0;
                        if (panel.getIsVisible()) {
                            width = panel.actor.width;
                            height = panel.actor.height;
                        }
                        return [ panel.panelPosition, {
                            width,
                            height
                        } ];
                    })));
                    return {
                        left: monitor.x + ((null === (_a = panelSizes.get(PanelLoc.left)) || void 0 === _a ? void 0 : _a.width) || 0),
                        bottom: monitor.y + monitor.height - ((null === (_b = panelSizes.get(PanelLoc.bottom)) || void 0 === _b ? void 0 : _b.height) || 0),
                        top: monitor.y + ((null === (_c = panelSizes.get(PanelLoc.top)) || void 0 === _c ? void 0 : _c.height) || 0),
                        right: monitor.x + monitor.width - ((null === (_d = panelSizes.get(PanelLoc.right)) || void 0 === _d ? void 0 : _d.width) || 0)
                    };
                }
                function calculateMaxHeight(freeSpace) {
                    var freeSpaceHeight = (freeSpace.bottom - freeSpace.top) / global.ui_scale;
                    var boxThemeNode = box.get_theme_node();
                    var binThemeNode = bin.get_theme_node();
                    var paddingTopBox = boxThemeNode.get_padding(Side.TOP);
                    var paddingBottomBox = boxThemeNode.get_padding(Side.BOTTOM);
                    var borderWidthTopBin = binThemeNode.get_border_width(Side.TOP);
                    var borderWidthBottomBIN = binThemeNode.get_border_width(Side.BOTTOM);
                    var paddingTopBin = binThemeNode.get_padding(Side.TOP);
                    var paddingBottomBin = binThemeNode.get_padding(Side.BOTTOM);
                    var maxHeight = freeSpaceHeight - paddingBottomBox - paddingTopBox - borderWidthTopBin - borderWidthBottomBIN - paddingTopBin - paddingBottomBin;
                    return maxHeight;
                }
                function calculatePosition(maxHeight, freeSpace) {
                    var appletBox = util_get_transformed_allocation(launcher);
                    var _a = box.get_preferred_size(), natWidth = (_a[0], _a[1], _a[2]), natHeight = _a[3];
                    var margin = (natWidth - appletBox.get_width()) / 2;
                    var xLeftNormal = Math.max(freeSpace.left, appletBox.x1 - margin);
                    var xRightNormal = appletBox.x2 + margin;
                    var xLeftMax = freeSpace.right - appletBox.get_width() - 2 * margin;
                    var xLeft = xRightNormal < freeSpace.right ? xLeftNormal : xLeftMax;
                    var yTopNormal = Math.max(appletBox.y1, freeSpace.top);
                    var yBottomNormal = yTopNormal + natHeight;
                    var yTopMax = freeSpace.bottom - box.height;
                    var yTop = yBottomNormal < freeSpace.bottom ? yTopNormal : yTopMax;
                    return [ xLeft, yTop ];
                }
                function toggle() {
                    box.visible ? close() : open();
                }
                function open() {
                    setLayout();
                    bin.show();
                    box.show();
                    launcher.add_style_pseudo_class("checked");
                    pushModal(box);
                    global.stage.connect("button-press-event", handleClick);
                    global.stage.connect("button-release-event", handleClick);
                }
                function close() {
                    if (!box.visible) return;
                    bin.hide();
                    box.hide();
                    launcher.remove_style_pseudo_class("checked");
                    popModal(box);
                }
                function handleClick(actor, event) {
                    if (!box.visible) return;
                    var clickedActor = event.get_source();
                    var binClicked = box.contains(clickedActor);
                    var appletClicked = launcher.contains(clickedActor);
                    !binClicked && !appletClicked && close();
                }
                box.toggle = toggle;
                box.close = close;
                return box;
            }
            exports.S = createPopupMenu;
        },
        20: module => {
            "use strict";
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
            "use strict";
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
        486: function(module, exports, __webpack_require__) {
            module = __webpack_require__.nmd(module);
            var __WEBPACK_AMD_DEFINE_RESULT__;
            /**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */            (function() {
                var undefined;
                var VERSION = "4.17.21";
                var LARGE_ARRAY_SIZE = 200;
                var CORE_ERROR_TEXT = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", FUNC_ERROR_TEXT = "Expected a function", INVALID_TEMPL_VAR_ERROR_TEXT = "Invalid `variable` option passed into `_.template`";
                var HASH_UNDEFINED = "__lodash_hash_undefined__";
                var MAX_MEMOIZE_SIZE = 500;
                var PLACEHOLDER = "__lodash_placeholder__";
                var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
                var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
                var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG = 8, WRAP_CURRY_RIGHT_FLAG = 16, WRAP_PARTIAL_FLAG = 32, WRAP_PARTIAL_RIGHT_FLAG = 64, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG = 256, WRAP_FLIP_FLAG = 512;
                var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
                var HOT_COUNT = 800, HOT_SPAN = 16;
                var LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, LAZY_WHILE_FLAG = 3;
                var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 17976931348623157e292, NAN = 0 / 0;
                var MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
                var wrapFlags = [ [ "ary", WRAP_ARY_FLAG ], [ "bind", WRAP_BIND_FLAG ], [ "bindKey", WRAP_BIND_KEY_FLAG ], [ "curry", WRAP_CURRY_FLAG ], [ "curryRight", WRAP_CURRY_RIGHT_FLAG ], [ "flip", WRAP_FLIP_FLAG ], [ "partial", WRAP_PARTIAL_FLAG ], [ "partialRight", WRAP_PARTIAL_RIGHT_FLAG ], [ "rearg", WRAP_REARG_FLAG ] ];
                var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", domExcTag = "[object DOMException]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]", weakSetTag = "[object WeakSet]";
                var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
                var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
                var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reUnescapedHtml = /[&<>"']/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
                var reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g;
                var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
                var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
                var reTrimStart = /^\s+/;
                var reWhitespace = /\s/;
                var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
                var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
                var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;
                var reEscapeChar = /\\(\\)?/g;
                var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
                var reFlags = /\w*$/;
                var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
                var reIsBinary = /^0b[01]+$/i;
                var reIsHostCtor = /^\[object .+?Constructor\]$/;
                var reIsOctal = /^0o[0-7]+$/i;
                var reIsUint = /^(?:0|[1-9]\d*)$/;
                var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
                var reNoMatch = /($^)/;
                var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
                var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
                var rsApos = "['’]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
                var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [ rsNonAstral, rsRegional, rsSurrPair ].join("|") + ")" + rsOptVar + reOptMod + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [ rsDingbat, rsRegional, rsSurrPair ].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [ rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral ].join("|") + ")";
                var reApos = RegExp(rsApos, "g");
                var reComboMark = RegExp(rsCombo, "g");
                var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
                var reUnicodeWord = RegExp([ rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [ rsBreak, rsUpper, "$" ].join("|") + ")", rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [ rsBreak, rsUpper + rsMiscLower, "$" ].join("|") + ")", rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower, rsUpper + "+" + rsOptContrUpper, rsOrdUpper, rsOrdLower, rsDigits, rsEmoji ].join("|"), "g");
                var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
                var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
                var contextProps = [ "Array", "Buffer", "DataView", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Math", "Object", "Promise", "RegExp", "Set", "String", "Symbol", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "_", "clearTimeout", "isFinite", "parseInt", "setTimeout" ];
                var templateCounter = -1;
                var typedArrayTags = {};
                typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
                typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
                var cloneableTags = {};
                cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
                cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
                var deburredLetters = {
                    À: "A",
                    Á: "A",
                    Â: "A",
                    Ã: "A",
                    Ä: "A",
                    Å: "A",
                    à: "a",
                    á: "a",
                    â: "a",
                    ã: "a",
                    ä: "a",
                    å: "a",
                    Ç: "C",
                    ç: "c",
                    Ð: "D",
                    ð: "d",
                    È: "E",
                    É: "E",
                    Ê: "E",
                    Ë: "E",
                    è: "e",
                    é: "e",
                    ê: "e",
                    ë: "e",
                    Ì: "I",
                    Í: "I",
                    Î: "I",
                    Ï: "I",
                    ì: "i",
                    í: "i",
                    î: "i",
                    ï: "i",
                    Ñ: "N",
                    ñ: "n",
                    Ò: "O",
                    Ó: "O",
                    Ô: "O",
                    Õ: "O",
                    Ö: "O",
                    Ø: "O",
                    ò: "o",
                    ó: "o",
                    ô: "o",
                    õ: "o",
                    ö: "o",
                    ø: "o",
                    Ù: "U",
                    Ú: "U",
                    Û: "U",
                    Ü: "U",
                    ù: "u",
                    ú: "u",
                    û: "u",
                    ü: "u",
                    Ý: "Y",
                    ý: "y",
                    ÿ: "y",
                    Æ: "Ae",
                    æ: "ae",
                    Þ: "Th",
                    þ: "th",
                    ß: "ss",
                    Ā: "A",
                    Ă: "A",
                    Ą: "A",
                    ā: "a",
                    ă: "a",
                    ą: "a",
                    Ć: "C",
                    Ĉ: "C",
                    Ċ: "C",
                    Č: "C",
                    ć: "c",
                    ĉ: "c",
                    ċ: "c",
                    č: "c",
                    Ď: "D",
                    Đ: "D",
                    ď: "d",
                    đ: "d",
                    Ē: "E",
                    Ĕ: "E",
                    Ė: "E",
                    Ę: "E",
                    Ě: "E",
                    ē: "e",
                    ĕ: "e",
                    ė: "e",
                    ę: "e",
                    ě: "e",
                    Ĝ: "G",
                    Ğ: "G",
                    Ġ: "G",
                    Ģ: "G",
                    ĝ: "g",
                    ğ: "g",
                    ġ: "g",
                    ģ: "g",
                    Ĥ: "H",
                    Ħ: "H",
                    ĥ: "h",
                    ħ: "h",
                    Ĩ: "I",
                    Ī: "I",
                    Ĭ: "I",
                    Į: "I",
                    İ: "I",
                    ĩ: "i",
                    ī: "i",
                    ĭ: "i",
                    į: "i",
                    ı: "i",
                    Ĵ: "J",
                    ĵ: "j",
                    Ķ: "K",
                    ķ: "k",
                    ĸ: "k",
                    Ĺ: "L",
                    Ļ: "L",
                    Ľ: "L",
                    Ŀ: "L",
                    Ł: "L",
                    ĺ: "l",
                    ļ: "l",
                    ľ: "l",
                    ŀ: "l",
                    ł: "l",
                    Ń: "N",
                    Ņ: "N",
                    Ň: "N",
                    Ŋ: "N",
                    ń: "n",
                    ņ: "n",
                    ň: "n",
                    ŋ: "n",
                    Ō: "O",
                    Ŏ: "O",
                    Ő: "O",
                    ō: "o",
                    ŏ: "o",
                    ő: "o",
                    Ŕ: "R",
                    Ŗ: "R",
                    Ř: "R",
                    ŕ: "r",
                    ŗ: "r",
                    ř: "r",
                    Ś: "S",
                    Ŝ: "S",
                    Ş: "S",
                    Š: "S",
                    ś: "s",
                    ŝ: "s",
                    ş: "s",
                    š: "s",
                    Ţ: "T",
                    Ť: "T",
                    Ŧ: "T",
                    ţ: "t",
                    ť: "t",
                    ŧ: "t",
                    Ũ: "U",
                    Ū: "U",
                    Ŭ: "U",
                    Ů: "U",
                    Ű: "U",
                    Ų: "U",
                    ũ: "u",
                    ū: "u",
                    ŭ: "u",
                    ů: "u",
                    ű: "u",
                    ų: "u",
                    Ŵ: "W",
                    ŵ: "w",
                    Ŷ: "Y",
                    ŷ: "y",
                    Ÿ: "Y",
                    Ź: "Z",
                    Ż: "Z",
                    Ž: "Z",
                    ź: "z",
                    ż: "z",
                    ž: "z",
                    Ĳ: "IJ",
                    ĳ: "ij",
                    Œ: "Oe",
                    œ: "oe",
                    ŉ: "'n",
                    ſ: "s"
                };
                var htmlEscapes = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                };
                var htmlUnescapes = {
                    "&amp;": "&",
                    "&lt;": "<",
                    "&gt;": ">",
                    "&quot;": '"',
                    "&#39;": "'"
                };
                var stringEscapes = {
                    "\\": "\\",
                    "'": "'",
                    "\n": "n",
                    "\r": "r",
                    "\u2028": "u2028",
                    "\u2029": "u2029"
                };
                var freeParseFloat = parseFloat, freeParseInt = parseInt;
                var freeGlobal = "object" == typeof global && global && global.Object === Object && global;
                var freeSelf = "object" == typeof self && self && self.Object === Object && self;
                var root = freeGlobal || freeSelf || Function("return this")();
                var freeExports = true && exports && !exports.nodeType && exports;
                var freeModule = freeExports && "object" == "object" && module && !module.nodeType && module;
                var moduleExports = freeModule && freeModule.exports === freeExports;
                var freeProcess = moduleExports && freeGlobal.process;
                var nodeUtil = function() {
                    try {
                        var types = freeModule && freeModule.require && freeModule.require("util").types;
                        if (types) return types;
                        return freeProcess && freeProcess.binding && freeProcess.binding("util");
                    } catch (e) {}
                }();
                var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer, nodeIsDate = nodeUtil && nodeUtil.isDate, nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsRegExp = nodeUtil && nodeUtil.isRegExp, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
                function apply(func, thisArg, args) {
                    switch (args.length) {
                      case 0:
                        return func.call(thisArg);

                      case 1:
                        return func.call(thisArg, args[0]);

                      case 2:
                        return func.call(thisArg, args[0], args[1]);

                      case 3:
                        return func.call(thisArg, args[0], args[1], args[2]);
                    }
                    return func.apply(thisArg, args);
                }
                function arrayAggregator(array, setter, iteratee, accumulator) {
                    var index = -1, length = null == array ? 0 : array.length;
                    while (++index < length) {
                        var value = array[index];
                        setter(accumulator, value, iteratee(value), array);
                    }
                    return accumulator;
                }
                function arrayEach(array, iteratee) {
                    var index = -1, length = null == array ? 0 : array.length;
                    while (++index < length) if (false === iteratee(array[index], index, array)) break;
                    return array;
                }
                function arrayEachRight(array, iteratee) {
                    var length = null == array ? 0 : array.length;
                    while (length--) if (false === iteratee(array[length], length, array)) break;
                    return array;
                }
                function arrayEvery(array, predicate) {
                    var index = -1, length = null == array ? 0 : array.length;
                    while (++index < length) if (!predicate(array[index], index, array)) return false;
                    return true;
                }
                function arrayFilter(array, predicate) {
                    var index = -1, length = null == array ? 0 : array.length, resIndex = 0, result = [];
                    while (++index < length) {
                        var value = array[index];
                        if (predicate(value, index, array)) result[resIndex++] = value;
                    }
                    return result;
                }
                function arrayIncludes(array, value) {
                    var length = null == array ? 0 : array.length;
                    return !!length && baseIndexOf(array, value, 0) > -1;
                }
                function arrayIncludesWith(array, value, comparator) {
                    var index = -1, length = null == array ? 0 : array.length;
                    while (++index < length) if (comparator(value, array[index])) return true;
                    return false;
                }
                function arrayMap(array, iteratee) {
                    var index = -1, length = null == array ? 0 : array.length, result = Array(length);
                    while (++index < length) result[index] = iteratee(array[index], index, array);
                    return result;
                }
                function arrayPush(array, values) {
                    var index = -1, length = values.length, offset = array.length;
                    while (++index < length) array[offset + index] = values[index];
                    return array;
                }
                function arrayReduce(array, iteratee, accumulator, initAccum) {
                    var index = -1, length = null == array ? 0 : array.length;
                    if (initAccum && length) accumulator = array[++index];
                    while (++index < length) accumulator = iteratee(accumulator, array[index], index, array);
                    return accumulator;
                }
                function arrayReduceRight(array, iteratee, accumulator, initAccum) {
                    var length = null == array ? 0 : array.length;
                    if (initAccum && length) accumulator = array[--length];
                    while (length--) accumulator = iteratee(accumulator, array[length], length, array);
                    return accumulator;
                }
                function arraySome(array, predicate) {
                    var index = -1, length = null == array ? 0 : array.length;
                    while (++index < length) if (predicate(array[index], index, array)) return true;
                    return false;
                }
                var asciiSize = baseProperty("length");
                function asciiToArray(string) {
                    return string.split("");
                }
                function asciiWords(string) {
                    return string.match(reAsciiWord) || [];
                }
                function baseFindKey(collection, predicate, eachFunc) {
                    var result;
                    eachFunc(collection, (function(value, key, collection) {
                        if (predicate(value, key, collection)) {
                            result = key;
                            return false;
                        }
                    }));
                    return result;
                }
                function baseFindIndex(array, predicate, fromIndex, fromRight) {
                    var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
                    while (fromRight ? index-- : ++index < length) if (predicate(array[index], index, array)) return index;
                    return -1;
                }
                function baseIndexOf(array, value, fromIndex) {
                    return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
                }
                function baseIndexOfWith(array, value, fromIndex, comparator) {
                    var index = fromIndex - 1, length = array.length;
                    while (++index < length) if (comparator(array[index], value)) return index;
                    return -1;
                }
                function baseIsNaN(value) {
                    return value !== value;
                }
                function baseMean(array, iteratee) {
                    var length = null == array ? 0 : array.length;
                    return length ? baseSum(array, iteratee) / length : NAN;
                }
                function baseProperty(key) {
                    return function(object) {
                        return null == object ? undefined : object[key];
                    };
                }
                function basePropertyOf(object) {
                    return function(key) {
                        return null == object ? undefined : object[key];
                    };
                }
                function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
                    eachFunc(collection, (function(value, index, collection) {
                        accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection);
                    }));
                    return accumulator;
                }
                function baseSortBy(array, comparer) {
                    var length = array.length;
                    array.sort(comparer);
                    while (length--) array[length] = array[length].value;
                    return array;
                }
                function baseSum(array, iteratee) {
                    var result, index = -1, length = array.length;
                    while (++index < length) {
                        var current = iteratee(array[index]);
                        if (current !== undefined) result = result === undefined ? current : result + current;
                    }
                    return result;
                }
                function baseTimes(n, iteratee) {
                    var index = -1, result = Array(n);
                    while (++index < n) result[index] = iteratee(index);
                    return result;
                }
                function baseToPairs(object, props) {
                    return arrayMap(props, (function(key) {
                        return [ key, object[key] ];
                    }));
                }
                function baseTrim(string) {
                    return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
                }
                function baseUnary(func) {
                    return function(value) {
                        return func(value);
                    };
                }
                function baseValues(object, props) {
                    return arrayMap(props, (function(key) {
                        return object[key];
                    }));
                }
                function cacheHas(cache, key) {
                    return cache.has(key);
                }
                function charsStartIndex(strSymbols, chrSymbols) {
                    var index = -1, length = strSymbols.length;
                    while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) ;
                    return index;
                }
                function charsEndIndex(strSymbols, chrSymbols) {
                    var index = strSymbols.length;
                    while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) ;
                    return index;
                }
                function countHolders(array, placeholder) {
                    var length = array.length, result = 0;
                    while (length--) if (array[length] === placeholder) ++result;
                    return result;
                }
                var deburrLetter = basePropertyOf(deburredLetters);
                var escapeHtmlChar = basePropertyOf(htmlEscapes);
                function escapeStringChar(chr) {
                    return "\\" + stringEscapes[chr];
                }
                function getValue(object, key) {
                    return null == object ? undefined : object[key];
                }
                function hasUnicode(string) {
                    return reHasUnicode.test(string);
                }
                function hasUnicodeWord(string) {
                    return reHasUnicodeWord.test(string);
                }
                function iteratorToArray(iterator) {
                    var data, result = [];
                    while (!(data = iterator.next()).done) result.push(data.value);
                    return result;
                }
                function mapToArray(map) {
                    var index = -1, result = Array(map.size);
                    map.forEach((function(value, key) {
                        result[++index] = [ key, value ];
                    }));
                    return result;
                }
                function overArg(func, transform) {
                    return function(arg) {
                        return func(transform(arg));
                    };
                }
                function replaceHolders(array, placeholder) {
                    var index = -1, length = array.length, resIndex = 0, result = [];
                    while (++index < length) {
                        var value = array[index];
                        if (value === placeholder || value === PLACEHOLDER) {
                            array[index] = PLACEHOLDER;
                            result[resIndex++] = index;
                        }
                    }
                    return result;
                }
                function setToArray(set) {
                    var index = -1, result = Array(set.size);
                    set.forEach((function(value) {
                        result[++index] = value;
                    }));
                    return result;
                }
                function setToPairs(set) {
                    var index = -1, result = Array(set.size);
                    set.forEach((function(value) {
                        result[++index] = [ value, value ];
                    }));
                    return result;
                }
                function strictIndexOf(array, value, fromIndex) {
                    var index = fromIndex - 1, length = array.length;
                    while (++index < length) if (array[index] === value) return index;
                    return -1;
                }
                function strictLastIndexOf(array, value, fromIndex) {
                    var index = fromIndex + 1;
                    while (index--) if (array[index] === value) return index;
                    return index;
                }
                function stringSize(string) {
                    return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
                }
                function stringToArray(string) {
                    return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
                }
                function trimmedEndIndex(string) {
                    var index = string.length;
                    while (index-- && reWhitespace.test(string.charAt(index))) ;
                    return index;
                }
                var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
                function unicodeSize(string) {
                    var result = reUnicode.lastIndex = 0;
                    while (reUnicode.test(string)) ++result;
                    return result;
                }
                function unicodeToArray(string) {
                    return string.match(reUnicode) || [];
                }
                function unicodeWords(string) {
                    return string.match(reUnicodeWord) || [];
                }
                var runInContext = function runInContext(context) {
                    context = null == context ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));
                    var Array = context.Array, Date = context.Date, Error = context.Error, Function = context.Function, Math = context.Math, Object = context.Object, RegExp = context.RegExp, String = context.String, TypeError = context.TypeError;
                    var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
                    var coreJsData = context["__core-js_shared__"];
                    var funcToString = funcProto.toString;
                    var hasOwnProperty = objectProto.hasOwnProperty;
                    var idCounter = 0;
                    var maskSrcKey = function() {
                        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
                        return uid ? "Symbol(src)_1." + uid : "";
                    }();
                    var nativeObjectToString = objectProto.toString;
                    var objectCtorString = funcToString.call(Object);
                    var oldDash = root._;
                    var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
                    var Buffer = moduleExports ? context.Buffer : undefined, Symbol = context.Symbol, Uint8Array = context.Uint8Array, allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined, getPrototype = overArg(Object.getPrototypeOf, Object), objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined, symIterator = Symbol ? Symbol.iterator : undefined, symToStringTag = Symbol ? Symbol.toStringTag : undefined;
                    var defineProperty = function() {
                        try {
                            var func = getNative(Object, "defineProperty");
                            func({}, "", {});
                            return func;
                        } catch (e) {}
                    }();
                    var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout, ctxNow = Date && Date.now !== root.Date.now && Date.now, ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
                    var nativeCeil = Math.ceil, nativeFloor = Math.floor, nativeGetSymbols = Object.getOwnPropertySymbols, nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined, nativeIsFinite = context.isFinite, nativeJoin = arrayProto.join, nativeKeys = overArg(Object.keys, Object), nativeMax = Math.max, nativeMin = Math.min, nativeNow = Date.now, nativeParseInt = context.parseInt, nativeRandom = Math.random, nativeReverse = arrayProto.reverse;
                    var DataView = getNative(context, "DataView"), Map = getNative(context, "Map"), Promise = getNative(context, "Promise"), Set = getNative(context, "Set"), WeakMap = getNative(context, "WeakMap"), nativeCreate = getNative(Object, "create");
                    var metaMap = WeakMap && new WeakMap;
                    var realNames = {};
                    var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map), promiseCtorString = toSource(Promise), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
                    var symbolProto = Symbol ? Symbol.prototype : undefined, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined, symbolToString = symbolProto ? symbolProto.toString : undefined;
                    function lodash(value) {
                        if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
                            if (value instanceof LodashWrapper) return value;
                            if (hasOwnProperty.call(value, "__wrapped__")) return wrapperClone(value);
                        }
                        return new LodashWrapper(value);
                    }
                    var baseCreate = function() {
                        function object() {}
                        return function(proto) {
                            if (!isObject(proto)) return {};
                            if (objectCreate) return objectCreate(proto);
                            object.prototype = proto;
                            var result = new object;
                            object.prototype = undefined;
                            return result;
                        };
                    }();
                    function baseLodash() {}
                    function LodashWrapper(value, chainAll) {
                        this.__wrapped__ = value;
                        this.__actions__ = [];
                        this.__chain__ = !!chainAll;
                        this.__index__ = 0;
                        this.__values__ = undefined;
                    }
                    lodash.templateSettings = {
                        escape: reEscape,
                        evaluate: reEvaluate,
                        interpolate: reInterpolate,
                        variable: "",
                        imports: {
                            _: lodash
                        }
                    };
                    lodash.prototype = baseLodash.prototype;
                    lodash.prototype.constructor = lodash;
                    LodashWrapper.prototype = baseCreate(baseLodash.prototype);
                    LodashWrapper.prototype.constructor = LodashWrapper;
                    function LazyWrapper(value) {
                        this.__wrapped__ = value;
                        this.__actions__ = [];
                        this.__dir__ = 1;
                        this.__filtered__ = false;
                        this.__iteratees__ = [];
                        this.__takeCount__ = MAX_ARRAY_LENGTH;
                        this.__views__ = [];
                    }
                    function lazyClone() {
                        var result = new LazyWrapper(this.__wrapped__);
                        result.__actions__ = copyArray(this.__actions__);
                        result.__dir__ = this.__dir__;
                        result.__filtered__ = this.__filtered__;
                        result.__iteratees__ = copyArray(this.__iteratees__);
                        result.__takeCount__ = this.__takeCount__;
                        result.__views__ = copyArray(this.__views__);
                        return result;
                    }
                    function lazyReverse() {
                        if (this.__filtered__) {
                            var result = new LazyWrapper(this);
                            result.__dir__ = -1;
                            result.__filtered__ = true;
                        } else {
                            result = this.clone();
                            result.__dir__ *= -1;
                        }
                        return result;
                    }
                    function lazyValue() {
                        var array = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array), isRight = dir < 0, arrLength = isArr ? array.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
                        if (!isArr || !isRight && arrLength == length && takeCount == length) return baseWrapperValue(array, this.__actions__);
                        var result = [];
                        outer: while (length-- && resIndex < takeCount) {
                            index += dir;
                            var iterIndex = -1, value = array[index];
                            while (++iterIndex < iterLength) {
                                var data = iteratees[iterIndex], iteratee = data.iteratee, type = data.type, computed = iteratee(value);
                                if (type == LAZY_MAP_FLAG) value = computed; else if (!computed) if (type == LAZY_FILTER_FLAG) continue outer; else break outer;
                            }
                            result[resIndex++] = value;
                        }
                        return result;
                    }
                    LazyWrapper.prototype = baseCreate(baseLodash.prototype);
                    LazyWrapper.prototype.constructor = LazyWrapper;
                    function Hash(entries) {
                        var index = -1, length = null == entries ? 0 : entries.length;
                        this.clear();
                        while (++index < length) {
                            var entry = entries[index];
                            this.set(entry[0], entry[1]);
                        }
                    }
                    function hashClear() {
                        this.__data__ = nativeCreate ? nativeCreate(null) : {};
                        this.size = 0;
                    }
                    function hashDelete(key) {
                        var result = this.has(key) && delete this.__data__[key];
                        this.size -= result ? 1 : 0;
                        return result;
                    }
                    function hashGet(key) {
                        var data = this.__data__;
                        if (nativeCreate) {
                            var result = data[key];
                            return result === HASH_UNDEFINED ? undefined : result;
                        }
                        return hasOwnProperty.call(data, key) ? data[key] : undefined;
                    }
                    function hashHas(key) {
                        var data = this.__data__;
                        return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
                    }
                    function hashSet(key, value) {
                        var data = this.__data__;
                        this.size += this.has(key) ? 0 : 1;
                        data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
                        return this;
                    }
                    Hash.prototype.clear = hashClear;
                    Hash.prototype["delete"] = hashDelete;
                    Hash.prototype.get = hashGet;
                    Hash.prototype.has = hashHas;
                    Hash.prototype.set = hashSet;
                    function ListCache(entries) {
                        var index = -1, length = null == entries ? 0 : entries.length;
                        this.clear();
                        while (++index < length) {
                            var entry = entries[index];
                            this.set(entry[0], entry[1]);
                        }
                    }
                    function listCacheClear() {
                        this.__data__ = [];
                        this.size = 0;
                    }
                    function listCacheDelete(key) {
                        var data = this.__data__, index = assocIndexOf(data, key);
                        if (index < 0) return false;
                        var lastIndex = data.length - 1;
                        if (index == lastIndex) data.pop(); else splice.call(data, index, 1);
                        --this.size;
                        return true;
                    }
                    function listCacheGet(key) {
                        var data = this.__data__, index = assocIndexOf(data, key);
                        return index < 0 ? undefined : data[index][1];
                    }
                    function listCacheHas(key) {
                        return assocIndexOf(this.__data__, key) > -1;
                    }
                    function listCacheSet(key, value) {
                        var data = this.__data__, index = assocIndexOf(data, key);
                        if (index < 0) {
                            ++this.size;
                            data.push([ key, value ]);
                        } else data[index][1] = value;
                        return this;
                    }
                    ListCache.prototype.clear = listCacheClear;
                    ListCache.prototype["delete"] = listCacheDelete;
                    ListCache.prototype.get = listCacheGet;
                    ListCache.prototype.has = listCacheHas;
                    ListCache.prototype.set = listCacheSet;
                    function MapCache(entries) {
                        var index = -1, length = null == entries ? 0 : entries.length;
                        this.clear();
                        while (++index < length) {
                            var entry = entries[index];
                            this.set(entry[0], entry[1]);
                        }
                    }
                    function mapCacheClear() {
                        this.size = 0;
                        this.__data__ = {
                            hash: new Hash,
                            map: new (Map || ListCache),
                            string: new Hash
                        };
                    }
                    function mapCacheDelete(key) {
                        var result = getMapData(this, key)["delete"](key);
                        this.size -= result ? 1 : 0;
                        return result;
                    }
                    function mapCacheGet(key) {
                        return getMapData(this, key).get(key);
                    }
                    function mapCacheHas(key) {
                        return getMapData(this, key).has(key);
                    }
                    function mapCacheSet(key, value) {
                        var data = getMapData(this, key), size = data.size;
                        data.set(key, value);
                        this.size += data.size == size ? 0 : 1;
                        return this;
                    }
                    MapCache.prototype.clear = mapCacheClear;
                    MapCache.prototype["delete"] = mapCacheDelete;
                    MapCache.prototype.get = mapCacheGet;
                    MapCache.prototype.has = mapCacheHas;
                    MapCache.prototype.set = mapCacheSet;
                    function SetCache(values) {
                        var index = -1, length = null == values ? 0 : values.length;
                        this.__data__ = new MapCache;
                        while (++index < length) this.add(values[index]);
                    }
                    function setCacheAdd(value) {
                        this.__data__.set(value, HASH_UNDEFINED);
                        return this;
                    }
                    function setCacheHas(value) {
                        return this.__data__.has(value);
                    }
                    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
                    SetCache.prototype.has = setCacheHas;
                    function Stack(entries) {
                        var data = this.__data__ = new ListCache(entries);
                        this.size = data.size;
                    }
                    function stackClear() {
                        this.__data__ = new ListCache;
                        this.size = 0;
                    }
                    function stackDelete(key) {
                        var data = this.__data__, result = data["delete"](key);
                        this.size = data.size;
                        return result;
                    }
                    function stackGet(key) {
                        return this.__data__.get(key);
                    }
                    function stackHas(key) {
                        return this.__data__.has(key);
                    }
                    function stackSet(key, value) {
                        var data = this.__data__;
                        if (data instanceof ListCache) {
                            var pairs = data.__data__;
                            if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
                                pairs.push([ key, value ]);
                                this.size = ++data.size;
                                return this;
                            }
                            data = this.__data__ = new MapCache(pairs);
                        }
                        data.set(key, value);
                        this.size = data.size;
                        return this;
                    }
                    Stack.prototype.clear = stackClear;
                    Stack.prototype["delete"] = stackDelete;
                    Stack.prototype.get = stackGet;
                    Stack.prototype.has = stackHas;
                    Stack.prototype.set = stackSet;
                    function arrayLikeKeys(value, inherited) {
                        var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
                        for (var key in value) if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && ("length" == key || isBuff && ("offset" == key || "parent" == key) || isType && ("buffer" == key || "byteLength" == key || "byteOffset" == key) || isIndex(key, length)))) result.push(key);
                        return result;
                    }
                    function arraySample(array) {
                        var length = array.length;
                        return length ? array[baseRandom(0, length - 1)] : undefined;
                    }
                    function arraySampleSize(array, n) {
                        return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
                    }
                    function arrayShuffle(array) {
                        return shuffleSelf(copyArray(array));
                    }
                    function assignMergeValue(object, key, value) {
                        if (value !== undefined && !eq(object[key], value) || value === undefined && !(key in object)) baseAssignValue(object, key, value);
                    }
                    function assignValue(object, key, value) {
                        var objValue = object[key];
                        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) baseAssignValue(object, key, value);
                    }
                    function assocIndexOf(array, key) {
                        var length = array.length;
                        while (length--) if (eq(array[length][0], key)) return length;
                        return -1;
                    }
                    function baseAggregator(collection, setter, iteratee, accumulator) {
                        baseEach(collection, (function(value, key, collection) {
                            setter(accumulator, value, iteratee(value), collection);
                        }));
                        return accumulator;
                    }
                    function baseAssign(object, source) {
                        return object && copyObject(source, keys(source), object);
                    }
                    function baseAssignIn(object, source) {
                        return object && copyObject(source, keysIn(source), object);
                    }
                    function baseAssignValue(object, key, value) {
                        if ("__proto__" == key && defineProperty) defineProperty(object, key, {
                            configurable: true,
                            enumerable: true,
                            value,
                            writable: true
                        }); else object[key] = value;
                    }
                    function baseAt(object, paths) {
                        var index = -1, length = paths.length, result = Array(length), skip = null == object;
                        while (++index < length) result[index] = skip ? undefined : get(object, paths[index]);
                        return result;
                    }
                    function baseClamp(number, lower, upper) {
                        if (number === number) {
                            if (upper !== undefined) number = number <= upper ? number : upper;
                            if (lower !== undefined) number = number >= lower ? number : lower;
                        }
                        return number;
                    }
                    function baseClone(value, bitmask, customizer, key, object, stack) {
                        var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
                        if (customizer) result = object ? customizer(value, key, object, stack) : customizer(value);
                        if (result !== undefined) return result;
                        if (!isObject(value)) return value;
                        var isArr = isArray(value);
                        if (isArr) {
                            result = initCloneArray(value);
                            if (!isDeep) return copyArray(value, result);
                        } else {
                            var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
                            if (isBuffer(value)) return cloneBuffer(value, isDeep);
                            if (tag == objectTag || tag == argsTag || isFunc && !object) {
                                result = isFlat || isFunc ? {} : initCloneObject(value);
                                if (!isDeep) return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
                            } else {
                                if (!cloneableTags[tag]) return object ? value : {};
                                result = initCloneByTag(value, tag, isDeep);
                            }
                        }
                        stack || (stack = new Stack);
                        var stacked = stack.get(value);
                        if (stacked) return stacked;
                        stack.set(value, result);
                        if (isSet(value)) value.forEach((function(subValue) {
                            result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
                        })); else if (isMap(value)) value.forEach((function(subValue, key) {
                            result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
                        }));
                        var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
                        var props = isArr ? undefined : keysFunc(value);
                        arrayEach(props || value, (function(subValue, key) {
                            if (props) {
                                key = subValue;
                                subValue = value[key];
                            }
                            assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
                        }));
                        return result;
                    }
                    function baseConforms(source) {
                        var props = keys(source);
                        return function(object) {
                            return baseConformsTo(object, source, props);
                        };
                    }
                    function baseConformsTo(object, source, props) {
                        var length = props.length;
                        if (null == object) return !length;
                        object = Object(object);
                        while (length--) {
                            var key = props[length], predicate = source[key], value = object[key];
                            if (value === undefined && !(key in object) || !predicate(value)) return false;
                        }
                        return true;
                    }
                    function baseDelay(func, wait, args) {
                        if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                        return setTimeout((function() {
                            func.apply(undefined, args);
                        }), wait);
                    }
                    function baseDifference(array, values, iteratee, comparator) {
                        var index = -1, includes = arrayIncludes, isCommon = true, length = array.length, result = [], valuesLength = values.length;
                        if (!length) return result;
                        if (iteratee) values = arrayMap(values, baseUnary(iteratee));
                        if (comparator) {
                            includes = arrayIncludesWith;
                            isCommon = false;
                        } else if (values.length >= LARGE_ARRAY_SIZE) {
                            includes = cacheHas;
                            isCommon = false;
                            values = new SetCache(values);
                        }
                        outer: while (++index < length) {
                            var value = array[index], computed = null == iteratee ? value : iteratee(value);
                            value = comparator || 0 !== value ? value : 0;
                            if (isCommon && computed === computed) {
                                var valuesIndex = valuesLength;
                                while (valuesIndex--) if (values[valuesIndex] === computed) continue outer;
                                result.push(value);
                            } else if (!includes(values, computed, comparator)) result.push(value);
                        }
                        return result;
                    }
                    var baseEach = createBaseEach(baseForOwn);
                    var baseEachRight = createBaseEach(baseForOwnRight, true);
                    function baseEvery(collection, predicate) {
                        var result = true;
                        baseEach(collection, (function(value, index, collection) {
                            result = !!predicate(value, index, collection);
                            return result;
                        }));
                        return result;
                    }
                    function baseExtremum(array, iteratee, comparator) {
                        var index = -1, length = array.length;
                        while (++index < length) {
                            var value = array[index], current = iteratee(value);
                            if (null != current && (computed === undefined ? current === current && !isSymbol(current) : comparator(current, computed))) var computed = current, result = value;
                        }
                        return result;
                    }
                    function baseFill(array, value, start, end) {
                        var length = array.length;
                        start = toInteger(start);
                        if (start < 0) start = -start > length ? 0 : length + start;
                        end = end === undefined || end > length ? length : toInteger(end);
                        if (end < 0) end += length;
                        end = start > end ? 0 : toLength(end);
                        while (start < end) array[start++] = value;
                        return array;
                    }
                    function baseFilter(collection, predicate) {
                        var result = [];
                        baseEach(collection, (function(value, index, collection) {
                            if (predicate(value, index, collection)) result.push(value);
                        }));
                        return result;
                    }
                    function baseFlatten(array, depth, predicate, isStrict, result) {
                        var index = -1, length = array.length;
                        predicate || (predicate = isFlattenable);
                        result || (result = []);
                        while (++index < length) {
                            var value = array[index];
                            if (depth > 0 && predicate(value)) if (depth > 1) baseFlatten(value, depth - 1, predicate, isStrict, result); else arrayPush(result, value); else if (!isStrict) result[result.length] = value;
                        }
                        return result;
                    }
                    var baseFor = createBaseFor();
                    var baseForRight = createBaseFor(true);
                    function baseForOwn(object, iteratee) {
                        return object && baseFor(object, iteratee, keys);
                    }
                    function baseForOwnRight(object, iteratee) {
                        return object && baseForRight(object, iteratee, keys);
                    }
                    function baseFunctions(object, props) {
                        return arrayFilter(props, (function(key) {
                            return isFunction(object[key]);
                        }));
                    }
                    function baseGet(object, path) {
                        path = castPath(path, object);
                        var index = 0, length = path.length;
                        while (null != object && index < length) object = object[toKey(path[index++])];
                        return index && index == length ? object : undefined;
                    }
                    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
                        var result = keysFunc(object);
                        return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
                    }
                    function baseGetTag(value) {
                        if (null == value) return value === undefined ? undefinedTag : nullTag;
                        return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
                    }
                    function baseGt(value, other) {
                        return value > other;
                    }
                    function baseHas(object, key) {
                        return null != object && hasOwnProperty.call(object, key);
                    }
                    function baseHasIn(object, key) {
                        return null != object && key in Object(object);
                    }
                    function baseInRange(number, start, end) {
                        return number >= nativeMin(start, end) && number < nativeMax(start, end);
                    }
                    function baseIntersection(arrays, iteratee, comparator) {
                        var includes = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array(othLength), maxLength = 1 / 0, result = [];
                        while (othIndex--) {
                            var array = arrays[othIndex];
                            if (othIndex && iteratee) array = arrayMap(array, baseUnary(iteratee));
                            maxLength = nativeMin(array.length, maxLength);
                            caches[othIndex] = !comparator && (iteratee || length >= 120 && array.length >= 120) ? new SetCache(othIndex && array) : undefined;
                        }
                        array = arrays[0];
                        var index = -1, seen = caches[0];
                        outer: while (++index < length && result.length < maxLength) {
                            var value = array[index], computed = iteratee ? iteratee(value) : value;
                            value = comparator || 0 !== value ? value : 0;
                            if (!(seen ? cacheHas(seen, computed) : includes(result, computed, comparator))) {
                                othIndex = othLength;
                                while (--othIndex) {
                                    var cache = caches[othIndex];
                                    if (!(cache ? cacheHas(cache, computed) : includes(arrays[othIndex], computed, comparator))) continue outer;
                                }
                                if (seen) seen.push(computed);
                                result.push(value);
                            }
                        }
                        return result;
                    }
                    function baseInverter(object, setter, iteratee, accumulator) {
                        baseForOwn(object, (function(value, key, object) {
                            setter(accumulator, iteratee(value), key, object);
                        }));
                        return accumulator;
                    }
                    function baseInvoke(object, path, args) {
                        path = castPath(path, object);
                        object = parent(object, path);
                        var func = null == object ? object : object[toKey(last(path))];
                        return null == func ? undefined : apply(func, object, args);
                    }
                    function baseIsArguments(value) {
                        return isObjectLike(value) && baseGetTag(value) == argsTag;
                    }
                    function baseIsArrayBuffer(value) {
                        return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
                    }
                    function baseIsDate(value) {
                        return isObjectLike(value) && baseGetTag(value) == dateTag;
                    }
                    function baseIsEqual(value, other, bitmask, customizer, stack) {
                        if (value === other) return true;
                        if (null == value || null == other || !isObjectLike(value) && !isObjectLike(other)) return value !== value && other !== other;
                        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
                    }
                    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
                        var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
                        objTag = objTag == argsTag ? objectTag : objTag;
                        othTag = othTag == argsTag ? objectTag : othTag;
                        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
                        if (isSameTag && isBuffer(object)) {
                            if (!isBuffer(other)) return false;
                            objIsArr = true;
                            objIsObj = false;
                        }
                        if (isSameTag && !objIsObj) {
                            stack || (stack = new Stack);
                            return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
                        }
                        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
                            var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
                            if (objIsWrapped || othIsWrapped) {
                                var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
                                stack || (stack = new Stack);
                                return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
                            }
                        }
                        if (!isSameTag) return false;
                        stack || (stack = new Stack);
                        return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
                    }
                    function baseIsMap(value) {
                        return isObjectLike(value) && getTag(value) == mapTag;
                    }
                    function baseIsMatch(object, source, matchData, customizer) {
                        var index = matchData.length, length = index, noCustomizer = !customizer;
                        if (null == object) return !length;
                        object = Object(object);
                        while (index--) {
                            var data = matchData[index];
                            if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) return false;
                        }
                        while (++index < length) {
                            data = matchData[index];
                            var key = data[0], objValue = object[key], srcValue = data[1];
                            if (noCustomizer && data[2]) {
                                if (objValue === undefined && !(key in object)) return false;
                            } else {
                                var stack = new Stack;
                                if (customizer) var result = customizer(objValue, srcValue, key, object, source, stack);
                                if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) return false;
                            }
                        }
                        return true;
                    }
                    function baseIsNative(value) {
                        if (!isObject(value) || isMasked(value)) return false;
                        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
                        return pattern.test(toSource(value));
                    }
                    function baseIsRegExp(value) {
                        return isObjectLike(value) && baseGetTag(value) == regexpTag;
                    }
                    function baseIsSet(value) {
                        return isObjectLike(value) && getTag(value) == setTag;
                    }
                    function baseIsTypedArray(value) {
                        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
                    }
                    function baseIteratee(value) {
                        if ("function" == typeof value) return value;
                        if (null == value) return identity;
                        if ("object" == typeof value) return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
                        return property(value);
                    }
                    function baseKeys(object) {
                        if (!isPrototype(object)) return nativeKeys(object);
                        var result = [];
                        for (var key in Object(object)) if (hasOwnProperty.call(object, key) && "constructor" != key) result.push(key);
                        return result;
                    }
                    function baseKeysIn(object) {
                        if (!isObject(object)) return nativeKeysIn(object);
                        var isProto = isPrototype(object), result = [];
                        for (var key in object) if (!("constructor" == key && (isProto || !hasOwnProperty.call(object, key)))) result.push(key);
                        return result;
                    }
                    function baseLt(value, other) {
                        return value < other;
                    }
                    function baseMap(collection, iteratee) {
                        var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
                        baseEach(collection, (function(value, key, collection) {
                            result[++index] = iteratee(value, key, collection);
                        }));
                        return result;
                    }
                    function baseMatches(source) {
                        var matchData = getMatchData(source);
                        if (1 == matchData.length && matchData[0][2]) return matchesStrictComparable(matchData[0][0], matchData[0][1]);
                        return function(object) {
                            return object === source || baseIsMatch(object, source, matchData);
                        };
                    }
                    function baseMatchesProperty(path, srcValue) {
                        if (isKey(path) && isStrictComparable(srcValue)) return matchesStrictComparable(toKey(path), srcValue);
                        return function(object) {
                            var objValue = get(object, path);
                            return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
                        };
                    }
                    function baseMerge(object, source, srcIndex, customizer, stack) {
                        if (object === source) return;
                        baseFor(source, (function(srcValue, key) {
                            stack || (stack = new Stack);
                            if (isObject(srcValue)) baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack); else {
                                var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : undefined;
                                if (newValue === undefined) newValue = srcValue;
                                assignMergeValue(object, key, newValue);
                            }
                        }), keysIn);
                    }
                    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
                        var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
                        if (stacked) {
                            assignMergeValue(object, key, stacked);
                            return;
                        }
                        var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : undefined;
                        var isCommon = newValue === undefined;
                        if (isCommon) {
                            var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
                            newValue = srcValue;
                            if (isArr || isBuff || isTyped) if (isArray(objValue)) newValue = objValue; else if (isArrayLikeObject(objValue)) newValue = copyArray(objValue); else if (isBuff) {
                                isCommon = false;
                                newValue = cloneBuffer(srcValue, true);
                            } else if (isTyped) {
                                isCommon = false;
                                newValue = cloneTypedArray(srcValue, true);
                            } else newValue = []; else if (isPlainObject(srcValue) || isArguments(srcValue)) {
                                newValue = objValue;
                                if (isArguments(objValue)) newValue = toPlainObject(objValue); else if (!isObject(objValue) || isFunction(objValue)) newValue = initCloneObject(srcValue);
                            } else isCommon = false;
                        }
                        if (isCommon) {
                            stack.set(srcValue, newValue);
                            mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
                            stack["delete"](srcValue);
                        }
                        assignMergeValue(object, key, newValue);
                    }
                    function baseNth(array, n) {
                        var length = array.length;
                        if (!length) return;
                        n += n < 0 ? length : 0;
                        return isIndex(n, length) ? array[n] : undefined;
                    }
                    function baseOrderBy(collection, iteratees, orders) {
                        if (iteratees.length) iteratees = arrayMap(iteratees, (function(iteratee) {
                            if (isArray(iteratee)) return function(value) {
                                return baseGet(value, 1 === iteratee.length ? iteratee[0] : iteratee);
                            };
                            return iteratee;
                        })); else iteratees = [ identity ];
                        var index = -1;
                        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
                        var result = baseMap(collection, (function(value, key, collection) {
                            var criteria = arrayMap(iteratees, (function(iteratee) {
                                return iteratee(value);
                            }));
                            return {
                                criteria,
                                index: ++index,
                                value
                            };
                        }));
                        return baseSortBy(result, (function(object, other) {
                            return compareMultiple(object, other, orders);
                        }));
                    }
                    function basePick(object, paths) {
                        return basePickBy(object, paths, (function(value, path) {
                            return hasIn(object, path);
                        }));
                    }
                    function basePickBy(object, paths, predicate) {
                        var index = -1, length = paths.length, result = {};
                        while (++index < length) {
                            var path = paths[index], value = baseGet(object, path);
                            if (predicate(value, path)) baseSet(result, castPath(path, object), value);
                        }
                        return result;
                    }
                    function basePropertyDeep(path) {
                        return function(object) {
                            return baseGet(object, path);
                        };
                    }
                    function basePullAll(array, values, iteratee, comparator) {
                        var indexOf = comparator ? baseIndexOfWith : baseIndexOf, index = -1, length = values.length, seen = array;
                        if (array === values) values = copyArray(values);
                        if (iteratee) seen = arrayMap(array, baseUnary(iteratee));
                        while (++index < length) {
                            var fromIndex = 0, value = values[index], computed = iteratee ? iteratee(value) : value;
                            while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
                                if (seen !== array) splice.call(seen, fromIndex, 1);
                                splice.call(array, fromIndex, 1);
                            }
                        }
                        return array;
                    }
                    function basePullAt(array, indexes) {
                        var length = array ? indexes.length : 0, lastIndex = length - 1;
                        while (length--) {
                            var index = indexes[length];
                            if (length == lastIndex || index !== previous) {
                                var previous = index;
                                if (isIndex(index)) splice.call(array, index, 1); else baseUnset(array, index);
                            }
                        }
                        return array;
                    }
                    function baseRandom(lower, upper) {
                        return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
                    }
                    function baseRange(start, end, step, fromRight) {
                        var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result = Array(length);
                        while (length--) {
                            result[fromRight ? length : ++index] = start;
                            start += step;
                        }
                        return result;
                    }
                    function baseRepeat(string, n) {
                        var result = "";
                        if (!string || n < 1 || n > MAX_SAFE_INTEGER) return result;
                        do {
                            if (n % 2) result += string;
                            n = nativeFloor(n / 2);
                            if (n) string += string;
                        } while (n);
                        return result;
                    }
                    function baseRest(func, start) {
                        return setToString(overRest(func, start, identity), func + "");
                    }
                    function baseSample(collection) {
                        return arraySample(values(collection));
                    }
                    function baseSampleSize(collection, n) {
                        var array = values(collection);
                        return shuffleSelf(array, baseClamp(n, 0, array.length));
                    }
                    function baseSet(object, path, value, customizer) {
                        if (!isObject(object)) return object;
                        path = castPath(path, object);
                        var index = -1, length = path.length, lastIndex = length - 1, nested = object;
                        while (null != nested && ++index < length) {
                            var key = toKey(path[index]), newValue = value;
                            if ("__proto__" === key || "constructor" === key || "prototype" === key) return object;
                            if (index != lastIndex) {
                                var objValue = nested[key];
                                newValue = customizer ? customizer(objValue, key, nested) : undefined;
                                if (newValue === undefined) newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
                            }
                            assignValue(nested, key, newValue);
                            nested = nested[key];
                        }
                        return object;
                    }
                    var baseSetData = !metaMap ? identity : function(func, data) {
                        metaMap.set(func, data);
                        return func;
                    };
                    var baseSetToString = !defineProperty ? identity : function(func, string) {
                        return defineProperty(func, "toString", {
                            configurable: true,
                            enumerable: false,
                            value: constant(string),
                            writable: true
                        });
                    };
                    function baseShuffle(collection) {
                        return shuffleSelf(values(collection));
                    }
                    function baseSlice(array, start, end) {
                        var index = -1, length = array.length;
                        if (start < 0) start = -start > length ? 0 : length + start;
                        end = end > length ? length : end;
                        if (end < 0) end += length;
                        length = start > end ? 0 : end - start >>> 0;
                        start >>>= 0;
                        var result = Array(length);
                        while (++index < length) result[index] = array[index + start];
                        return result;
                    }
                    function baseSome(collection, predicate) {
                        var result;
                        baseEach(collection, (function(value, index, collection) {
                            result = predicate(value, index, collection);
                            return !result;
                        }));
                        return !!result;
                    }
                    function baseSortedIndex(array, value, retHighest) {
                        var low = 0, high = null == array ? low : array.length;
                        if ("number" == typeof value && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
                            while (low < high) {
                                var mid = low + high >>> 1, computed = array[mid];
                                if (null !== computed && !isSymbol(computed) && (retHighest ? computed <= value : computed < value)) low = mid + 1; else high = mid;
                            }
                            return high;
                        }
                        return baseSortedIndexBy(array, value, identity, retHighest);
                    }
                    function baseSortedIndexBy(array, value, iteratee, retHighest) {
                        var low = 0, high = null == array ? 0 : array.length;
                        if (0 === high) return 0;
                        value = iteratee(value);
                        var valIsNaN = value !== value, valIsNull = null === value, valIsSymbol = isSymbol(value), valIsUndefined = value === undefined;
                        while (low < high) {
                            var mid = nativeFloor((low + high) / 2), computed = iteratee(array[mid]), othIsDefined = computed !== undefined, othIsNull = null === computed, othIsReflexive = computed === computed, othIsSymbol = isSymbol(computed);
                            if (valIsNaN) var setLow = retHighest || othIsReflexive; else if (valIsUndefined) setLow = othIsReflexive && (retHighest || othIsDefined); else if (valIsNull) setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull); else if (valIsSymbol) setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol); else if (othIsNull || othIsSymbol) setLow = false; else setLow = retHighest ? computed <= value : computed < value;
                            if (setLow) low = mid + 1; else high = mid;
                        }
                        return nativeMin(high, MAX_ARRAY_INDEX);
                    }
                    function baseSortedUniq(array, iteratee) {
                        var index = -1, length = array.length, resIndex = 0, result = [];
                        while (++index < length) {
                            var value = array[index], computed = iteratee ? iteratee(value) : value;
                            if (!index || !eq(computed, seen)) {
                                var seen = computed;
                                result[resIndex++] = 0 === value ? 0 : value;
                            }
                        }
                        return result;
                    }
                    function baseToNumber(value) {
                        if ("number" == typeof value) return value;
                        if (isSymbol(value)) return NAN;
                        return +value;
                    }
                    function baseToString(value) {
                        if ("string" == typeof value) return value;
                        if (isArray(value)) return arrayMap(value, baseToString) + "";
                        if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : "";
                        var result = value + "";
                        return "0" == result && 1 / value == -INFINITY ? "-0" : result;
                    }
                    function baseUniq(array, iteratee, comparator) {
                        var index = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
                        if (comparator) {
                            isCommon = false;
                            includes = arrayIncludesWith;
                        } else if (length >= LARGE_ARRAY_SIZE) {
                            var set = iteratee ? null : createSet(array);
                            if (set) return setToArray(set);
                            isCommon = false;
                            includes = cacheHas;
                            seen = new SetCache;
                        } else seen = iteratee ? [] : result;
                        outer: while (++index < length) {
                            var value = array[index], computed = iteratee ? iteratee(value) : value;
                            value = comparator || 0 !== value ? value : 0;
                            if (isCommon && computed === computed) {
                                var seenIndex = seen.length;
                                while (seenIndex--) if (seen[seenIndex] === computed) continue outer;
                                if (iteratee) seen.push(computed);
                                result.push(value);
                            } else if (!includes(seen, computed, comparator)) {
                                if (seen !== result) seen.push(computed);
                                result.push(value);
                            }
                        }
                        return result;
                    }
                    function baseUnset(object, path) {
                        path = castPath(path, object);
                        object = parent(object, path);
                        return null == object || delete object[toKey(last(path))];
                    }
                    function baseUpdate(object, path, updater, customizer) {
                        return baseSet(object, path, updater(baseGet(object, path)), customizer);
                    }
                    function baseWhile(array, predicate, isDrop, fromRight) {
                        var length = array.length, index = fromRight ? length : -1;
                        while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) ;
                        return isDrop ? baseSlice(array, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array, fromRight ? index + 1 : 0, fromRight ? length : index);
                    }
                    function baseWrapperValue(value, actions) {
                        var result = value;
                        if (result instanceof LazyWrapper) result = result.value();
                        return arrayReduce(actions, (function(result, action) {
                            return action.func.apply(action.thisArg, arrayPush([ result ], action.args));
                        }), result);
                    }
                    function baseXor(arrays, iteratee, comparator) {
                        var length = arrays.length;
                        if (length < 2) return length ? baseUniq(arrays[0]) : [];
                        var index = -1, result = Array(length);
                        while (++index < length) {
                            var array = arrays[index], othIndex = -1;
                            while (++othIndex < length) if (othIndex != index) result[index] = baseDifference(result[index] || array, arrays[othIndex], iteratee, comparator);
                        }
                        return baseUniq(baseFlatten(result, 1), iteratee, comparator);
                    }
                    function baseZipObject(props, values, assignFunc) {
                        var index = -1, length = props.length, valsLength = values.length, result = {};
                        while (++index < length) {
                            var value = index < valsLength ? values[index] : undefined;
                            assignFunc(result, props[index], value);
                        }
                        return result;
                    }
                    function castArrayLikeObject(value) {
                        return isArrayLikeObject(value) ? value : [];
                    }
                    function castFunction(value) {
                        return "function" == typeof value ? value : identity;
                    }
                    function castPath(value, object) {
                        if (isArray(value)) return value;
                        return isKey(value, object) ? [ value ] : stringToPath(toString(value));
                    }
                    var castRest = baseRest;
                    function castSlice(array, start, end) {
                        var length = array.length;
                        end = end === undefined ? length : end;
                        return !start && end >= length ? array : baseSlice(array, start, end);
                    }
                    var clearTimeout = ctxClearTimeout || function(id) {
                        return root.clearTimeout(id);
                    };
                    function cloneBuffer(buffer, isDeep) {
                        if (isDeep) return buffer.slice();
                        var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
                        buffer.copy(result);
                        return result;
                    }
                    function cloneArrayBuffer(arrayBuffer) {
                        var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
                        new Uint8Array(result).set(new Uint8Array(arrayBuffer));
                        return result;
                    }
                    function cloneDataView(dataView, isDeep) {
                        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
                        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
                    }
                    function cloneRegExp(regexp) {
                        var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
                        result.lastIndex = regexp.lastIndex;
                        return result;
                    }
                    function cloneSymbol(symbol) {
                        return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
                    }
                    function cloneTypedArray(typedArray, isDeep) {
                        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
                        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
                    }
                    function compareAscending(value, other) {
                        if (value !== other) {
                            var valIsDefined = value !== undefined, valIsNull = null === value, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
                            var othIsDefined = other !== undefined, othIsNull = null === other, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
                            if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) return 1;
                            if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) return -1;
                        }
                        return 0;
                    }
                    function compareMultiple(object, other, orders) {
                        var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
                        while (++index < length) {
                            var result = compareAscending(objCriteria[index], othCriteria[index]);
                            if (result) {
                                if (index >= ordersLength) return result;
                                var order = orders[index];
                                return result * ("desc" == order ? -1 : 1);
                            }
                        }
                        return object.index - other.index;
                    }
                    function composeArgs(args, partials, holders, isCurried) {
                        var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result = Array(leftLength + rangeLength), isUncurried = !isCurried;
                        while (++leftIndex < leftLength) result[leftIndex] = partials[leftIndex];
                        while (++argsIndex < holdersLength) if (isUncurried || argsIndex < argsLength) result[holders[argsIndex]] = args[argsIndex];
                        while (rangeLength--) result[leftIndex++] = args[argsIndex++];
                        return result;
                    }
                    function composeArgsRight(args, partials, holders, isCurried) {
                        var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result = Array(rangeLength + rightLength), isUncurried = !isCurried;
                        while (++argsIndex < rangeLength) result[argsIndex] = args[argsIndex];
                        var offset = argsIndex;
                        while (++rightIndex < rightLength) result[offset + rightIndex] = partials[rightIndex];
                        while (++holdersIndex < holdersLength) if (isUncurried || argsIndex < argsLength) result[offset + holders[holdersIndex]] = args[argsIndex++];
                        return result;
                    }
                    function copyArray(source, array) {
                        var index = -1, length = source.length;
                        array || (array = Array(length));
                        while (++index < length) array[index] = source[index];
                        return array;
                    }
                    function copyObject(source, props, object, customizer) {
                        var isNew = !object;
                        object || (object = {});
                        var index = -1, length = props.length;
                        while (++index < length) {
                            var key = props[index];
                            var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
                            if (newValue === undefined) newValue = source[key];
                            if (isNew) baseAssignValue(object, key, newValue); else assignValue(object, key, newValue);
                        }
                        return object;
                    }
                    function copySymbols(source, object) {
                        return copyObject(source, getSymbols(source), object);
                    }
                    function copySymbolsIn(source, object) {
                        return copyObject(source, getSymbolsIn(source), object);
                    }
                    function createAggregator(setter, initializer) {
                        return function(collection, iteratee) {
                            var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
                            return func(collection, setter, getIteratee(iteratee, 2), accumulator);
                        };
                    }
                    function createAssigner(assigner) {
                        return baseRest((function(object, sources) {
                            var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined, guard = length > 2 ? sources[2] : undefined;
                            customizer = assigner.length > 3 && "function" == typeof customizer ? (length--, 
                            customizer) : undefined;
                            if (guard && isIterateeCall(sources[0], sources[1], guard)) {
                                customizer = length < 3 ? undefined : customizer;
                                length = 1;
                            }
                            object = Object(object);
                            while (++index < length) {
                                var source = sources[index];
                                if (source) assigner(object, source, index, customizer);
                            }
                            return object;
                        }));
                    }
                    function createBaseEach(eachFunc, fromRight) {
                        return function(collection, iteratee) {
                            if (null == collection) return collection;
                            if (!isArrayLike(collection)) return eachFunc(collection, iteratee);
                            var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
                            while (fromRight ? index-- : ++index < length) if (false === iteratee(iterable[index], index, iterable)) break;
                            return collection;
                        };
                    }
                    function createBaseFor(fromRight) {
                        return function(object, iteratee, keysFunc) {
                            var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
                            while (length--) {
                                var key = props[fromRight ? length : ++index];
                                if (false === iteratee(iterable[key], key, iterable)) break;
                            }
                            return object;
                        };
                    }
                    function createBind(func, bitmask, thisArg) {
                        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
                        function wrapper() {
                            var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
                            return fn.apply(isBind ? thisArg : this, arguments);
                        }
                        return wrapper;
                    }
                    function createCaseFirst(methodName) {
                        return function(string) {
                            string = toString(string);
                            var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined;
                            var chr = strSymbols ? strSymbols[0] : string.charAt(0);
                            var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
                            return chr[methodName]() + trailing;
                        };
                    }
                    function createCompounder(callback) {
                        return function(string) {
                            return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
                        };
                    }
                    function createCtor(Ctor) {
                        return function() {
                            var args = arguments;
                            switch (args.length) {
                              case 0:
                                return new Ctor;

                              case 1:
                                return new Ctor(args[0]);

                              case 2:
                                return new Ctor(args[0], args[1]);

                              case 3:
                                return new Ctor(args[0], args[1], args[2]);

                              case 4:
                                return new Ctor(args[0], args[1], args[2], args[3]);

                              case 5:
                                return new Ctor(args[0], args[1], args[2], args[3], args[4]);

                              case 6:
                                return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);

                              case 7:
                                return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
                            }
                            var thisBinding = baseCreate(Ctor.prototype), result = Ctor.apply(thisBinding, args);
                            return isObject(result) ? result : thisBinding;
                        };
                    }
                    function createCurry(func, bitmask, arity) {
                        var Ctor = createCtor(func);
                        function wrapper() {
                            var length = arguments.length, args = Array(length), index = length, placeholder = getHolder(wrapper);
                            while (index--) args[index] = arguments[index];
                            var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
                            length -= holders.length;
                            if (length < arity) return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, undefined, args, holders, undefined, undefined, arity - length);
                            var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
                            return apply(fn, this, args);
                        }
                        return wrapper;
                    }
                    function createFind(findIndexFunc) {
                        return function(collection, predicate, fromIndex) {
                            var iterable = Object(collection);
                            if (!isArrayLike(collection)) {
                                var iteratee = getIteratee(predicate, 3);
                                collection = keys(collection);
                                predicate = function(key) {
                                    return iteratee(iterable[key], key, iterable);
                                };
                            }
                            var index = findIndexFunc(collection, predicate, fromIndex);
                            return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
                        };
                    }
                    function createFlow(fromRight) {
                        return flatRest((function(funcs) {
                            var length = funcs.length, index = length, prereq = LodashWrapper.prototype.thru;
                            if (fromRight) funcs.reverse();
                            while (index--) {
                                var func = funcs[index];
                                if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                                if (prereq && !wrapper && "wrapper" == getFuncName(func)) var wrapper = new LodashWrapper([], true);
                            }
                            index = wrapper ? index : length;
                            while (++index < length) {
                                func = funcs[index];
                                var funcName = getFuncName(func), data = "wrapper" == funcName ? getData(func) : undefined;
                                if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && 1 == data[9]) wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]); else wrapper = 1 == func.length && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
                            }
                            return function() {
                                var args = arguments, value = args[0];
                                if (wrapper && 1 == args.length && isArray(value)) return wrapper.plant(value).value();
                                var index = 0, result = length ? funcs[index].apply(this, args) : value;
                                while (++index < length) result = funcs[index].call(this, result);
                                return result;
                            };
                        }));
                    }
                    function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
                        var isAry = bitmask & WRAP_ARY_FLAG, isBind = bitmask & WRAP_BIND_FLAG, isBindKey = bitmask & WRAP_BIND_KEY_FLAG, isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG), isFlip = bitmask & WRAP_FLIP_FLAG, Ctor = isBindKey ? undefined : createCtor(func);
                        function wrapper() {
                            var length = arguments.length, args = Array(length), index = length;
                            while (index--) args[index] = arguments[index];
                            if (isCurried) var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
                            if (partials) args = composeArgs(args, partials, holders, isCurried);
                            if (partialsRight) args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
                            length -= holdersCount;
                            if (isCurried && length < arity) {
                                var newHolders = replaceHolders(args, placeholder);
                                return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, thisArg, args, newHolders, argPos, ary, arity - length);
                            }
                            var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
                            length = args.length;
                            if (argPos) args = reorder(args, argPos); else if (isFlip && length > 1) args.reverse();
                            if (isAry && ary < length) args.length = ary;
                            if (this && this !== root && this instanceof wrapper) fn = Ctor || createCtor(fn);
                            return fn.apply(thisBinding, args);
                        }
                        return wrapper;
                    }
                    function createInverter(setter, toIteratee) {
                        return function(object, iteratee) {
                            return baseInverter(object, setter, toIteratee(iteratee), {});
                        };
                    }
                    function createMathOperation(operator, defaultValue) {
                        return function(value, other) {
                            var result;
                            if (value === undefined && other === undefined) return defaultValue;
                            if (value !== undefined) result = value;
                            if (other !== undefined) {
                                if (result === undefined) return other;
                                if ("string" == typeof value || "string" == typeof other) {
                                    value = baseToString(value);
                                    other = baseToString(other);
                                } else {
                                    value = baseToNumber(value);
                                    other = baseToNumber(other);
                                }
                                result = operator(value, other);
                            }
                            return result;
                        };
                    }
                    function createOver(arrayFunc) {
                        return flatRest((function(iteratees) {
                            iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
                            return baseRest((function(args) {
                                var thisArg = this;
                                return arrayFunc(iteratees, (function(iteratee) {
                                    return apply(iteratee, thisArg, args);
                                }));
                            }));
                        }));
                    }
                    function createPadding(length, chars) {
                        chars = chars === undefined ? " " : baseToString(chars);
                        var charsLength = chars.length;
                        if (charsLength < 2) return charsLength ? baseRepeat(chars, length) : chars;
                        var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
                        return hasUnicode(chars) ? castSlice(stringToArray(result), 0, length).join("") : result.slice(0, length);
                    }
                    function createPartial(func, bitmask, thisArg, partials) {
                        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
                        function wrapper() {
                            var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func;
                            while (++leftIndex < leftLength) args[leftIndex] = partials[leftIndex];
                            while (argsLength--) args[leftIndex++] = arguments[++argsIndex];
                            return apply(fn, isBind ? thisArg : this, args);
                        }
                        return wrapper;
                    }
                    function createRange(fromRight) {
                        return function(start, end, step) {
                            if (step && "number" != typeof step && isIterateeCall(start, end, step)) end = step = undefined;
                            start = toFinite(start);
                            if (end === undefined) {
                                end = start;
                                start = 0;
                            } else end = toFinite(end);
                            step = step === undefined ? start < end ? 1 : -1 : toFinite(step);
                            return baseRange(start, end, step, fromRight);
                        };
                    }
                    function createRelationalOperation(operator) {
                        return function(value, other) {
                            if (!("string" == typeof value && "string" == typeof other)) {
                                value = toNumber(value);
                                other = toNumber(other);
                            }
                            return operator(value, other);
                        };
                    }
                    function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
                        var isCurry = bitmask & WRAP_CURRY_FLAG, newHolders = isCurry ? holders : undefined, newHoldersRight = isCurry ? undefined : holders, newPartials = isCurry ? partials : undefined, newPartialsRight = isCurry ? undefined : partials;
                        bitmask |= isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG;
                        bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
                        if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
                        var newData = [ func, bitmask, thisArg, newPartials, newHolders, newPartialsRight, newHoldersRight, argPos, ary, arity ];
                        var result = wrapFunc.apply(undefined, newData);
                        if (isLaziable(func)) setData(result, newData);
                        result.placeholder = placeholder;
                        return setWrapToString(result, func, bitmask);
                    }
                    function createRound(methodName) {
                        var func = Math[methodName];
                        return function(number, precision) {
                            number = toNumber(number);
                            precision = null == precision ? 0 : nativeMin(toInteger(precision), 292);
                            if (precision && nativeIsFinite(number)) {
                                var pair = (toString(number) + "e").split("e"), value = func(pair[0] + "e" + (+pair[1] + precision));
                                pair = (toString(value) + "e").split("e");
                                return +(pair[0] + "e" + (+pair[1] - precision));
                            }
                            return func(number);
                        };
                    }
                    var createSet = !(Set && 1 / setToArray(new Set([ , -0 ]))[1] == INFINITY) ? noop : function(values) {
                        return new Set(values);
                    };
                    function createToPairs(keysFunc) {
                        return function(object) {
                            var tag = getTag(object);
                            if (tag == mapTag) return mapToArray(object);
                            if (tag == setTag) return setToPairs(object);
                            return baseToPairs(object, keysFunc(object));
                        };
                    }
                    function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
                        var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
                        if (!isBindKey && "function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                        var length = partials ? partials.length : 0;
                        if (!length) {
                            bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
                            partials = holders = undefined;
                        }
                        ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
                        arity = arity === undefined ? arity : toInteger(arity);
                        length -= holders ? holders.length : 0;
                        if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
                            var partialsRight = partials, holdersRight = holders;
                            partials = holders = undefined;
                        }
                        var data = isBindKey ? undefined : getData(func);
                        var newData = [ func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity ];
                        if (data) mergeData(newData, data);
                        func = newData[0];
                        bitmask = newData[1];
                        thisArg = newData[2];
                        partials = newData[3];
                        holders = newData[4];
                        arity = newData[9] = newData[9] === undefined ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);
                        if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
                        if (!bitmask || bitmask == WRAP_BIND_FLAG) var result = createBind(func, bitmask, thisArg); else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) result = createCurry(func, bitmask, arity); else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) result = createPartial(func, bitmask, thisArg, partials); else result = createHybrid.apply(undefined, newData);
                        var setter = data ? baseSetData : setData;
                        return setWrapToString(setter(result, newData), func, bitmask);
                    }
                    function customDefaultsAssignIn(objValue, srcValue, key, object) {
                        if (objValue === undefined || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) return srcValue;
                        return objValue;
                    }
                    function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
                        if (isObject(objValue) && isObject(srcValue)) {
                            stack.set(srcValue, objValue);
                            baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
                            stack["delete"](srcValue);
                        }
                        return objValue;
                    }
                    function customOmitClone(value) {
                        return isPlainObject(value) ? undefined : value;
                    }
                    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
                        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
                        if (arrLength != othLength && !(isPartial && othLength > arrLength)) return false;
                        var arrStacked = stack.get(array);
                        var othStacked = stack.get(other);
                        if (arrStacked && othStacked) return arrStacked == other && othStacked == array;
                        var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache : undefined;
                        stack.set(array, other);
                        stack.set(other, array);
                        while (++index < arrLength) {
                            var arrValue = array[index], othValue = other[index];
                            if (customizer) var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
                            if (compared !== undefined) {
                                if (compared) continue;
                                result = false;
                                break;
                            }
                            if (seen) {
                                if (!arraySome(other, (function(othValue, othIndex) {
                                    if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) return seen.push(othIndex);
                                }))) {
                                    result = false;
                                    break;
                                }
                            } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                                result = false;
                                break;
                            }
                        }
                        stack["delete"](array);
                        stack["delete"](other);
                        return result;
                    }
                    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
                        switch (tag) {
                          case dataViewTag:
                            if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) return false;
                            object = object.buffer;
                            other = other.buffer;

                          case arrayBufferTag:
                            if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) return false;
                            return true;

                          case boolTag:
                          case dateTag:
                          case numberTag:
                            return eq(+object, +other);

                          case errorTag:
                            return object.name == other.name && object.message == other.message;

                          case regexpTag:
                          case stringTag:
                            return object == other + "";

                          case mapTag:
                            var convert = mapToArray;

                          case setTag:
                            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
                            convert || (convert = setToArray);
                            if (object.size != other.size && !isPartial) return false;
                            var stacked = stack.get(object);
                            if (stacked) return stacked == other;
                            bitmask |= COMPARE_UNORDERED_FLAG;
                            stack.set(object, other);
                            var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
                            stack["delete"](object);
                            return result;

                          case symbolTag:
                            if (symbolValueOf) return symbolValueOf.call(object) == symbolValueOf.call(other);
                        }
                        return false;
                    }
                    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
                        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
                        if (objLength != othLength && !isPartial) return false;
                        var index = objLength;
                        while (index--) {
                            var key = objProps[index];
                            if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) return false;
                        }
                        var objStacked = stack.get(object);
                        var othStacked = stack.get(other);
                        if (objStacked && othStacked) return objStacked == other && othStacked == object;
                        var result = true;
                        stack.set(object, other);
                        stack.set(other, object);
                        var skipCtor = isPartial;
                        while (++index < objLength) {
                            key = objProps[index];
                            var objValue = object[key], othValue = other[key];
                            if (customizer) var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
                            if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
                                result = false;
                                break;
                            }
                            skipCtor || (skipCtor = "constructor" == key);
                        }
                        if (result && !skipCtor) {
                            var objCtor = object.constructor, othCtor = other.constructor;
                            if (objCtor != othCtor && "constructor" in object && "constructor" in other && !("function" == typeof objCtor && objCtor instanceof objCtor && "function" == typeof othCtor && othCtor instanceof othCtor)) result = false;
                        }
                        stack["delete"](object);
                        stack["delete"](other);
                        return result;
                    }
                    function flatRest(func) {
                        return setToString(overRest(func, undefined, flatten), func + "");
                    }
                    function getAllKeys(object) {
                        return baseGetAllKeys(object, keys, getSymbols);
                    }
                    function getAllKeysIn(object) {
                        return baseGetAllKeys(object, keysIn, getSymbolsIn);
                    }
                    var getData = !metaMap ? noop : function(func) {
                        return metaMap.get(func);
                    };
                    function getFuncName(func) {
                        var result = func.name + "", array = realNames[result], length = hasOwnProperty.call(realNames, result) ? array.length : 0;
                        while (length--) {
                            var data = array[length], otherFunc = data.func;
                            if (null == otherFunc || otherFunc == func) return data.name;
                        }
                        return result;
                    }
                    function getHolder(func) {
                        var object = hasOwnProperty.call(lodash, "placeholder") ? lodash : func;
                        return object.placeholder;
                    }
                    function getIteratee() {
                        var result = lodash.iteratee || iteratee;
                        result = result === iteratee ? baseIteratee : result;
                        return arguments.length ? result(arguments[0], arguments[1]) : result;
                    }
                    function getMapData(map, key) {
                        var data = map.__data__;
                        return isKeyable(key) ? data["string" == typeof key ? "string" : "hash"] : data.map;
                    }
                    function getMatchData(object) {
                        var result = keys(object), length = result.length;
                        while (length--) {
                            var key = result[length], value = object[key];
                            result[length] = [ key, value, isStrictComparable(value) ];
                        }
                        return result;
                    }
                    function getNative(object, key) {
                        var value = getValue(object, key);
                        return baseIsNative(value) ? value : undefined;
                    }
                    function getRawTag(value) {
                        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
                        try {
                            value[symToStringTag] = undefined;
                            var unmasked = true;
                        } catch (e) {}
                        var result = nativeObjectToString.call(value);
                        if (unmasked) if (isOwn) value[symToStringTag] = tag; else delete value[symToStringTag];
                        return result;
                    }
                    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
                        if (null == object) return [];
                        object = Object(object);
                        return arrayFilter(nativeGetSymbols(object), (function(symbol) {
                            return propertyIsEnumerable.call(object, symbol);
                        }));
                    };
                    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
                        var result = [];
                        while (object) {
                            arrayPush(result, getSymbols(object));
                            object = getPrototype(object);
                        }
                        return result;
                    };
                    var getTag = baseGetTag;
                    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set) != setTag || WeakMap && getTag(new WeakMap) != weakMapTag) getTag = function(value) {
                        var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : undefined, ctorString = Ctor ? toSource(Ctor) : "";
                        if (ctorString) switch (ctorString) {
                          case dataViewCtorString:
                            return dataViewTag;

                          case mapCtorString:
                            return mapTag;

                          case promiseCtorString:
                            return promiseTag;

                          case setCtorString:
                            return setTag;

                          case weakMapCtorString:
                            return weakMapTag;
                        }
                        return result;
                    };
                    function getView(start, end, transforms) {
                        var index = -1, length = transforms.length;
                        while (++index < length) {
                            var data = transforms[index], size = data.size;
                            switch (data.type) {
                              case "drop":
                                start += size;
                                break;

                              case "dropRight":
                                end -= size;
                                break;

                              case "take":
                                end = nativeMin(end, start + size);
                                break;

                              case "takeRight":
                                start = nativeMax(start, end - size);
                                break;
                            }
                        }
                        return {
                            start,
                            end
                        };
                    }
                    function getWrapDetails(source) {
                        var match = source.match(reWrapDetails);
                        return match ? match[1].split(reSplitDetails) : [];
                    }
                    function hasPath(object, path, hasFunc) {
                        path = castPath(path, object);
                        var index = -1, length = path.length, result = false;
                        while (++index < length) {
                            var key = toKey(path[index]);
                            if (!(result = null != object && hasFunc(object, key))) break;
                            object = object[key];
                        }
                        if (result || ++index != length) return result;
                        length = null == object ? 0 : object.length;
                        return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
                    }
                    function initCloneArray(array) {
                        var length = array.length, result = new array.constructor(length);
                        if (length && "string" == typeof array[0] && hasOwnProperty.call(array, "index")) {
                            result.index = array.index;
                            result.input = array.input;
                        }
                        return result;
                    }
                    function initCloneObject(object) {
                        return "function" == typeof object.constructor && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
                    }
                    function initCloneByTag(object, tag, isDeep) {
                        var Ctor = object.constructor;
                        switch (tag) {
                          case arrayBufferTag:
                            return cloneArrayBuffer(object);

                          case boolTag:
                          case dateTag:
                            return new Ctor(+object);

                          case dataViewTag:
                            return cloneDataView(object, isDeep);

                          case float32Tag:
                          case float64Tag:
                          case int8Tag:
                          case int16Tag:
                          case int32Tag:
                          case uint8Tag:
                          case uint8ClampedTag:
                          case uint16Tag:
                          case uint32Tag:
                            return cloneTypedArray(object, isDeep);

                          case mapTag:
                            return new Ctor;

                          case numberTag:
                          case stringTag:
                            return new Ctor(object);

                          case regexpTag:
                            return cloneRegExp(object);

                          case setTag:
                            return new Ctor;

                          case symbolTag:
                            return cloneSymbol(object);
                        }
                    }
                    function insertWrapDetails(source, details) {
                        var length = details.length;
                        if (!length) return source;
                        var lastIndex = length - 1;
                        details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
                        details = details.join(length > 2 ? ", " : " ");
                        return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
                    }
                    function isFlattenable(value) {
                        return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
                    }
                    function isIndex(value, length) {
                        var type = typeof value;
                        length = null == length ? MAX_SAFE_INTEGER : length;
                        return !!length && ("number" == type || "symbol" != type && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
                    }
                    function isIterateeCall(value, index, object) {
                        if (!isObject(object)) return false;
                        var type = typeof index;
                        if ("number" == type ? isArrayLike(object) && isIndex(index, object.length) : "string" == type && index in object) return eq(object[index], value);
                        return false;
                    }
                    function isKey(value, object) {
                        if (isArray(value)) return false;
                        var type = typeof value;
                        if ("number" == type || "symbol" == type || "boolean" == type || null == value || isSymbol(value)) return true;
                        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || null != object && value in Object(object);
                    }
                    function isKeyable(value) {
                        var type = typeof value;
                        return "string" == type || "number" == type || "symbol" == type || "boolean" == type ? "__proto__" !== value : null === value;
                    }
                    function isLaziable(func) {
                        var funcName = getFuncName(func), other = lodash[funcName];
                        if ("function" != typeof other || !(funcName in LazyWrapper.prototype)) return false;
                        if (func === other) return true;
                        var data = getData(other);
                        return !!data && func === data[0];
                    }
                    function isMasked(func) {
                        return !!maskSrcKey && maskSrcKey in func;
                    }
                    var isMaskable = coreJsData ? isFunction : stubFalse;
                    function isPrototype(value) {
                        var Ctor = value && value.constructor, proto = "function" == typeof Ctor && Ctor.prototype || objectProto;
                        return value === proto;
                    }
                    function isStrictComparable(value) {
                        return value === value && !isObject(value);
                    }
                    function matchesStrictComparable(key, srcValue) {
                        return function(object) {
                            if (null == object) return false;
                            return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
                        };
                    }
                    function memoizeCapped(func) {
                        var result = memoize(func, (function(key) {
                            if (cache.size === MAX_MEMOIZE_SIZE) cache.clear();
                            return key;
                        }));
                        var cache = result.cache;
                        return result;
                    }
                    function mergeData(data, source) {
                        var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
                        var isCombo = srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_CURRY_FLAG || srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_REARG_FLAG && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG;
                        if (!(isCommon || isCombo)) return data;
                        if (srcBitmask & WRAP_BIND_FLAG) {
                            data[2] = source[2];
                            newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
                        }
                        var value = source[3];
                        if (value) {
                            var partials = data[3];
                            data[3] = partials ? composeArgs(partials, value, source[4]) : value;
                            data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
                        }
                        value = source[5];
                        if (value) {
                            partials = data[5];
                            data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
                            data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
                        }
                        value = source[7];
                        if (value) data[7] = value;
                        if (srcBitmask & WRAP_ARY_FLAG) data[8] = null == data[8] ? source[8] : nativeMin(data[8], source[8]);
                        if (null == data[9]) data[9] = source[9];
                        data[0] = source[0];
                        data[1] = newBitmask;
                        return data;
                    }
                    function nativeKeysIn(object) {
                        var result = [];
                        if (null != object) for (var key in Object(object)) result.push(key);
                        return result;
                    }
                    function objectToString(value) {
                        return nativeObjectToString.call(value);
                    }
                    function overRest(func, start, transform) {
                        start = nativeMax(start === undefined ? func.length - 1 : start, 0);
                        return function() {
                            var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
                            while (++index < length) array[index] = args[start + index];
                            index = -1;
                            var otherArgs = Array(start + 1);
                            while (++index < start) otherArgs[index] = args[index];
                            otherArgs[start] = transform(array);
                            return apply(func, this, otherArgs);
                        };
                    }
                    function parent(object, path) {
                        return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
                    }
                    function reorder(array, indexes) {
                        var arrLength = array.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array);
                        while (length--) {
                            var index = indexes[length];
                            array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
                        }
                        return array;
                    }
                    function safeGet(object, key) {
                        if ("constructor" === key && "function" === typeof object[key]) return;
                        if ("__proto__" == key) return;
                        return object[key];
                    }
                    var setData = shortOut(baseSetData);
                    var setTimeout = ctxSetTimeout || function(func, wait) {
                        return root.setTimeout(func, wait);
                    };
                    var setToString = shortOut(baseSetToString);
                    function setWrapToString(wrapper, reference, bitmask) {
                        var source = reference + "";
                        return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
                    }
                    function shortOut(func) {
                        var count = 0, lastCalled = 0;
                        return function() {
                            var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
                            lastCalled = stamp;
                            if (remaining > 0) {
                                if (++count >= HOT_COUNT) return arguments[0];
                            } else count = 0;
                            return func.apply(undefined, arguments);
                        };
                    }
                    function shuffleSelf(array, size) {
                        var index = -1, length = array.length, lastIndex = length - 1;
                        size = size === undefined ? length : size;
                        while (++index < size) {
                            var rand = baseRandom(index, lastIndex), value = array[rand];
                            array[rand] = array[index];
                            array[index] = value;
                        }
                        array.length = size;
                        return array;
                    }
                    var stringToPath = memoizeCapped((function(string) {
                        var result = [];
                        if (46 === string.charCodeAt(0)) result.push("");
                        string.replace(rePropName, (function(match, number, quote, subString) {
                            result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
                        }));
                        return result;
                    }));
                    function toKey(value) {
                        if ("string" == typeof value || isSymbol(value)) return value;
                        var result = value + "";
                        return "0" == result && 1 / value == -INFINITY ? "-0" : result;
                    }
                    function toSource(func) {
                        if (null != func) {
                            try {
                                return funcToString.call(func);
                            } catch (e) {}
                            try {
                                return func + "";
                            } catch (e) {}
                        }
                        return "";
                    }
                    function updateWrapDetails(details, bitmask) {
                        arrayEach(wrapFlags, (function(pair) {
                            var value = "_." + pair[0];
                            if (bitmask & pair[1] && !arrayIncludes(details, value)) details.push(value);
                        }));
                        return details.sort();
                    }
                    function wrapperClone(wrapper) {
                        if (wrapper instanceof LazyWrapper) return wrapper.clone();
                        var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
                        result.__actions__ = copyArray(wrapper.__actions__);
                        result.__index__ = wrapper.__index__;
                        result.__values__ = wrapper.__values__;
                        return result;
                    }
                    function chunk(array, size, guard) {
                        if (guard ? isIterateeCall(array, size, guard) : size === undefined) size = 1; else size = nativeMax(toInteger(size), 0);
                        var length = null == array ? 0 : array.length;
                        if (!length || size < 1) return [];
                        var index = 0, resIndex = 0, result = Array(nativeCeil(length / size));
                        while (index < length) result[resIndex++] = baseSlice(array, index, index += size);
                        return result;
                    }
                    function compact(array) {
                        var index = -1, length = null == array ? 0 : array.length, resIndex = 0, result = [];
                        while (++index < length) {
                            var value = array[index];
                            if (value) result[resIndex++] = value;
                        }
                        return result;
                    }
                    function concat() {
                        var length = arguments.length;
                        if (!length) return [];
                        var args = Array(length - 1), array = arguments[0], index = length;
                        while (index--) args[index - 1] = arguments[index];
                        return arrayPush(isArray(array) ? copyArray(array) : [ array ], baseFlatten(args, 1));
                    }
                    var difference = baseRest((function(array, values) {
                        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true)) : [];
                    }));
                    var differenceBy = baseRest((function(array, values) {
                        var iteratee = last(values);
                        if (isArrayLikeObject(iteratee)) iteratee = undefined;
                        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2)) : [];
                    }));
                    var differenceWith = baseRest((function(array, values) {
                        var comparator = last(values);
                        if (isArrayLikeObject(comparator)) comparator = undefined;
                        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator) : [];
                    }));
                    function drop(array, n, guard) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return [];
                        n = guard || n === undefined ? 1 : toInteger(n);
                        return baseSlice(array, n < 0 ? 0 : n, length);
                    }
                    function dropRight(array, n, guard) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return [];
                        n = guard || n === undefined ? 1 : toInteger(n);
                        n = length - n;
                        return baseSlice(array, 0, n < 0 ? 0 : n);
                    }
                    function dropRightWhile(array, predicate) {
                        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true, true) : [];
                    }
                    function dropWhile(array, predicate) {
                        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true) : [];
                    }
                    function fill(array, value, start, end) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return [];
                        if (start && "number" != typeof start && isIterateeCall(array, value, start)) {
                            start = 0;
                            end = length;
                        }
                        return baseFill(array, value, start, end);
                    }
                    function findIndex(array, predicate, fromIndex) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return -1;
                        var index = null == fromIndex ? 0 : toInteger(fromIndex);
                        if (index < 0) index = nativeMax(length + index, 0);
                        return baseFindIndex(array, getIteratee(predicate, 3), index);
                    }
                    function findLastIndex(array, predicate, fromIndex) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return -1;
                        var index = length - 1;
                        if (fromIndex !== undefined) {
                            index = toInteger(fromIndex);
                            index = fromIndex < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
                        }
                        return baseFindIndex(array, getIteratee(predicate, 3), index, true);
                    }
                    function flatten(array) {
                        var length = null == array ? 0 : array.length;
                        return length ? baseFlatten(array, 1) : [];
                    }
                    function flattenDeep(array) {
                        var length = null == array ? 0 : array.length;
                        return length ? baseFlatten(array, INFINITY) : [];
                    }
                    function flattenDepth(array, depth) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return [];
                        depth = depth === undefined ? 1 : toInteger(depth);
                        return baseFlatten(array, depth);
                    }
                    function fromPairs(pairs) {
                        var index = -1, length = null == pairs ? 0 : pairs.length, result = {};
                        while (++index < length) {
                            var pair = pairs[index];
                            result[pair[0]] = pair[1];
                        }
                        return result;
                    }
                    function head(array) {
                        return array && array.length ? array[0] : undefined;
                    }
                    function indexOf(array, value, fromIndex) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return -1;
                        var index = null == fromIndex ? 0 : toInteger(fromIndex);
                        if (index < 0) index = nativeMax(length + index, 0);
                        return baseIndexOf(array, value, index);
                    }
                    function initial(array) {
                        var length = null == array ? 0 : array.length;
                        return length ? baseSlice(array, 0, -1) : [];
                    }
                    var intersection = baseRest((function(arrays) {
                        var mapped = arrayMap(arrays, castArrayLikeObject);
                        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
                    }));
                    var intersectionBy = baseRest((function(arrays) {
                        var iteratee = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
                        if (iteratee === last(mapped)) iteratee = undefined; else mapped.pop();
                        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee, 2)) : [];
                    }));
                    var intersectionWith = baseRest((function(arrays) {
                        var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
                        comparator = "function" == typeof comparator ? comparator : undefined;
                        if (comparator) mapped.pop();
                        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined, comparator) : [];
                    }));
                    function join(array, separator) {
                        return null == array ? "" : nativeJoin.call(array, separator);
                    }
                    function last(array) {
                        var length = null == array ? 0 : array.length;
                        return length ? array[length - 1] : undefined;
                    }
                    function lastIndexOf(array, value, fromIndex) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return -1;
                        var index = length;
                        if (fromIndex !== undefined) {
                            index = toInteger(fromIndex);
                            index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
                        }
                        return value === value ? strictLastIndexOf(array, value, index) : baseFindIndex(array, baseIsNaN, index, true);
                    }
                    function nth(array, n) {
                        return array && array.length ? baseNth(array, toInteger(n)) : undefined;
                    }
                    var pull = baseRest(pullAll);
                    function pullAll(array, values) {
                        return array && array.length && values && values.length ? basePullAll(array, values) : array;
                    }
                    function pullAllBy(array, values, iteratee) {
                        return array && array.length && values && values.length ? basePullAll(array, values, getIteratee(iteratee, 2)) : array;
                    }
                    function pullAllWith(array, values, comparator) {
                        return array && array.length && values && values.length ? basePullAll(array, values, undefined, comparator) : array;
                    }
                    var pullAt = flatRest((function(array, indexes) {
                        var length = null == array ? 0 : array.length, result = baseAt(array, indexes);
                        basePullAt(array, arrayMap(indexes, (function(index) {
                            return isIndex(index, length) ? +index : index;
                        })).sort(compareAscending));
                        return result;
                    }));
                    function remove(array, predicate) {
                        var result = [];
                        if (!(array && array.length)) return result;
                        var index = -1, indexes = [], length = array.length;
                        predicate = getIteratee(predicate, 3);
                        while (++index < length) {
                            var value = array[index];
                            if (predicate(value, index, array)) {
                                result.push(value);
                                indexes.push(index);
                            }
                        }
                        basePullAt(array, indexes);
                        return result;
                    }
                    function reverse(array) {
                        return null == array ? array : nativeReverse.call(array);
                    }
                    function slice(array, start, end) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return [];
                        if (end && "number" != typeof end && isIterateeCall(array, start, end)) {
                            start = 0;
                            end = length;
                        } else {
                            start = null == start ? 0 : toInteger(start);
                            end = end === undefined ? length : toInteger(end);
                        }
                        return baseSlice(array, start, end);
                    }
                    function sortedIndex(array, value) {
                        return baseSortedIndex(array, value);
                    }
                    function sortedIndexBy(array, value, iteratee) {
                        return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
                    }
                    function sortedIndexOf(array, value) {
                        var length = null == array ? 0 : array.length;
                        if (length) {
                            var index = baseSortedIndex(array, value);
                            if (index < length && eq(array[index], value)) return index;
                        }
                        return -1;
                    }
                    function sortedLastIndex(array, value) {
                        return baseSortedIndex(array, value, true);
                    }
                    function sortedLastIndexBy(array, value, iteratee) {
                        return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
                    }
                    function sortedLastIndexOf(array, value) {
                        var length = null == array ? 0 : array.length;
                        if (length) {
                            var index = baseSortedIndex(array, value, true) - 1;
                            if (eq(array[index], value)) return index;
                        }
                        return -1;
                    }
                    function sortedUniq(array) {
                        return array && array.length ? baseSortedUniq(array) : [];
                    }
                    function sortedUniqBy(array, iteratee) {
                        return array && array.length ? baseSortedUniq(array, getIteratee(iteratee, 2)) : [];
                    }
                    function tail(array) {
                        var length = null == array ? 0 : array.length;
                        return length ? baseSlice(array, 1, length) : [];
                    }
                    function take(array, n, guard) {
                        if (!(array && array.length)) return [];
                        n = guard || n === undefined ? 1 : toInteger(n);
                        return baseSlice(array, 0, n < 0 ? 0 : n);
                    }
                    function takeRight(array, n, guard) {
                        var length = null == array ? 0 : array.length;
                        if (!length) return [];
                        n = guard || n === undefined ? 1 : toInteger(n);
                        n = length - n;
                        return baseSlice(array, n < 0 ? 0 : n, length);
                    }
                    function takeRightWhile(array, predicate) {
                        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), false, true) : [];
                    }
                    function takeWhile(array, predicate) {
                        return array && array.length ? baseWhile(array, getIteratee(predicate, 3)) : [];
                    }
                    var union = baseRest((function(arrays) {
                        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
                    }));
                    var unionBy = baseRest((function(arrays) {
                        var iteratee = last(arrays);
                        if (isArrayLikeObject(iteratee)) iteratee = undefined;
                        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
                    }));
                    var unionWith = baseRest((function(arrays) {
                        var comparator = last(arrays);
                        comparator = "function" == typeof comparator ? comparator : undefined;
                        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator);
                    }));
                    function uniq(array) {
                        return array && array.length ? baseUniq(array) : [];
                    }
                    function uniqBy(array, iteratee) {
                        return array && array.length ? baseUniq(array, getIteratee(iteratee, 2)) : [];
                    }
                    function uniqWith(array, comparator) {
                        comparator = "function" == typeof comparator ? comparator : undefined;
                        return array && array.length ? baseUniq(array, undefined, comparator) : [];
                    }
                    function unzip(array) {
                        if (!(array && array.length)) return [];
                        var length = 0;
                        array = arrayFilter(array, (function(group) {
                            if (isArrayLikeObject(group)) {
                                length = nativeMax(group.length, length);
                                return true;
                            }
                        }));
                        return baseTimes(length, (function(index) {
                            return arrayMap(array, baseProperty(index));
                        }));
                    }
                    function unzipWith(array, iteratee) {
                        if (!(array && array.length)) return [];
                        var result = unzip(array);
                        if (null == iteratee) return result;
                        return arrayMap(result, (function(group) {
                            return apply(iteratee, undefined, group);
                        }));
                    }
                    var without = baseRest((function(array, values) {
                        return isArrayLikeObject(array) ? baseDifference(array, values) : [];
                    }));
                    var xor = baseRest((function(arrays) {
                        return baseXor(arrayFilter(arrays, isArrayLikeObject));
                    }));
                    var xorBy = baseRest((function(arrays) {
                        var iteratee = last(arrays);
                        if (isArrayLikeObject(iteratee)) iteratee = undefined;
                        return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
                    }));
                    var xorWith = baseRest((function(arrays) {
                        var comparator = last(arrays);
                        comparator = "function" == typeof comparator ? comparator : undefined;
                        return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
                    }));
                    var zip = baseRest(unzip);
                    function zipObject(props, values) {
                        return baseZipObject(props || [], values || [], assignValue);
                    }
                    function zipObjectDeep(props, values) {
                        return baseZipObject(props || [], values || [], baseSet);
                    }
                    var zipWith = baseRest((function(arrays) {
                        var length = arrays.length, iteratee = length > 1 ? arrays[length - 1] : undefined;
                        iteratee = "function" == typeof iteratee ? (arrays.pop(), iteratee) : undefined;
                        return unzipWith(arrays, iteratee);
                    }));
                    function chain(value) {
                        var result = lodash(value);
                        result.__chain__ = true;
                        return result;
                    }
                    function tap(value, interceptor) {
                        interceptor(value);
                        return value;
                    }
                    function thru(value, interceptor) {
                        return interceptor(value);
                    }
                    var wrapperAt = flatRest((function(paths) {
                        var length = paths.length, start = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object) {
                            return baseAt(object, paths);
                        };
                        if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) return this.thru(interceptor);
                        value = value.slice(start, +start + (length ? 1 : 0));
                        value.__actions__.push({
                            func: thru,
                            args: [ interceptor ],
                            thisArg: undefined
                        });
                        return new LodashWrapper(value, this.__chain__).thru((function(array) {
                            if (length && !array.length) array.push(undefined);
                            return array;
                        }));
                    }));
                    function wrapperChain() {
                        return chain(this);
                    }
                    function wrapperCommit() {
                        return new LodashWrapper(this.value(), this.__chain__);
                    }
                    function wrapperNext() {
                        if (this.__values__ === undefined) this.__values__ = toArray(this.value());
                        var done = this.__index__ >= this.__values__.length, value = done ? undefined : this.__values__[this.__index__++];
                        return {
                            done,
                            value
                        };
                    }
                    function wrapperToIterator() {
                        return this;
                    }
                    function wrapperPlant(value) {
                        var result, parent = this;
                        while (parent instanceof baseLodash) {
                            var clone = wrapperClone(parent);
                            clone.__index__ = 0;
                            clone.__values__ = undefined;
                            if (result) previous.__wrapped__ = clone; else result = clone;
                            var previous = clone;
                            parent = parent.__wrapped__;
                        }
                        previous.__wrapped__ = value;
                        return result;
                    }
                    function wrapperReverse() {
                        var value = this.__wrapped__;
                        if (value instanceof LazyWrapper) {
                            var wrapped = value;
                            if (this.__actions__.length) wrapped = new LazyWrapper(this);
                            wrapped = wrapped.reverse();
                            wrapped.__actions__.push({
                                func: thru,
                                args: [ reverse ],
                                thisArg: undefined
                            });
                            return new LodashWrapper(wrapped, this.__chain__);
                        }
                        return this.thru(reverse);
                    }
                    function wrapperValue() {
                        return baseWrapperValue(this.__wrapped__, this.__actions__);
                    }
                    var countBy = createAggregator((function(result, value, key) {
                        if (hasOwnProperty.call(result, key)) ++result[key]; else baseAssignValue(result, key, 1);
                    }));
                    function every(collection, predicate, guard) {
                        var func = isArray(collection) ? arrayEvery : baseEvery;
                        if (guard && isIterateeCall(collection, predicate, guard)) predicate = undefined;
                        return func(collection, getIteratee(predicate, 3));
                    }
                    function filter(collection, predicate) {
                        var func = isArray(collection) ? arrayFilter : baseFilter;
                        return func(collection, getIteratee(predicate, 3));
                    }
                    var find = createFind(findIndex);
                    var findLast = createFind(findLastIndex);
                    function flatMap(collection, iteratee) {
                        return baseFlatten(map(collection, iteratee), 1);
                    }
                    function flatMapDeep(collection, iteratee) {
                        return baseFlatten(map(collection, iteratee), INFINITY);
                    }
                    function flatMapDepth(collection, iteratee, depth) {
                        depth = depth === undefined ? 1 : toInteger(depth);
                        return baseFlatten(map(collection, iteratee), depth);
                    }
                    function forEach(collection, iteratee) {
                        var func = isArray(collection) ? arrayEach : baseEach;
                        return func(collection, getIteratee(iteratee, 3));
                    }
                    function forEachRight(collection, iteratee) {
                        var func = isArray(collection) ? arrayEachRight : baseEachRight;
                        return func(collection, getIteratee(iteratee, 3));
                    }
                    var groupBy = createAggregator((function(result, value, key) {
                        if (hasOwnProperty.call(result, key)) result[key].push(value); else baseAssignValue(result, key, [ value ]);
                    }));
                    function includes(collection, value, fromIndex, guard) {
                        collection = isArrayLike(collection) ? collection : values(collection);
                        fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
                        var length = collection.length;
                        if (fromIndex < 0) fromIndex = nativeMax(length + fromIndex, 0);
                        return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
                    }
                    var invokeMap = baseRest((function(collection, path, args) {
                        var index = -1, isFunc = "function" == typeof path, result = isArrayLike(collection) ? Array(collection.length) : [];
                        baseEach(collection, (function(value) {
                            result[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
                        }));
                        return result;
                    }));
                    var keyBy = createAggregator((function(result, value, key) {
                        baseAssignValue(result, key, value);
                    }));
                    function map(collection, iteratee) {
                        var func = isArray(collection) ? arrayMap : baseMap;
                        return func(collection, getIteratee(iteratee, 3));
                    }
                    function orderBy(collection, iteratees, orders, guard) {
                        if (null == collection) return [];
                        if (!isArray(iteratees)) iteratees = null == iteratees ? [] : [ iteratees ];
                        orders = guard ? undefined : orders;
                        if (!isArray(orders)) orders = null == orders ? [] : [ orders ];
                        return baseOrderBy(collection, iteratees, orders);
                    }
                    var partition = createAggregator((function(result, value, key) {
                        result[key ? 0 : 1].push(value);
                    }), (function() {
                        return [ [], [] ];
                    }));
                    function reduce(collection, iteratee, accumulator) {
                        var func = isArray(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
                        return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
                    }
                    function reduceRight(collection, iteratee, accumulator) {
                        var func = isArray(collection) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
                        return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
                    }
                    function reject(collection, predicate) {
                        var func = isArray(collection) ? arrayFilter : baseFilter;
                        return func(collection, negate(getIteratee(predicate, 3)));
                    }
                    function sample(collection) {
                        var func = isArray(collection) ? arraySample : baseSample;
                        return func(collection);
                    }
                    function sampleSize(collection, n, guard) {
                        if (guard ? isIterateeCall(collection, n, guard) : n === undefined) n = 1; else n = toInteger(n);
                        var func = isArray(collection) ? arraySampleSize : baseSampleSize;
                        return func(collection, n);
                    }
                    function shuffle(collection) {
                        var func = isArray(collection) ? arrayShuffle : baseShuffle;
                        return func(collection);
                    }
                    function size(collection) {
                        if (null == collection) return 0;
                        if (isArrayLike(collection)) return isString(collection) ? stringSize(collection) : collection.length;
                        var tag = getTag(collection);
                        if (tag == mapTag || tag == setTag) return collection.size;
                        return baseKeys(collection).length;
                    }
                    function some(collection, predicate, guard) {
                        var func = isArray(collection) ? arraySome : baseSome;
                        if (guard && isIterateeCall(collection, predicate, guard)) predicate = undefined;
                        return func(collection, getIteratee(predicate, 3));
                    }
                    var sortBy = baseRest((function(collection, iteratees) {
                        if (null == collection) return [];
                        var length = iteratees.length;
                        if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) iteratees = []; else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) iteratees = [ iteratees[0] ];
                        return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
                    }));
                    var now = ctxNow || function() {
                        return root.Date.now();
                    };
                    function after(n, func) {
                        if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                        n = toInteger(n);
                        return function() {
                            if (--n < 1) return func.apply(this, arguments);
                        };
                    }
                    function ary(func, n, guard) {
                        n = guard ? undefined : n;
                        n = func && null == n ? func.length : n;
                        return createWrap(func, WRAP_ARY_FLAG, undefined, undefined, undefined, undefined, n);
                    }
                    function before(n, func) {
                        var result;
                        if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                        n = toInteger(n);
                        return function() {
                            if (--n > 0) result = func.apply(this, arguments);
                            if (n <= 1) func = undefined;
                            return result;
                        };
                    }
                    var bind = baseRest((function(func, thisArg, partials) {
                        var bitmask = WRAP_BIND_FLAG;
                        if (partials.length) {
                            var holders = replaceHolders(partials, getHolder(bind));
                            bitmask |= WRAP_PARTIAL_FLAG;
                        }
                        return createWrap(func, bitmask, thisArg, partials, holders);
                    }));
                    var bindKey = baseRest((function(object, key, partials) {
                        var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
                        if (partials.length) {
                            var holders = replaceHolders(partials, getHolder(bindKey));
                            bitmask |= WRAP_PARTIAL_FLAG;
                        }
                        return createWrap(key, bitmask, object, partials, holders);
                    }));
                    function curry(func, arity, guard) {
                        arity = guard ? undefined : arity;
                        var result = createWrap(func, WRAP_CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
                        result.placeholder = curry.placeholder;
                        return result;
                    }
                    function curryRight(func, arity, guard) {
                        arity = guard ? undefined : arity;
                        var result = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
                        result.placeholder = curryRight.placeholder;
                        return result;
                    }
                    function debounce(func, wait, options) {
                        var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
                        if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                        wait = toNumber(wait) || 0;
                        if (isObject(options)) {
                            leading = !!options.leading;
                            maxing = "maxWait" in options;
                            maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
                            trailing = "trailing" in options ? !!options.trailing : trailing;
                        }
                        function invokeFunc(time) {
                            var args = lastArgs, thisArg = lastThis;
                            lastArgs = lastThis = undefined;
                            lastInvokeTime = time;
                            result = func.apply(thisArg, args);
                            return result;
                        }
                        function leadingEdge(time) {
                            lastInvokeTime = time;
                            timerId = setTimeout(timerExpired, wait);
                            return leading ? invokeFunc(time) : result;
                        }
                        function remainingWait(time) {
                            var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
                            return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
                        }
                        function shouldInvoke(time) {
                            var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
                            return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
                        }
                        function timerExpired() {
                            var time = now();
                            if (shouldInvoke(time)) return trailingEdge(time);
                            timerId = setTimeout(timerExpired, remainingWait(time));
                        }
                        function trailingEdge(time) {
                            timerId = undefined;
                            if (trailing && lastArgs) return invokeFunc(time);
                            lastArgs = lastThis = undefined;
                            return result;
                        }
                        function cancel() {
                            if (timerId !== undefined) clearTimeout(timerId);
                            lastInvokeTime = 0;
                            lastArgs = lastCallTime = lastThis = timerId = undefined;
                        }
                        function flush() {
                            return timerId === undefined ? result : trailingEdge(now());
                        }
                        function debounced() {
                            var time = now(), isInvoking = shouldInvoke(time);
                            lastArgs = arguments;
                            lastThis = this;
                            lastCallTime = time;
                            if (isInvoking) {
                                if (timerId === undefined) return leadingEdge(lastCallTime);
                                if (maxing) {
                                    clearTimeout(timerId);
                                    timerId = setTimeout(timerExpired, wait);
                                    return invokeFunc(lastCallTime);
                                }
                            }
                            if (timerId === undefined) timerId = setTimeout(timerExpired, wait);
                            return result;
                        }
                        debounced.cancel = cancel;
                        debounced.flush = flush;
                        return debounced;
                    }
                    var defer = baseRest((function(func, args) {
                        return baseDelay(func, 1, args);
                    }));
                    var delay = baseRest((function(func, wait, args) {
                        return baseDelay(func, toNumber(wait) || 0, args);
                    }));
                    function flip(func) {
                        return createWrap(func, WRAP_FLIP_FLAG);
                    }
                    function memoize(func, resolver) {
                        if ("function" != typeof func || null != resolver && "function" != typeof resolver) throw new TypeError(FUNC_ERROR_TEXT);
                        var memoized = function() {
                            var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
                            if (cache.has(key)) return cache.get(key);
                            var result = func.apply(this, args);
                            memoized.cache = cache.set(key, result) || cache;
                            return result;
                        };
                        memoized.cache = new (memoize.Cache || MapCache);
                        return memoized;
                    }
                    memoize.Cache = MapCache;
                    function negate(predicate) {
                        if ("function" != typeof predicate) throw new TypeError(FUNC_ERROR_TEXT);
                        return function() {
                            var args = arguments;
                            switch (args.length) {
                              case 0:
                                return !predicate.call(this);

                              case 1:
                                return !predicate.call(this, args[0]);

                              case 2:
                                return !predicate.call(this, args[0], args[1]);

                              case 3:
                                return !predicate.call(this, args[0], args[1], args[2]);
                            }
                            return !predicate.apply(this, args);
                        };
                    }
                    function once(func) {
                        return before(2, func);
                    }
                    var overArgs = castRest((function(func, transforms) {
                        transforms = 1 == transforms.length && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
                        var funcsLength = transforms.length;
                        return baseRest((function(args) {
                            var index = -1, length = nativeMin(args.length, funcsLength);
                            while (++index < length) args[index] = transforms[index].call(this, args[index]);
                            return apply(func, this, args);
                        }));
                    }));
                    var partial = baseRest((function(func, partials) {
                        var holders = replaceHolders(partials, getHolder(partial));
                        return createWrap(func, WRAP_PARTIAL_FLAG, undefined, partials, holders);
                    }));
                    var partialRight = baseRest((function(func, partials) {
                        var holders = replaceHolders(partials, getHolder(partialRight));
                        return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined, partials, holders);
                    }));
                    var rearg = flatRest((function(func, indexes) {
                        return createWrap(func, WRAP_REARG_FLAG, undefined, undefined, undefined, indexes);
                    }));
                    function rest(func, start) {
                        if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                        start = start === undefined ? start : toInteger(start);
                        return baseRest(func, start);
                    }
                    function spread(func, start) {
                        if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                        start = null == start ? 0 : nativeMax(toInteger(start), 0);
                        return baseRest((function(args) {
                            var array = args[start], otherArgs = castSlice(args, 0, start);
                            if (array) arrayPush(otherArgs, array);
                            return apply(func, this, otherArgs);
                        }));
                    }
                    function throttle(func, wait, options) {
                        var leading = true, trailing = true;
                        if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                        if (isObject(options)) {
                            leading = "leading" in options ? !!options.leading : leading;
                            trailing = "trailing" in options ? !!options.trailing : trailing;
                        }
                        return debounce(func, wait, {
                            leading,
                            maxWait: wait,
                            trailing
                        });
                    }
                    function unary(func) {
                        return ary(func, 1);
                    }
                    function wrap(value, wrapper) {
                        return partial(castFunction(wrapper), value);
                    }
                    function castArray() {
                        if (!arguments.length) return [];
                        var value = arguments[0];
                        return isArray(value) ? value : [ value ];
                    }
                    function clone(value) {
                        return baseClone(value, CLONE_SYMBOLS_FLAG);
                    }
                    function cloneWith(value, customizer) {
                        customizer = "function" == typeof customizer ? customizer : undefined;
                        return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
                    }
                    function cloneDeep(value) {
                        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
                    }
                    function cloneDeepWith(value, customizer) {
                        customizer = "function" == typeof customizer ? customizer : undefined;
                        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
                    }
                    function conformsTo(object, source) {
                        return null == source || baseConformsTo(object, source, keys(source));
                    }
                    function eq(value, other) {
                        return value === other || value !== value && other !== other;
                    }
                    var gt = createRelationalOperation(baseGt);
                    var gte = createRelationalOperation((function(value, other) {
                        return value >= other;
                    }));
                    var isArguments = baseIsArguments(function() {
                        return arguments;
                    }()) ? baseIsArguments : function(value) {
                        return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
                    };
                    var isArray = Array.isArray;
                    var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
                    function isArrayLike(value) {
                        return null != value && isLength(value.length) && !isFunction(value);
                    }
                    function isArrayLikeObject(value) {
                        return isObjectLike(value) && isArrayLike(value);
                    }
                    function isBoolean(value) {
                        return true === value || false === value || isObjectLike(value) && baseGetTag(value) == boolTag;
                    }
                    var isBuffer = nativeIsBuffer || stubFalse;
                    var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
                    function isElement(value) {
                        return isObjectLike(value) && 1 === value.nodeType && !isPlainObject(value);
                    }
                    function isEmpty(value) {
                        if (null == value) return true;
                        if (isArrayLike(value) && (isArray(value) || "string" == typeof value || "function" == typeof value.splice || isBuffer(value) || isTypedArray(value) || isArguments(value))) return !value.length;
                        var tag = getTag(value);
                        if (tag == mapTag || tag == setTag) return !value.size;
                        if (isPrototype(value)) return !baseKeys(value).length;
                        for (var key in value) if (hasOwnProperty.call(value, key)) return false;
                        return true;
                    }
                    function isEqual(value, other) {
                        return baseIsEqual(value, other);
                    }
                    function isEqualWith(value, other, customizer) {
                        customizer = "function" == typeof customizer ? customizer : undefined;
                        var result = customizer ? customizer(value, other) : undefined;
                        return result === undefined ? baseIsEqual(value, other, undefined, customizer) : !!result;
                    }
                    function isError(value) {
                        if (!isObjectLike(value)) return false;
                        var tag = baseGetTag(value);
                        return tag == errorTag || tag == domExcTag || "string" == typeof value.message && "string" == typeof value.name && !isPlainObject(value);
                    }
                    function isFinite(value) {
                        return "number" == typeof value && nativeIsFinite(value);
                    }
                    function isFunction(value) {
                        if (!isObject(value)) return false;
                        var tag = baseGetTag(value);
                        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
                    }
                    function isInteger(value) {
                        return "number" == typeof value && value == toInteger(value);
                    }
                    function isLength(value) {
                        return "number" == typeof value && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
                    }
                    function isObject(value) {
                        var type = typeof value;
                        return null != value && ("object" == type || "function" == type);
                    }
                    function isObjectLike(value) {
                        return null != value && "object" == typeof value;
                    }
                    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
                    function isMatch(object, source) {
                        return object === source || baseIsMatch(object, source, getMatchData(source));
                    }
                    function isMatchWith(object, source, customizer) {
                        customizer = "function" == typeof customizer ? customizer : undefined;
                        return baseIsMatch(object, source, getMatchData(source), customizer);
                    }
                    function isNaN(value) {
                        return isNumber(value) && value != +value;
                    }
                    function isNative(value) {
                        if (isMaskable(value)) throw new Error(CORE_ERROR_TEXT);
                        return baseIsNative(value);
                    }
                    function isNull(value) {
                        return null === value;
                    }
                    function isNil(value) {
                        return null == value;
                    }
                    function isNumber(value) {
                        return "number" == typeof value || isObjectLike(value) && baseGetTag(value) == numberTag;
                    }
                    function isPlainObject(value) {
                        if (!isObjectLike(value) || baseGetTag(value) != objectTag) return false;
                        var proto = getPrototype(value);
                        if (null === proto) return true;
                        var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
                        return "function" == typeof Ctor && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
                    }
                    var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
                    function isSafeInteger(value) {
                        return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
                    }
                    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
                    function isString(value) {
                        return "string" == typeof value || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
                    }
                    function isSymbol(value) {
                        return "symbol" == typeof value || isObjectLike(value) && baseGetTag(value) == symbolTag;
                    }
                    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
                    function isUndefined(value) {
                        return value === undefined;
                    }
                    function isWeakMap(value) {
                        return isObjectLike(value) && getTag(value) == weakMapTag;
                    }
                    function isWeakSet(value) {
                        return isObjectLike(value) && baseGetTag(value) == weakSetTag;
                    }
                    var lt = createRelationalOperation(baseLt);
                    var lte = createRelationalOperation((function(value, other) {
                        return value <= other;
                    }));
                    function toArray(value) {
                        if (!value) return [];
                        if (isArrayLike(value)) return isString(value) ? stringToArray(value) : copyArray(value);
                        if (symIterator && value[symIterator]) return iteratorToArray(value[symIterator]());
                        var tag = getTag(value), func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
                        return func(value);
                    }
                    function toFinite(value) {
                        if (!value) return 0 === value ? value : 0;
                        value = toNumber(value);
                        if (value === INFINITY || value === -INFINITY) {
                            var sign = value < 0 ? -1 : 1;
                            return sign * MAX_INTEGER;
                        }
                        return value === value ? value : 0;
                    }
                    function toInteger(value) {
                        var result = toFinite(value), remainder = result % 1;
                        return result === result ? remainder ? result - remainder : result : 0;
                    }
                    function toLength(value) {
                        return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
                    }
                    function toNumber(value) {
                        if ("number" == typeof value) return value;
                        if (isSymbol(value)) return NAN;
                        if (isObject(value)) {
                            var other = "function" == typeof value.valueOf ? value.valueOf() : value;
                            value = isObject(other) ? other + "" : other;
                        }
                        if ("string" != typeof value) return 0 === value ? value : +value;
                        value = baseTrim(value);
                        var isBinary = reIsBinary.test(value);
                        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
                    }
                    function toPlainObject(value) {
                        return copyObject(value, keysIn(value));
                    }
                    function toSafeInteger(value) {
                        return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER) : 0 === value ? value : 0;
                    }
                    function toString(value) {
                        return null == value ? "" : baseToString(value);
                    }
                    var assign = createAssigner((function(object, source) {
                        if (isPrototype(source) || isArrayLike(source)) {
                            copyObject(source, keys(source), object);
                            return;
                        }
                        for (var key in source) if (hasOwnProperty.call(source, key)) assignValue(object, key, source[key]);
                    }));
                    var assignIn = createAssigner((function(object, source) {
                        copyObject(source, keysIn(source), object);
                    }));
                    var assignInWith = createAssigner((function(object, source, srcIndex, customizer) {
                        copyObject(source, keysIn(source), object, customizer);
                    }));
                    var assignWith = createAssigner((function(object, source, srcIndex, customizer) {
                        copyObject(source, keys(source), object, customizer);
                    }));
                    var at = flatRest(baseAt);
                    function create(prototype, properties) {
                        var result = baseCreate(prototype);
                        return null == properties ? result : baseAssign(result, properties);
                    }
                    var defaults = baseRest((function(object, sources) {
                        object = Object(object);
                        var index = -1;
                        var length = sources.length;
                        var guard = length > 2 ? sources[2] : undefined;
                        if (guard && isIterateeCall(sources[0], sources[1], guard)) length = 1;
                        while (++index < length) {
                            var source = sources[index];
                            var props = keysIn(source);
                            var propsIndex = -1;
                            var propsLength = props.length;
                            while (++propsIndex < propsLength) {
                                var key = props[propsIndex];
                                var value = object[key];
                                if (value === undefined || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) object[key] = source[key];
                            }
                        }
                        return object;
                    }));
                    var defaultsDeep = baseRest((function(args) {
                        args.push(undefined, customDefaultsMerge);
                        return apply(mergeWith, undefined, args);
                    }));
                    function findKey(object, predicate) {
                        return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
                    }
                    function findLastKey(object, predicate) {
                        return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
                    }
                    function forIn(object, iteratee) {
                        return null == object ? object : baseFor(object, getIteratee(iteratee, 3), keysIn);
                    }
                    function forInRight(object, iteratee) {
                        return null == object ? object : baseForRight(object, getIteratee(iteratee, 3), keysIn);
                    }
                    function forOwn(object, iteratee) {
                        return object && baseForOwn(object, getIteratee(iteratee, 3));
                    }
                    function forOwnRight(object, iteratee) {
                        return object && baseForOwnRight(object, getIteratee(iteratee, 3));
                    }
                    function functions(object) {
                        return null == object ? [] : baseFunctions(object, keys(object));
                    }
                    function functionsIn(object) {
                        return null == object ? [] : baseFunctions(object, keysIn(object));
                    }
                    function get(object, path, defaultValue) {
                        var result = null == object ? undefined : baseGet(object, path);
                        return result === undefined ? defaultValue : result;
                    }
                    function has(object, path) {
                        return null != object && hasPath(object, path, baseHas);
                    }
                    function hasIn(object, path) {
                        return null != object && hasPath(object, path, baseHasIn);
                    }
                    var invert = createInverter((function(result, value, key) {
                        if (null != value && "function" != typeof value.toString) value = nativeObjectToString.call(value);
                        result[value] = key;
                    }), constant(identity));
                    var invertBy = createInverter((function(result, value, key) {
                        if (null != value && "function" != typeof value.toString) value = nativeObjectToString.call(value);
                        if (hasOwnProperty.call(result, value)) result[value].push(key); else result[value] = [ key ];
                    }), getIteratee);
                    var invoke = baseRest(baseInvoke);
                    function keys(object) {
                        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
                    }
                    function keysIn(object) {
                        return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
                    }
                    function mapKeys(object, iteratee) {
                        var result = {};
                        iteratee = getIteratee(iteratee, 3);
                        baseForOwn(object, (function(value, key, object) {
                            baseAssignValue(result, iteratee(value, key, object), value);
                        }));
                        return result;
                    }
                    function mapValues(object, iteratee) {
                        var result = {};
                        iteratee = getIteratee(iteratee, 3);
                        baseForOwn(object, (function(value, key, object) {
                            baseAssignValue(result, key, iteratee(value, key, object));
                        }));
                        return result;
                    }
                    var merge = createAssigner((function(object, source, srcIndex) {
                        baseMerge(object, source, srcIndex);
                    }));
                    var mergeWith = createAssigner((function(object, source, srcIndex, customizer) {
                        baseMerge(object, source, srcIndex, customizer);
                    }));
                    var omit = flatRest((function(object, paths) {
                        var result = {};
                        if (null == object) return result;
                        var isDeep = false;
                        paths = arrayMap(paths, (function(path) {
                            path = castPath(path, object);
                            isDeep || (isDeep = path.length > 1);
                            return path;
                        }));
                        copyObject(object, getAllKeysIn(object), result);
                        if (isDeep) result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
                        var length = paths.length;
                        while (length--) baseUnset(result, paths[length]);
                        return result;
                    }));
                    function omitBy(object, predicate) {
                        return pickBy(object, negate(getIteratee(predicate)));
                    }
                    var pick = flatRest((function(object, paths) {
                        return null == object ? {} : basePick(object, paths);
                    }));
                    function pickBy(object, predicate) {
                        if (null == object) return {};
                        var props = arrayMap(getAllKeysIn(object), (function(prop) {
                            return [ prop ];
                        }));
                        predicate = getIteratee(predicate);
                        return basePickBy(object, props, (function(value, path) {
                            return predicate(value, path[0]);
                        }));
                    }
                    function result(object, path, defaultValue) {
                        path = castPath(path, object);
                        var index = -1, length = path.length;
                        if (!length) {
                            length = 1;
                            object = undefined;
                        }
                        while (++index < length) {
                            var value = null == object ? undefined : object[toKey(path[index])];
                            if (value === undefined) {
                                index = length;
                                value = defaultValue;
                            }
                            object = isFunction(value) ? value.call(object) : value;
                        }
                        return object;
                    }
                    function set(object, path, value) {
                        return null == object ? object : baseSet(object, path, value);
                    }
                    function setWith(object, path, value, customizer) {
                        customizer = "function" == typeof customizer ? customizer : undefined;
                        return null == object ? object : baseSet(object, path, value, customizer);
                    }
                    var toPairs = createToPairs(keys);
                    var toPairsIn = createToPairs(keysIn);
                    function transform(object, iteratee, accumulator) {
                        var isArr = isArray(object), isArrLike = isArr || isBuffer(object) || isTypedArray(object);
                        iteratee = getIteratee(iteratee, 4);
                        if (null == accumulator) {
                            var Ctor = object && object.constructor;
                            if (isArrLike) accumulator = isArr ? new Ctor : []; else if (isObject(object)) accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {}; else accumulator = {};
                        }
                        (isArrLike ? arrayEach : baseForOwn)(object, (function(value, index, object) {
                            return iteratee(accumulator, value, index, object);
                        }));
                        return accumulator;
                    }
                    function unset(object, path) {
                        return null == object ? true : baseUnset(object, path);
                    }
                    function update(object, path, updater) {
                        return null == object ? object : baseUpdate(object, path, castFunction(updater));
                    }
                    function updateWith(object, path, updater, customizer) {
                        customizer = "function" == typeof customizer ? customizer : undefined;
                        return null == object ? object : baseUpdate(object, path, castFunction(updater), customizer);
                    }
                    function values(object) {
                        return null == object ? [] : baseValues(object, keys(object));
                    }
                    function valuesIn(object) {
                        return null == object ? [] : baseValues(object, keysIn(object));
                    }
                    function clamp(number, lower, upper) {
                        if (upper === undefined) {
                            upper = lower;
                            lower = undefined;
                        }
                        if (upper !== undefined) {
                            upper = toNumber(upper);
                            upper = upper === upper ? upper : 0;
                        }
                        if (lower !== undefined) {
                            lower = toNumber(lower);
                            lower = lower === lower ? lower : 0;
                        }
                        return baseClamp(toNumber(number), lower, upper);
                    }
                    function inRange(number, start, end) {
                        start = toFinite(start);
                        if (end === undefined) {
                            end = start;
                            start = 0;
                        } else end = toFinite(end);
                        number = toNumber(number);
                        return baseInRange(number, start, end);
                    }
                    function random(lower, upper, floating) {
                        if (floating && "boolean" != typeof floating && isIterateeCall(lower, upper, floating)) upper = floating = undefined;
                        if (floating === undefined) if ("boolean" == typeof upper) {
                            floating = upper;
                            upper = undefined;
                        } else if ("boolean" == typeof lower) {
                            floating = lower;
                            lower = undefined;
                        }
                        if (lower === undefined && upper === undefined) {
                            lower = 0;
                            upper = 1;
                        } else {
                            lower = toFinite(lower);
                            if (upper === undefined) {
                                upper = lower;
                                lower = 0;
                            } else upper = toFinite(upper);
                        }
                        if (lower > upper) {
                            var temp = lower;
                            lower = upper;
                            upper = temp;
                        }
                        if (floating || lower % 1 || upper % 1) {
                            var rand = nativeRandom();
                            return nativeMin(lower + rand * (upper - lower + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
                        }
                        return baseRandom(lower, upper);
                    }
                    var camelCase = createCompounder((function(result, word, index) {
                        word = word.toLowerCase();
                        return result + (index ? capitalize(word) : word);
                    }));
                    function capitalize(string) {
                        return upperFirst(toString(string).toLowerCase());
                    }
                    function deburr(string) {
                        string = toString(string);
                        return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
                    }
                    function endsWith(string, target, position) {
                        string = toString(string);
                        target = baseToString(target);
                        var length = string.length;
                        position = position === undefined ? length : baseClamp(toInteger(position), 0, length);
                        var end = position;
                        position -= target.length;
                        return position >= 0 && string.slice(position, end) == target;
                    }
                    function escape(string) {
                        string = toString(string);
                        return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
                    }
                    function escapeRegExp(string) {
                        string = toString(string);
                        return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
                    }
                    var kebabCase = createCompounder((function(result, word, index) {
                        return result + (index ? "-" : "") + word.toLowerCase();
                    }));
                    var lowerCase = createCompounder((function(result, word, index) {
                        return result + (index ? " " : "") + word.toLowerCase();
                    }));
                    var lowerFirst = createCaseFirst("toLowerCase");
                    function pad(string, length, chars) {
                        string = toString(string);
                        length = toInteger(length);
                        var strLength = length ? stringSize(string) : 0;
                        if (!length || strLength >= length) return string;
                        var mid = (length - strLength) / 2;
                        return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
                    }
                    function padEnd(string, length, chars) {
                        string = toString(string);
                        length = toInteger(length);
                        var strLength = length ? stringSize(string) : 0;
                        return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
                    }
                    function padStart(string, length, chars) {
                        string = toString(string);
                        length = toInteger(length);
                        var strLength = length ? stringSize(string) : 0;
                        return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
                    }
                    function parseInt(string, radix, guard) {
                        if (guard || null == radix) radix = 0; else if (radix) radix = +radix;
                        return nativeParseInt(toString(string).replace(reTrimStart, ""), radix || 0);
                    }
                    function repeat(string, n, guard) {
                        if (guard ? isIterateeCall(string, n, guard) : n === undefined) n = 1; else n = toInteger(n);
                        return baseRepeat(toString(string), n);
                    }
                    function replace() {
                        var args = arguments, string = toString(args[0]);
                        return args.length < 3 ? string : string.replace(args[1], args[2]);
                    }
                    var snakeCase = createCompounder((function(result, word, index) {
                        return result + (index ? "_" : "") + word.toLowerCase();
                    }));
                    function split(string, separator, limit) {
                        if (limit && "number" != typeof limit && isIterateeCall(string, separator, limit)) separator = limit = undefined;
                        limit = limit === undefined ? MAX_ARRAY_LENGTH : limit >>> 0;
                        if (!limit) return [];
                        string = toString(string);
                        if (string && ("string" == typeof separator || null != separator && !isRegExp(separator))) {
                            separator = baseToString(separator);
                            if (!separator && hasUnicode(string)) return castSlice(stringToArray(string), 0, limit);
                        }
                        return string.split(separator, limit);
                    }
                    var startCase = createCompounder((function(result, word, index) {
                        return result + (index ? " " : "") + upperFirst(word);
                    }));
                    function startsWith(string, target, position) {
                        string = toString(string);
                        position = null == position ? 0 : baseClamp(toInteger(position), 0, string.length);
                        target = baseToString(target);
                        return string.slice(position, position + target.length) == target;
                    }
                    function template(string, options, guard) {
                        var settings = lodash.templateSettings;
                        if (guard && isIterateeCall(string, options, guard)) options = undefined;
                        string = toString(string);
                        options = assignInWith({}, options, settings, customDefaultsAssignIn);
                        var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
                        var isEscaping, isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
                        var reDelimiters = RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");
                        var sourceURL = "//# sourceURL=" + (hasOwnProperty.call(options, "sourceURL") ? (options.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
                        string.replace(reDelimiters, (function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
                            interpolateValue || (interpolateValue = esTemplateValue);
                            source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
                            if (escapeValue) {
                                isEscaping = true;
                                source += "' +\n__e(" + escapeValue + ") +\n'";
                            }
                            if (evaluateValue) {
                                isEvaluating = true;
                                source += "';\n" + evaluateValue + ";\n__p += '";
                            }
                            if (interpolateValue) source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
                            index = offset + match.length;
                            return match;
                        }));
                        source += "';\n";
                        var variable = hasOwnProperty.call(options, "variable") && options.variable;
                        if (!variable) source = "with (obj) {\n" + source + "\n}\n"; else if (reForbiddenIdentifierChars.test(variable)) throw new Error(INVALID_TEMPL_VAR_ERROR_TEXT);
                        source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
                        source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\n" + "function print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
                        var result = attempt((function() {
                            return Function(importsKeys, sourceURL + "return " + source).apply(undefined, importsValues);
                        }));
                        result.source = source;
                        if (isError(result)) throw result;
                        return result;
                    }
                    function toLower(value) {
                        return toString(value).toLowerCase();
                    }
                    function toUpper(value) {
                        return toString(value).toUpperCase();
                    }
                    function trim(string, chars, guard) {
                        string = toString(string);
                        if (string && (guard || chars === undefined)) return baseTrim(string);
                        if (!string || !(chars = baseToString(chars))) return string;
                        var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
                        return castSlice(strSymbols, start, end).join("");
                    }
                    function trimEnd(string, chars, guard) {
                        string = toString(string);
                        if (string && (guard || chars === undefined)) return string.slice(0, trimmedEndIndex(string) + 1);
                        if (!string || !(chars = baseToString(chars))) return string;
                        var strSymbols = stringToArray(string), end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
                        return castSlice(strSymbols, 0, end).join("");
                    }
                    function trimStart(string, chars, guard) {
                        string = toString(string);
                        if (string && (guard || chars === undefined)) return string.replace(reTrimStart, "");
                        if (!string || !(chars = baseToString(chars))) return string;
                        var strSymbols = stringToArray(string), start = charsStartIndex(strSymbols, stringToArray(chars));
                        return castSlice(strSymbols, start).join("");
                    }
                    function truncate(string, options) {
                        var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
                        if (isObject(options)) {
                            var separator = "separator" in options ? options.separator : separator;
                            length = "length" in options ? toInteger(options.length) : length;
                            omission = "omission" in options ? baseToString(options.omission) : omission;
                        }
                        string = toString(string);
                        var strLength = string.length;
                        if (hasUnicode(string)) {
                            var strSymbols = stringToArray(string);
                            strLength = strSymbols.length;
                        }
                        if (length >= strLength) return string;
                        var end = length - stringSize(omission);
                        if (end < 1) return omission;
                        var result = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
                        if (separator === undefined) return result + omission;
                        if (strSymbols) end += result.length - end;
                        if (isRegExp(separator)) {
                            if (string.slice(end).search(separator)) {
                                var match, substring = result;
                                if (!separator.global) separator = RegExp(separator.source, toString(reFlags.exec(separator)) + "g");
                                separator.lastIndex = 0;
                                while (match = separator.exec(substring)) var newEnd = match.index;
                                result = result.slice(0, newEnd === undefined ? end : newEnd);
                            }
                        } else if (string.indexOf(baseToString(separator), end) != end) {
                            var index = result.lastIndexOf(separator);
                            if (index > -1) result = result.slice(0, index);
                        }
                        return result + omission;
                    }
                    function unescape(string) {
                        string = toString(string);
                        return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
                    }
                    var upperCase = createCompounder((function(result, word, index) {
                        return result + (index ? " " : "") + word.toUpperCase();
                    }));
                    var upperFirst = createCaseFirst("toUpperCase");
                    function words(string, pattern, guard) {
                        string = toString(string);
                        pattern = guard ? undefined : pattern;
                        if (pattern === undefined) return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
                        return string.match(pattern) || [];
                    }
                    var attempt = baseRest((function(func, args) {
                        try {
                            return apply(func, undefined, args);
                        } catch (e) {
                            return isError(e) ? e : new Error(e);
                        }
                    }));
                    var bindAll = flatRest((function(object, methodNames) {
                        arrayEach(methodNames, (function(key) {
                            key = toKey(key);
                            baseAssignValue(object, key, bind(object[key], object));
                        }));
                        return object;
                    }));
                    function cond(pairs) {
                        var length = null == pairs ? 0 : pairs.length, toIteratee = getIteratee();
                        pairs = !length ? [] : arrayMap(pairs, (function(pair) {
                            if ("function" != typeof pair[1]) throw new TypeError(FUNC_ERROR_TEXT);
                            return [ toIteratee(pair[0]), pair[1] ];
                        }));
                        return baseRest((function(args) {
                            var index = -1;
                            while (++index < length) {
                                var pair = pairs[index];
                                if (apply(pair[0], this, args)) return apply(pair[1], this, args);
                            }
                        }));
                    }
                    function conforms(source) {
                        return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
                    }
                    function constant(value) {
                        return function() {
                            return value;
                        };
                    }
                    function defaultTo(value, defaultValue) {
                        return null == value || value !== value ? defaultValue : value;
                    }
                    var flow = createFlow();
                    var flowRight = createFlow(true);
                    function identity(value) {
                        return value;
                    }
                    function iteratee(func) {
                        return baseIteratee("function" == typeof func ? func : baseClone(func, CLONE_DEEP_FLAG));
                    }
                    function matches(source) {
                        return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
                    }
                    function matchesProperty(path, srcValue) {
                        return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
                    }
                    var method = baseRest((function(path, args) {
                        return function(object) {
                            return baseInvoke(object, path, args);
                        };
                    }));
                    var methodOf = baseRest((function(object, args) {
                        return function(path) {
                            return baseInvoke(object, path, args);
                        };
                    }));
                    function mixin(object, source, options) {
                        var props = keys(source), methodNames = baseFunctions(source, props);
                        if (null == options && !(isObject(source) && (methodNames.length || !props.length))) {
                            options = source;
                            source = object;
                            object = this;
                            methodNames = baseFunctions(source, keys(source));
                        }
                        var chain = !(isObject(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object);
                        arrayEach(methodNames, (function(methodName) {
                            var func = source[methodName];
                            object[methodName] = func;
                            if (isFunc) object.prototype[methodName] = function() {
                                var chainAll = this.__chain__;
                                if (chain || chainAll) {
                                    var result = object(this.__wrapped__), actions = result.__actions__ = copyArray(this.__actions__);
                                    actions.push({
                                        func,
                                        args: arguments,
                                        thisArg: object
                                    });
                                    result.__chain__ = chainAll;
                                    return result;
                                }
                                return func.apply(object, arrayPush([ this.value() ], arguments));
                            };
                        }));
                        return object;
                    }
                    function noConflict() {
                        if (root._ === this) root._ = oldDash;
                        return this;
                    }
                    function noop() {}
                    function nthArg(n) {
                        n = toInteger(n);
                        return baseRest((function(args) {
                            return baseNth(args, n);
                        }));
                    }
                    var over = createOver(arrayMap);
                    var overEvery = createOver(arrayEvery);
                    var overSome = createOver(arraySome);
                    function property(path) {
                        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
                    }
                    function propertyOf(object) {
                        return function(path) {
                            return null == object ? undefined : baseGet(object, path);
                        };
                    }
                    var range = createRange();
                    var rangeRight = createRange(true);
                    function stubArray() {
                        return [];
                    }
                    function stubFalse() {
                        return false;
                    }
                    function stubObject() {
                        return {};
                    }
                    function stubString() {
                        return "";
                    }
                    function stubTrue() {
                        return true;
                    }
                    function times(n, iteratee) {
                        n = toInteger(n);
                        if (n < 1 || n > MAX_SAFE_INTEGER) return [];
                        var index = MAX_ARRAY_LENGTH, length = nativeMin(n, MAX_ARRAY_LENGTH);
                        iteratee = getIteratee(iteratee);
                        n -= MAX_ARRAY_LENGTH;
                        var result = baseTimes(length, iteratee);
                        while (++index < n) iteratee(index);
                        return result;
                    }
                    function toPath(value) {
                        if (isArray(value)) return arrayMap(value, toKey);
                        return isSymbol(value) ? [ value ] : copyArray(stringToPath(toString(value)));
                    }
                    function uniqueId(prefix) {
                        var id = ++idCounter;
                        return toString(prefix) + id;
                    }
                    var add = createMathOperation((function(augend, addend) {
                        return augend + addend;
                    }), 0);
                    var ceil = createRound("ceil");
                    var divide = createMathOperation((function(dividend, divisor) {
                        return dividend / divisor;
                    }), 1);
                    var floor = createRound("floor");
                    function max(array) {
                        return array && array.length ? baseExtremum(array, identity, baseGt) : undefined;
                    }
                    function maxBy(array, iteratee) {
                        return array && array.length ? baseExtremum(array, getIteratee(iteratee, 2), baseGt) : undefined;
                    }
                    function mean(array) {
                        return baseMean(array, identity);
                    }
                    function meanBy(array, iteratee) {
                        return baseMean(array, getIteratee(iteratee, 2));
                    }
                    function min(array) {
                        return array && array.length ? baseExtremum(array, identity, baseLt) : undefined;
                    }
                    function minBy(array, iteratee) {
                        return array && array.length ? baseExtremum(array, getIteratee(iteratee, 2), baseLt) : undefined;
                    }
                    var multiply = createMathOperation((function(multiplier, multiplicand) {
                        return multiplier * multiplicand;
                    }), 1);
                    var round = createRound("round");
                    var subtract = createMathOperation((function(minuend, subtrahend) {
                        return minuend - subtrahend;
                    }), 0);
                    function sum(array) {
                        return array && array.length ? baseSum(array, identity) : 0;
                    }
                    function sumBy(array, iteratee) {
                        return array && array.length ? baseSum(array, getIteratee(iteratee, 2)) : 0;
                    }
                    lodash.after = after;
                    lodash.ary = ary;
                    lodash.assign = assign;
                    lodash.assignIn = assignIn;
                    lodash.assignInWith = assignInWith;
                    lodash.assignWith = assignWith;
                    lodash.at = at;
                    lodash.before = before;
                    lodash.bind = bind;
                    lodash.bindAll = bindAll;
                    lodash.bindKey = bindKey;
                    lodash.castArray = castArray;
                    lodash.chain = chain;
                    lodash.chunk = chunk;
                    lodash.compact = compact;
                    lodash.concat = concat;
                    lodash.cond = cond;
                    lodash.conforms = conforms;
                    lodash.constant = constant;
                    lodash.countBy = countBy;
                    lodash.create = create;
                    lodash.curry = curry;
                    lodash.curryRight = curryRight;
                    lodash.debounce = debounce;
                    lodash.defaults = defaults;
                    lodash.defaultsDeep = defaultsDeep;
                    lodash.defer = defer;
                    lodash.delay = delay;
                    lodash.difference = difference;
                    lodash.differenceBy = differenceBy;
                    lodash.differenceWith = differenceWith;
                    lodash.drop = drop;
                    lodash.dropRight = dropRight;
                    lodash.dropRightWhile = dropRightWhile;
                    lodash.dropWhile = dropWhile;
                    lodash.fill = fill;
                    lodash.filter = filter;
                    lodash.flatMap = flatMap;
                    lodash.flatMapDeep = flatMapDeep;
                    lodash.flatMapDepth = flatMapDepth;
                    lodash.flatten = flatten;
                    lodash.flattenDeep = flattenDeep;
                    lodash.flattenDepth = flattenDepth;
                    lodash.flip = flip;
                    lodash.flow = flow;
                    lodash.flowRight = flowRight;
                    lodash.fromPairs = fromPairs;
                    lodash.functions = functions;
                    lodash.functionsIn = functionsIn;
                    lodash.groupBy = groupBy;
                    lodash.initial = initial;
                    lodash.intersection = intersection;
                    lodash.intersectionBy = intersectionBy;
                    lodash.intersectionWith = intersectionWith;
                    lodash.invert = invert;
                    lodash.invertBy = invertBy;
                    lodash.invokeMap = invokeMap;
                    lodash.iteratee = iteratee;
                    lodash.keyBy = keyBy;
                    lodash.keys = keys;
                    lodash.keysIn = keysIn;
                    lodash.map = map;
                    lodash.mapKeys = mapKeys;
                    lodash.mapValues = mapValues;
                    lodash.matches = matches;
                    lodash.matchesProperty = matchesProperty;
                    lodash.memoize = memoize;
                    lodash.merge = merge;
                    lodash.mergeWith = mergeWith;
                    lodash.method = method;
                    lodash.methodOf = methodOf;
                    lodash.mixin = mixin;
                    lodash.negate = negate;
                    lodash.nthArg = nthArg;
                    lodash.omit = omit;
                    lodash.omitBy = omitBy;
                    lodash.once = once;
                    lodash.orderBy = orderBy;
                    lodash.over = over;
                    lodash.overArgs = overArgs;
                    lodash.overEvery = overEvery;
                    lodash.overSome = overSome;
                    lodash.partial = partial;
                    lodash.partialRight = partialRight;
                    lodash.partition = partition;
                    lodash.pick = pick;
                    lodash.pickBy = pickBy;
                    lodash.property = property;
                    lodash.propertyOf = propertyOf;
                    lodash.pull = pull;
                    lodash.pullAll = pullAll;
                    lodash.pullAllBy = pullAllBy;
                    lodash.pullAllWith = pullAllWith;
                    lodash.pullAt = pullAt;
                    lodash.range = range;
                    lodash.rangeRight = rangeRight;
                    lodash.rearg = rearg;
                    lodash.reject = reject;
                    lodash.remove = remove;
                    lodash.rest = rest;
                    lodash.reverse = reverse;
                    lodash.sampleSize = sampleSize;
                    lodash.set = set;
                    lodash.setWith = setWith;
                    lodash.shuffle = shuffle;
                    lodash.slice = slice;
                    lodash.sortBy = sortBy;
                    lodash.sortedUniq = sortedUniq;
                    lodash.sortedUniqBy = sortedUniqBy;
                    lodash.split = split;
                    lodash.spread = spread;
                    lodash.tail = tail;
                    lodash.take = take;
                    lodash.takeRight = takeRight;
                    lodash.takeRightWhile = takeRightWhile;
                    lodash.takeWhile = takeWhile;
                    lodash.tap = tap;
                    lodash.throttle = throttle;
                    lodash.thru = thru;
                    lodash.toArray = toArray;
                    lodash.toPairs = toPairs;
                    lodash.toPairsIn = toPairsIn;
                    lodash.toPath = toPath;
                    lodash.toPlainObject = toPlainObject;
                    lodash.transform = transform;
                    lodash.unary = unary;
                    lodash.union = union;
                    lodash.unionBy = unionBy;
                    lodash.unionWith = unionWith;
                    lodash.uniq = uniq;
                    lodash.uniqBy = uniqBy;
                    lodash.uniqWith = uniqWith;
                    lodash.unset = unset;
                    lodash.unzip = unzip;
                    lodash.unzipWith = unzipWith;
                    lodash.update = update;
                    lodash.updateWith = updateWith;
                    lodash.values = values;
                    lodash.valuesIn = valuesIn;
                    lodash.without = without;
                    lodash.words = words;
                    lodash.wrap = wrap;
                    lodash.xor = xor;
                    lodash.xorBy = xorBy;
                    lodash.xorWith = xorWith;
                    lodash.zip = zip;
                    lodash.zipObject = zipObject;
                    lodash.zipObjectDeep = zipObjectDeep;
                    lodash.zipWith = zipWith;
                    lodash.entries = toPairs;
                    lodash.entriesIn = toPairsIn;
                    lodash.extend = assignIn;
                    lodash.extendWith = assignInWith;
                    mixin(lodash, lodash);
                    lodash.add = add;
                    lodash.attempt = attempt;
                    lodash.camelCase = camelCase;
                    lodash.capitalize = capitalize;
                    lodash.ceil = ceil;
                    lodash.clamp = clamp;
                    lodash.clone = clone;
                    lodash.cloneDeep = cloneDeep;
                    lodash.cloneDeepWith = cloneDeepWith;
                    lodash.cloneWith = cloneWith;
                    lodash.conformsTo = conformsTo;
                    lodash.deburr = deburr;
                    lodash.defaultTo = defaultTo;
                    lodash.divide = divide;
                    lodash.endsWith = endsWith;
                    lodash.eq = eq;
                    lodash.escape = escape;
                    lodash.escapeRegExp = escapeRegExp;
                    lodash.every = every;
                    lodash.find = find;
                    lodash.findIndex = findIndex;
                    lodash.findKey = findKey;
                    lodash.findLast = findLast;
                    lodash.findLastIndex = findLastIndex;
                    lodash.findLastKey = findLastKey;
                    lodash.floor = floor;
                    lodash.forEach = forEach;
                    lodash.forEachRight = forEachRight;
                    lodash.forIn = forIn;
                    lodash.forInRight = forInRight;
                    lodash.forOwn = forOwn;
                    lodash.forOwnRight = forOwnRight;
                    lodash.get = get;
                    lodash.gt = gt;
                    lodash.gte = gte;
                    lodash.has = has;
                    lodash.hasIn = hasIn;
                    lodash.head = head;
                    lodash.identity = identity;
                    lodash.includes = includes;
                    lodash.indexOf = indexOf;
                    lodash.inRange = inRange;
                    lodash.invoke = invoke;
                    lodash.isArguments = isArguments;
                    lodash.isArray = isArray;
                    lodash.isArrayBuffer = isArrayBuffer;
                    lodash.isArrayLike = isArrayLike;
                    lodash.isArrayLikeObject = isArrayLikeObject;
                    lodash.isBoolean = isBoolean;
                    lodash.isBuffer = isBuffer;
                    lodash.isDate = isDate;
                    lodash.isElement = isElement;
                    lodash.isEmpty = isEmpty;
                    lodash.isEqual = isEqual;
                    lodash.isEqualWith = isEqualWith;
                    lodash.isError = isError;
                    lodash.isFinite = isFinite;
                    lodash.isFunction = isFunction;
                    lodash.isInteger = isInteger;
                    lodash.isLength = isLength;
                    lodash.isMap = isMap;
                    lodash.isMatch = isMatch;
                    lodash.isMatchWith = isMatchWith;
                    lodash.isNaN = isNaN;
                    lodash.isNative = isNative;
                    lodash.isNil = isNil;
                    lodash.isNull = isNull;
                    lodash.isNumber = isNumber;
                    lodash.isObject = isObject;
                    lodash.isObjectLike = isObjectLike;
                    lodash.isPlainObject = isPlainObject;
                    lodash.isRegExp = isRegExp;
                    lodash.isSafeInteger = isSafeInteger;
                    lodash.isSet = isSet;
                    lodash.isString = isString;
                    lodash.isSymbol = isSymbol;
                    lodash.isTypedArray = isTypedArray;
                    lodash.isUndefined = isUndefined;
                    lodash.isWeakMap = isWeakMap;
                    lodash.isWeakSet = isWeakSet;
                    lodash.join = join;
                    lodash.kebabCase = kebabCase;
                    lodash.last = last;
                    lodash.lastIndexOf = lastIndexOf;
                    lodash.lowerCase = lowerCase;
                    lodash.lowerFirst = lowerFirst;
                    lodash.lt = lt;
                    lodash.lte = lte;
                    lodash.max = max;
                    lodash.maxBy = maxBy;
                    lodash.mean = mean;
                    lodash.meanBy = meanBy;
                    lodash.min = min;
                    lodash.minBy = minBy;
                    lodash.stubArray = stubArray;
                    lodash.stubFalse = stubFalse;
                    lodash.stubObject = stubObject;
                    lodash.stubString = stubString;
                    lodash.stubTrue = stubTrue;
                    lodash.multiply = multiply;
                    lodash.nth = nth;
                    lodash.noConflict = noConflict;
                    lodash.noop = noop;
                    lodash.now = now;
                    lodash.pad = pad;
                    lodash.padEnd = padEnd;
                    lodash.padStart = padStart;
                    lodash.parseInt = parseInt;
                    lodash.random = random;
                    lodash.reduce = reduce;
                    lodash.reduceRight = reduceRight;
                    lodash.repeat = repeat;
                    lodash.replace = replace;
                    lodash.result = result;
                    lodash.round = round;
                    lodash.runInContext = runInContext;
                    lodash.sample = sample;
                    lodash.size = size;
                    lodash.snakeCase = snakeCase;
                    lodash.some = some;
                    lodash.sortedIndex = sortedIndex;
                    lodash.sortedIndexBy = sortedIndexBy;
                    lodash.sortedIndexOf = sortedIndexOf;
                    lodash.sortedLastIndex = sortedLastIndex;
                    lodash.sortedLastIndexBy = sortedLastIndexBy;
                    lodash.sortedLastIndexOf = sortedLastIndexOf;
                    lodash.startCase = startCase;
                    lodash.startsWith = startsWith;
                    lodash.subtract = subtract;
                    lodash.sum = sum;
                    lodash.sumBy = sumBy;
                    lodash.template = template;
                    lodash.times = times;
                    lodash.toFinite = toFinite;
                    lodash.toInteger = toInteger;
                    lodash.toLength = toLength;
                    lodash.toLower = toLower;
                    lodash.toNumber = toNumber;
                    lodash.toSafeInteger = toSafeInteger;
                    lodash.toString = toString;
                    lodash.toUpper = toUpper;
                    lodash.trim = trim;
                    lodash.trimEnd = trimEnd;
                    lodash.trimStart = trimStart;
                    lodash.truncate = truncate;
                    lodash.unescape = unescape;
                    lodash.uniqueId = uniqueId;
                    lodash.upperCase = upperCase;
                    lodash.upperFirst = upperFirst;
                    lodash.each = forEach;
                    lodash.eachRight = forEachRight;
                    lodash.first = head;
                    mixin(lodash, function() {
                        var source = {};
                        baseForOwn(lodash, (function(func, methodName) {
                            if (!hasOwnProperty.call(lodash.prototype, methodName)) source[methodName] = func;
                        }));
                        return source;
                    }(), {
                        chain: false
                    });
                    lodash.VERSION = VERSION;
                    arrayEach([ "bind", "bindKey", "curry", "curryRight", "partial", "partialRight" ], (function(methodName) {
                        lodash[methodName].placeholder = lodash;
                    }));
                    arrayEach([ "drop", "take" ], (function(methodName, index) {
                        LazyWrapper.prototype[methodName] = function(n) {
                            n = n === undefined ? 1 : nativeMax(toInteger(n), 0);
                            var result = this.__filtered__ && !index ? new LazyWrapper(this) : this.clone();
                            if (result.__filtered__) result.__takeCount__ = nativeMin(n, result.__takeCount__); else result.__views__.push({
                                size: nativeMin(n, MAX_ARRAY_LENGTH),
                                type: methodName + (result.__dir__ < 0 ? "Right" : "")
                            });
                            return result;
                        };
                        LazyWrapper.prototype[methodName + "Right"] = function(n) {
                            return this.reverse()[methodName](n).reverse();
                        };
                    }));
                    arrayEach([ "filter", "map", "takeWhile" ], (function(methodName, index) {
                        var type = index + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
                        LazyWrapper.prototype[methodName] = function(iteratee) {
                            var result = this.clone();
                            result.__iteratees__.push({
                                iteratee: getIteratee(iteratee, 3),
                                type
                            });
                            result.__filtered__ = result.__filtered__ || isFilter;
                            return result;
                        };
                    }));
                    arrayEach([ "head", "last" ], (function(methodName, index) {
                        var takeName = "take" + (index ? "Right" : "");
                        LazyWrapper.prototype[methodName] = function() {
                            return this[takeName](1).value()[0];
                        };
                    }));
                    arrayEach([ "initial", "tail" ], (function(methodName, index) {
                        var dropName = "drop" + (index ? "" : "Right");
                        LazyWrapper.prototype[methodName] = function() {
                            return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
                        };
                    }));
                    LazyWrapper.prototype.compact = function() {
                        return this.filter(identity);
                    };
                    LazyWrapper.prototype.find = function(predicate) {
                        return this.filter(predicate).head();
                    };
                    LazyWrapper.prototype.findLast = function(predicate) {
                        return this.reverse().find(predicate);
                    };
                    LazyWrapper.prototype.invokeMap = baseRest((function(path, args) {
                        if ("function" == typeof path) return new LazyWrapper(this);
                        return this.map((function(value) {
                            return baseInvoke(value, path, args);
                        }));
                    }));
                    LazyWrapper.prototype.reject = function(predicate) {
                        return this.filter(negate(getIteratee(predicate)));
                    };
                    LazyWrapper.prototype.slice = function(start, end) {
                        start = toInteger(start);
                        var result = this;
                        if (result.__filtered__ && (start > 0 || end < 0)) return new LazyWrapper(result);
                        if (start < 0) result = result.takeRight(-start); else if (start) result = result.drop(start);
                        if (end !== undefined) {
                            end = toInteger(end);
                            result = end < 0 ? result.dropRight(-end) : result.take(end - start);
                        }
                        return result;
                    };
                    LazyWrapper.prototype.takeRightWhile = function(predicate) {
                        return this.reverse().takeWhile(predicate).reverse();
                    };
                    LazyWrapper.prototype.toArray = function() {
                        return this.take(MAX_ARRAY_LENGTH);
                    };
                    baseForOwn(LazyWrapper.prototype, (function(func, methodName) {
                        var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash[isTaker ? "take" + ("last" == methodName ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
                        if (!lodashFunc) return;
                        lodash.prototype[methodName] = function() {
                            var value = this.__wrapped__, args = isTaker ? [ 1 ] : arguments, isLazy = value instanceof LazyWrapper, iteratee = args[0], useLazy = isLazy || isArray(value);
                            var interceptor = function(value) {
                                var result = lodashFunc.apply(lodash, arrayPush([ value ], args));
                                return isTaker && chainAll ? result[0] : result;
                            };
                            if (useLazy && checkIteratee && "function" == typeof iteratee && 1 != iteratee.length) isLazy = useLazy = false;
                            var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
                            if (!retUnwrapped && useLazy) {
                                value = onlyLazy ? value : new LazyWrapper(this);
                                var result = func.apply(value, args);
                                result.__actions__.push({
                                    func: thru,
                                    args: [ interceptor ],
                                    thisArg: undefined
                                });
                                return new LodashWrapper(result, chainAll);
                            }
                            if (isUnwrapped && onlyLazy) return func.apply(this, args);
                            result = this.thru(interceptor);
                            return isUnwrapped ? isTaker ? result.value()[0] : result.value() : result;
                        };
                    }));
                    arrayEach([ "pop", "push", "shift", "sort", "splice", "unshift" ], (function(methodName) {
                        var func = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
                        lodash.prototype[methodName] = function() {
                            var args = arguments;
                            if (retUnwrapped && !this.__chain__) {
                                var value = this.value();
                                return func.apply(isArray(value) ? value : [], args);
                            }
                            return this[chainName]((function(value) {
                                return func.apply(isArray(value) ? value : [], args);
                            }));
                        };
                    }));
                    baseForOwn(LazyWrapper.prototype, (function(func, methodName) {
                        var lodashFunc = lodash[methodName];
                        if (lodashFunc) {
                            var key = lodashFunc.name + "";
                            if (!hasOwnProperty.call(realNames, key)) realNames[key] = [];
                            realNames[key].push({
                                name: methodName,
                                func: lodashFunc
                            });
                        }
                    }));
                    realNames[createHybrid(undefined, WRAP_BIND_KEY_FLAG).name] = [ {
                        name: "wrapper",
                        func: undefined
                    } ];
                    LazyWrapper.prototype.clone = lazyClone;
                    LazyWrapper.prototype.reverse = lazyReverse;
                    LazyWrapper.prototype.value = lazyValue;
                    lodash.prototype.at = wrapperAt;
                    lodash.prototype.chain = wrapperChain;
                    lodash.prototype.commit = wrapperCommit;
                    lodash.prototype.next = wrapperNext;
                    lodash.prototype.plant = wrapperPlant;
                    lodash.prototype.reverse = wrapperReverse;
                    lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
                    lodash.prototype.first = lodash.prototype.head;
                    if (symIterator) lodash.prototype[symIterator] = wrapperToIterator;
                    return lodash;
                };
                var _ = runInContext();
                if (true) {
                    root._ = _;
                    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
                        return _;
                    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
                }
            }).call(this);
        },
        563: (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";
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
            "use strict";
            module.exports = (string, separator) => {
                if (!("string" === typeof string && "string" === typeof separator)) throw new TypeError("Expected the arguments to be of type `string`");
                if ("" === separator) return [ string ];
                const separatorIndex = string.indexOf(separator);
                if (-1 === separatorIndex) return [ string ];
                return [ string.slice(0, separatorIndex), string.slice(separatorIndex + separator.length) ];
            };
        },
        610: module => {
            "use strict";
            module.exports = str => encodeURIComponent(str).replace(/[!'()*]/g, (x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`));
        }
    };
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (void 0 !== cachedModule) return cachedModule.exports;
        var module = __webpack_module_cache__[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.loaded = true;
        return module.exports;
    }
    (() => {
        __webpack_require__.d = (exports, definition) => {
            for (var key in definition) if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
                enumerable: true,
                get: definition[key]
            });
        };
    })();
    (() => {
        __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
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
    (() => {
        __webpack_require__.nmd = module => {
            module.paths = [];
            if (!module.children) module.children = [];
            return module;
        };
    })();
    var __webpack_exports__ = {};
    (() => {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, {
            main: () => main
        });
        const {SystemNotificationSource, Notification} = imports.ui.messageTray;
        const {messageTray} = imports.ui.main;
        let iconFactory;
        const messageSource = new SystemNotificationSource(__meta.name);
        messageTray.add(messageSource);
        function initNotificationFactory(args) {
            const {iconFactory: passedIconFactory} = args;
            iconFactory = passedIconFactory;
        }
        function notify(args) {
            const {notificationText, transient = true} = args;
            if (!iconFactory) global.logError("initNotificatoinManager must be called first!");
            const notification = new Notification(messageSource, __meta.name, notificationText, {
                icon: iconFactory(),
                bodyMarkup: true
            });
            notification.setTransient(transient);
            messageSource.notify(notification);
        }
        function n(n) {
            for (var r = arguments.length, t = Array(r > 1 ? r - 1 : 0), e = 1; e < r; e++) t[e - 1] = arguments[e];
            if (false) ;
            throw Error("[Immer] minified error nr: " + n + (t.length ? " " + t.map((function(n) {
                return "'" + n + "'";
            })).join(",") : "") + ". Find the full error at: https://bit.ly/3cXEKWf");
        }
        function r(n) {
            return !!n && !!n[Q];
        }
        function t(n) {
            var r;
            return !!n && (function(n) {
                if (!n || "object" != typeof n) return !1;
                var r = Object.getPrototypeOf(n);
                if (null === r) return !0;
                var t = Object.hasOwnProperty.call(r, "constructor") && r.constructor;
                return t === Object || "function" == typeof t && Function.toString.call(t) === Z;
            }(n) || Array.isArray(n) || !!n[L] || !!(null === (r = n.constructor) || void 0 === r ? void 0 : r[L]) || s(n) || v(n));
        }
        function i(n, r, t) {
            void 0 === t && (t = !1), 0 === o(n) ? (t ? Object.keys : nn)(n).forEach((function(e) {
                t && "symbol" == typeof e || r(e, n[e], n);
            })) : n.forEach((function(t, e) {
                return r(e, t, n);
            }));
        }
        function o(n) {
            var r = n[Q];
            return r ? r.i > 3 ? r.i - 4 : r.i : Array.isArray(n) ? 1 : s(n) ? 2 : v(n) ? 3 : 0;
        }
        function u(n, r) {
            return 2 === o(n) ? n.has(r) : Object.prototype.hasOwnProperty.call(n, r);
        }
        function a(n, r) {
            return 2 === o(n) ? n.get(r) : n[r];
        }
        function f(n, r, t) {
            var e = o(n);
            2 === e ? n.set(r, t) : 3 === e ? (n.delete(r), n.add(t)) : n[r] = t;
        }
        function c(n, r) {
            return n === r ? 0 !== n || 1 / n == 1 / r : n != n && r != r;
        }
        function s(n) {
            return X && n instanceof Map;
        }
        function v(n) {
            return q && n instanceof Set;
        }
        function p(n) {
            return n.o || n.t;
        }
        function l(n) {
            if (Array.isArray(n)) return Array.prototype.slice.call(n);
            var r = rn(n);
            delete r[Q];
            for (var t = nn(r), e = 0; e < t.length; e++) {
                var i = t[e], o = r[i];
                !1 === o.writable && (o.writable = !0, o.configurable = !0), (o.get || o.set) && (r[i] = {
                    configurable: !0,
                    writable: !0,
                    enumerable: o.enumerable,
                    value: n[i]
                });
            }
            return Object.create(Object.getPrototypeOf(n), r);
        }
        function d(n, e) {
            return void 0 === e && (e = !1), y(n) || r(n) || !t(n) ? n : (o(n) > 1 && (n.set = n.add = n.clear = n.delete = h), 
            Object.freeze(n), e && i(n, (function(n, r) {
                return d(r, !0);
            }), !0), n);
        }
        function h() {
            n(2);
        }
        function y(n) {
            return null == n || "object" != typeof n || Object.isFrozen(n);
        }
        function b(r) {
            var t = tn[r];
            return t || n(18, r), t;
        }
        function m(n, r) {
            tn[n] || (tn[n] = r);
        }
        function _() {
            return true || 0, U;
        }
        function j(n, r) {
            r && (b("Patches"), n.u = [], n.s = [], n.v = r);
        }
        function O(n) {
            g(n), n.p.forEach(S), n.p = null;
        }
        function g(n) {
            n === U && (U = n.l);
        }
        function w(n) {
            return U = {
                p: [],
                l: U,
                h: n,
                m: !0,
                _: 0
            };
        }
        function S(n) {
            var r = n[Q];
            0 === r.i || 1 === r.i ? r.j() : r.O = !0;
        }
        function P(r, e) {
            e._ = e.p.length;
            var i = e.p[0], o = void 0 !== r && r !== i;
            return e.h.g || b("ES5").S(e, r, o), o ? (i[Q].P && (O(e), n(4)), t(r) && (r = M(e, r), 
            e.l || x(e, r)), e.u && b("Patches").M(i[Q].t, r, e.u, e.s)) : r = M(e, i, []), 
            O(e), e.u && e.v(e.u, e.s), r !== H ? r : void 0;
        }
        function M(n, r, t) {
            if (y(r)) return r;
            var e = r[Q];
            if (!e) return i(r, (function(i, o) {
                return A(n, e, r, i, o, t);
            }), !0), r;
            if (e.A !== n) return r;
            if (!e.P) return x(n, e.t, !0), e.t;
            if (!e.I) {
                e.I = !0, e.A._--;
                var o = 4 === e.i || 5 === e.i ? e.o = l(e.k) : e.o;
                i(3 === e.i ? new Set(o) : o, (function(r, i) {
                    return A(n, e, o, r, i, t);
                })), x(n, o, !1), t && n.u && b("Patches").R(e, t, n.u, n.s);
            }
            return e.o;
        }
        function A(e, i, o, a, c, s) {
            if (false && 0, r(c)) {
                var v = M(e, c, s && i && 3 !== i.i && !u(i.D, a) ? s.concat(a) : void 0);
                if (f(o, a, v), !r(v)) return;
                e.m = !1;
            }
            if (t(c) && !y(c)) {
                if (!e.h.F && e._ < 1) return;
                M(e, c), i && i.A.l || x(e, c);
            }
        }
        function x(n, r, t) {
            void 0 === t && (t = !1), n.h.F && n.m && d(r, t);
        }
        function z(n, r) {
            var t = n[Q];
            return (t ? p(t) : n)[r];
        }
        function I(n, r) {
            if (r in n) for (var t = Object.getPrototypeOf(n); t; ) {
                var e = Object.getOwnPropertyDescriptor(t, r);
                if (e) return e;
                t = Object.getPrototypeOf(t);
            }
        }
        function k(n) {
            n.P || (n.P = !0, n.l && k(n.l));
        }
        function E(n) {
            n.o || (n.o = l(n.t));
        }
        function R(n, r, t) {
            var e = s(r) ? b("MapSet").N(r, t) : v(r) ? b("MapSet").T(r, t) : n.g ? function(n, r) {
                var t = Array.isArray(n), e = {
                    i: t ? 1 : 0,
                    A: r ? r.A : _(),
                    P: !1,
                    I: !1,
                    D: {},
                    l: r,
                    t: n,
                    k: null,
                    o: null,
                    j: null,
                    C: !1
                }, i = e, o = en;
                t && (i = [ e ], o = on);
                var u = Proxy.revocable(i, o), a = u.revoke, f = u.proxy;
                return e.k = f, e.j = a, f;
            }(r, t) : b("ES5").J(r, t);
            return (t ? t.A : _()).p.push(e), e;
        }
        function D(e) {
            return r(e) || n(22, e), function n(r) {
                if (!t(r)) return r;
                var e, u = r[Q], c = o(r);
                if (u) {
                    if (!u.P && (u.i < 4 || !b("ES5").K(u))) return u.t;
                    u.I = !0, e = F(r, c), u.I = !1;
                } else e = F(r, c);
                return i(e, (function(r, t) {
                    u && a(u.t, r) === t || f(e, r, n(t));
                })), 3 === c ? new Set(e) : e;
            }(e);
        }
        function F(n, r) {
            switch (r) {
              case 2:
                return new Map(n);

              case 3:
                return Array.from(n);
            }
            return l(n);
        }
        function N() {
            function t(n, r) {
                var t = s[n];
                return t ? t.enumerable = r : s[n] = t = {
                    configurable: !0,
                    enumerable: r,
                    get: function() {
                        var r = this[Q];
                        return false && 0, en.get(r, n);
                    },
                    set: function(r) {
                        var t = this[Q];
                        false && 0, en.set(t, n, r);
                    }
                }, t;
            }
            function e(n) {
                for (var r = n.length - 1; r >= 0; r--) {
                    var t = n[r][Q];
                    if (!t.P) switch (t.i) {
                      case 5:
                        a(t) && k(t);
                        break;

                      case 4:
                        o(t) && k(t);
                    }
                }
            }
            function o(n) {
                for (var r = n.t, t = n.k, e = nn(t), i = e.length - 1; i >= 0; i--) {
                    var o = e[i];
                    if (o !== Q) {
                        var a = r[o];
                        if (void 0 === a && !u(r, o)) return !0;
                        var f = t[o], s = f && f[Q];
                        if (s ? s.t !== a : !c(f, a)) return !0;
                    }
                }
                var v = !!r[Q];
                return e.length !== nn(r).length + (v ? 0 : 1);
            }
            function a(n) {
                var r = n.k;
                if (r.length !== n.t.length) return !0;
                var t = Object.getOwnPropertyDescriptor(r, r.length - 1);
                if (t && !t.get) return !0;
                for (var e = 0; e < r.length; e++) if (!r.hasOwnProperty(e)) return !0;
                return !1;
            }
            var s = {};
            m("ES5", {
                J: function(n, r) {
                    var e = Array.isArray(n), i = function(n, r) {
                        if (n) {
                            for (var e = Array(r.length), i = 0; i < r.length; i++) Object.defineProperty(e, "" + i, t(i, !0));
                            return e;
                        }
                        var o = rn(r);
                        delete o[Q];
                        for (var u = nn(o), a = 0; a < u.length; a++) {
                            var f = u[a];
                            o[f] = t(f, n || !!o[f].enumerable);
                        }
                        return Object.create(Object.getPrototypeOf(r), o);
                    }(e, n), o = {
                        i: e ? 5 : 4,
                        A: r ? r.A : _(),
                        P: !1,
                        I: !1,
                        D: {},
                        l: r,
                        t: n,
                        k: i,
                        o: null,
                        O: !1,
                        C: !1
                    };
                    return Object.defineProperty(i, Q, {
                        value: o,
                        writable: !0
                    }), i;
                },
                S: function(n, t, o) {
                    o ? r(t) && t[Q].A === n && e(n.p) : (n.u && function n(r) {
                        if (r && "object" == typeof r) {
                            var t = r[Q];
                            if (t) {
                                var e = t.t, o = t.k, f = t.D, c = t.i;
                                if (4 === c) i(o, (function(r) {
                                    r !== Q && (void 0 !== e[r] || u(e, r) ? f[r] || n(o[r]) : (f[r] = !0, k(t)));
                                })), i(e, (function(n) {
                                    void 0 !== o[n] || u(o, n) || (f[n] = !1, k(t));
                                })); else if (5 === c) {
                                    if (a(t) && (k(t), f.length = !0), o.length < e.length) for (var s = o.length; s < e.length; s++) f[s] = !1; else for (var v = e.length; v < o.length; v++) f[v] = !0;
                                    for (var p = Math.min(o.length, e.length), l = 0; l < p; l++) o.hasOwnProperty(l) || (f[l] = !0), 
                                    void 0 === f[l] && n(o[l]);
                                }
                            }
                        }
                    }(n.p[0]), e(n.p));
                },
                K: function(n) {
                    return 4 === n.i ? o(n) : a(n);
                }
            });
        }
        var G, U, W = "undefined" != typeof Symbol && "symbol" == typeof Symbol("x"), X = "undefined" != typeof Map, q = "undefined" != typeof Set, B = "undefined" != typeof Proxy && void 0 !== Proxy.revocable && "undefined" != typeof Reflect, H = W ? Symbol.for("immer-nothing") : ((G = {})["immer-nothing"] = !0, 
        G), L = W ? Symbol.for("immer-draftable") : "__$immer_draftable", Q = W ? Symbol.for("immer-state") : "__$immer_state", Z = ("undefined" != typeof Symbol && Symbol.iterator, 
        "" + Object.prototype.constructor), nn = "undefined" != typeof Reflect && Reflect.ownKeys ? Reflect.ownKeys : void 0 !== Object.getOwnPropertySymbols ? function(n) {
            return Object.getOwnPropertyNames(n).concat(Object.getOwnPropertySymbols(n));
        } : Object.getOwnPropertyNames, rn = Object.getOwnPropertyDescriptors || function(n) {
            var r = {};
            return nn(n).forEach((function(t) {
                r[t] = Object.getOwnPropertyDescriptor(n, t);
            })), r;
        }, tn = {}, en = {
            get: function(n, r) {
                if (r === Q) return n;
                var e = p(n);
                if (!u(e, r)) return function(n, r, t) {
                    var e, i = I(r, t);
                    return i ? "value" in i ? i.value : null === (e = i.get) || void 0 === e ? void 0 : e.call(n.k) : void 0;
                }(n, e, r);
                var i = e[r];
                return n.I || !t(i) ? i : i === z(n.t, r) ? (E(n), n.o[r] = R(n.A.h, i, n)) : i;
            },
            has: function(n, r) {
                return r in p(n);
            },
            ownKeys: function(n) {
                return Reflect.ownKeys(p(n));
            },
            set: function(n, r, t) {
                var e = I(p(n), r);
                if (null == e ? void 0 : e.set) return e.set.call(n.k, t), !0;
                if (!n.P) {
                    var i = z(p(n), r), o = null == i ? void 0 : i[Q];
                    if (o && o.t === t) return n.o[r] = t, n.D[r] = !1, !0;
                    if (c(t, i) && (void 0 !== t || u(n.t, r))) return !0;
                    E(n), k(n);
                }
                return n.o[r] === t && "number" != typeof t && (void 0 !== t || r in n.o) || (n.o[r] = t, 
                n.D[r] = !0, !0);
            },
            deleteProperty: function(n, r) {
                return void 0 !== z(n.t, r) || r in n.t ? (n.D[r] = !1, E(n), k(n)) : delete n.D[r], 
                n.o && delete n.o[r], !0;
            },
            getOwnPropertyDescriptor: function(n, r) {
                var t = p(n), e = Reflect.getOwnPropertyDescriptor(t, r);
                return e ? {
                    writable: !0,
                    configurable: 1 !== n.i || "length" !== r,
                    enumerable: e.enumerable,
                    value: t[r]
                } : e;
            },
            defineProperty: function() {
                n(11);
            },
            getPrototypeOf: function(n) {
                return Object.getPrototypeOf(n.t);
            },
            setPrototypeOf: function() {
                n(12);
            }
        }, on = {};
        i(en, (function(n, r) {
            on[n] = function() {
                return arguments[0] = arguments[0][0], r.apply(this, arguments);
            };
        })), on.deleteProperty = function(r, t) {
            return false && 0, on.set.call(this, r, t, void 0);
        }, on.set = function(r, t, e) {
            return false && 0, en.set.call(this, r[0], t, e, r[0]);
        };
        var un = function() {
            function e(r) {
                var e = this;
                this.g = B, this.F = !0, this.produce = function(r, i, o) {
                    if ("function" == typeof r && "function" != typeof i) {
                        var u = i;
                        i = r;
                        var a = e;
                        return function(n) {
                            var r = this;
                            void 0 === n && (n = u);
                            for (var t = arguments.length, e = Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++) e[o - 1] = arguments[o];
                            return a.produce(n, (function(n) {
                                var t;
                                return (t = i).call.apply(t, [ r, n ].concat(e));
                            }));
                        };
                    }
                    var f;
                    if ("function" != typeof i && n(6), void 0 !== o && "function" != typeof o && n(7), 
                    t(r)) {
                        var c = w(e), s = R(e, r, void 0), v = !0;
                        try {
                            f = i(s), v = !1;
                        } finally {
                            v ? O(c) : g(c);
                        }
                        return "undefined" != typeof Promise && f instanceof Promise ? f.then((function(n) {
                            return j(c, o), P(n, c);
                        }), (function(n) {
                            throw O(c), n;
                        })) : (j(c, o), P(f, c));
                    }
                    if (!r || "object" != typeof r) {
                        if (void 0 === (f = i(r)) && (f = r), f === H && (f = void 0), e.F && d(f, !0), 
                        o) {
                            var p = [], l = [];
                            b("Patches").M(r, f, p, l), o(p, l);
                        }
                        return f;
                    }
                    n(21, r);
                }, this.produceWithPatches = function(n, r) {
                    if ("function" == typeof n) return function(r) {
                        for (var t = arguments.length, i = Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++) i[o - 1] = arguments[o];
                        return e.produceWithPatches(r, (function(r) {
                            return n.apply(void 0, [ r ].concat(i));
                        }));
                    };
                    var t, i, o = e.produce(n, r, (function(n, r) {
                        t = n, i = r;
                    }));
                    return "undefined" != typeof Promise && o instanceof Promise ? o.then((function(n) {
                        return [ n, t, i ];
                    })) : [ o, t, i ];
                }, "boolean" == typeof (null == r ? void 0 : r.useProxies) && this.setUseProxies(r.useProxies), 
                "boolean" == typeof (null == r ? void 0 : r.autoFreeze) && this.setAutoFreeze(r.autoFreeze);
            }
            var i = e.prototype;
            return i.createDraft = function(e) {
                t(e) || n(8), r(e) && (e = D(e));
                var i = w(this), o = R(this, e, void 0);
                return o[Q].C = !0, g(i), o;
            }, i.finishDraft = function(r, t) {
                var e = r && r[Q];
                false && 0;
                var i = e.A;
                return j(i, t), P(void 0, i);
            }, i.setAutoFreeze = function(n) {
                this.F = n;
            }, i.setUseProxies = function(r) {
                r && !B && n(20), this.g = r;
            }, i.applyPatches = function(n, t) {
                var e;
                for (e = t.length - 1; e >= 0; e--) {
                    var i = t[e];
                    if (0 === i.path.length && "replace" === i.op) {
                        n = i.value;
                        break;
                    }
                }
                e > -1 && (t = t.slice(e + 1));
                var o = b("Patches").$;
                return r(n) ? o(n, t) : this.produce(n, (function(n) {
                    return o(n, t);
                }));
            }, e;
        }(), an = new un, fn = an.produce;
        an.produceWithPatches.bind(an), an.setAutoFreeze.bind(an), an.setUseProxies.bind(an), 
        an.applyPatches.bind(an), an.createDraft.bind(an), an.finishDraft.bind(an);
        const immer_esm = fn;
        function _defineProperty(obj, key, value) {
            if (key in obj) Object.defineProperty(obj, key, {
                value,
                enumerable: true,
                configurable: true,
                writable: true
            }); else obj[key] = value;
            return obj;
        }
        function ownKeys(object, enumerableOnly) {
            var keys = Object.keys(object);
            if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                enumerableOnly && (symbols = symbols.filter((function(sym) {
                    return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                }))), keys.push.apply(keys, symbols);
            }
            return keys;
        }
        function _objectSpread2(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = null != arguments[i] ? arguments[i] : {};
                i % 2 ? ownKeys(Object(source), !0).forEach((function(key) {
                    _defineProperty(target, key, source[key]);
                })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach((function(key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                }));
            }
            return target;
        }
        function formatProdErrorMessage(code) {
            return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or " + "use the non-minified dev environment for full errors. ";
        }
        var $$observable = function() {
            return "function" === typeof Symbol && Symbol.observable || "@@observable";
        }();
        var randomString = function() {
            return Math.random().toString(36).substring(7).split("").join(".");
        };
        var ActionTypes = {
            INIT: "@@redux/INIT" + randomString(),
            REPLACE: "@@redux/REPLACE" + randomString(),
            PROBE_UNKNOWN_ACTION: function() {
                return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
            }
        };
        function isPlainObject(obj) {
            if ("object" !== typeof obj || null === obj) return false;
            var proto = obj;
            while (null !== Object.getPrototypeOf(proto)) proto = Object.getPrototypeOf(proto);
            return Object.getPrototypeOf(obj) === proto;
        }
        function createStore(reducer, preloadedState, enhancer) {
            var _ref2;
            if ("function" === typeof preloadedState && "function" === typeof enhancer || "function" === typeof enhancer && "function" === typeof arguments[3]) throw new Error(true ? formatProdErrorMessage(0) : 0);
            if ("function" === typeof preloadedState && "undefined" === typeof enhancer) {
                enhancer = preloadedState;
                preloadedState = void 0;
            }
            if ("undefined" !== typeof enhancer) {
                if ("function" !== typeof enhancer) throw new Error(true ? formatProdErrorMessage(1) : 0);
                return enhancer(createStore)(reducer, preloadedState);
            }
            if ("function" !== typeof reducer) throw new Error(true ? formatProdErrorMessage(2) : 0);
            var currentReducer = reducer;
            var currentState = preloadedState;
            var currentListeners = [];
            var nextListeners = currentListeners;
            var isDispatching = false;
            function ensureCanMutateNextListeners() {
                if (nextListeners === currentListeners) nextListeners = currentListeners.slice();
            }
            function getState() {
                if (isDispatching) throw new Error(true ? formatProdErrorMessage(3) : 0);
                return currentState;
            }
            function subscribe(listener) {
                if ("function" !== typeof listener) throw new Error(true ? formatProdErrorMessage(4) : 0);
                if (isDispatching) throw new Error(true ? formatProdErrorMessage(5) : 0);
                var isSubscribed = true;
                ensureCanMutateNextListeners();
                nextListeners.push(listener);
                return function() {
                    if (!isSubscribed) return;
                    if (isDispatching) throw new Error(true ? formatProdErrorMessage(6) : 0);
                    isSubscribed = false;
                    ensureCanMutateNextListeners();
                    var index = nextListeners.indexOf(listener);
                    nextListeners.splice(index, 1);
                    currentListeners = null;
                };
            }
            function dispatch(action) {
                if (!isPlainObject(action)) throw new Error(true ? formatProdErrorMessage(7) : 0);
                if ("undefined" === typeof action.type) throw new Error(true ? formatProdErrorMessage(8) : 0);
                if (isDispatching) throw new Error(true ? formatProdErrorMessage(9) : 0);
                try {
                    isDispatching = true;
                    currentState = currentReducer(currentState, action);
                } finally {
                    isDispatching = false;
                }
                var listeners = currentListeners = nextListeners;
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    listener();
                }
                return action;
            }
            function replaceReducer(nextReducer) {
                if ("function" !== typeof nextReducer) throw new Error(true ? formatProdErrorMessage(10) : 0);
                currentReducer = nextReducer;
                dispatch({
                    type: ActionTypes.REPLACE
                });
            }
            function observable() {
                var _ref;
                var outerSubscribe = subscribe;
                return _ref = {
                    subscribe: function(observer) {
                        if ("object" !== typeof observer || null === observer) throw new Error(true ? formatProdErrorMessage(11) : 0);
                        function observeState() {
                            if (observer.next) observer.next(getState());
                        }
                        observeState();
                        var unsubscribe = outerSubscribe(observeState);
                        return {
                            unsubscribe
                        };
                    }
                }, _ref[$$observable] = function() {
                    return this;
                }, _ref;
            }
            dispatch({
                type: ActionTypes.INIT
            });
            return _ref2 = {
                dispatch,
                subscribe,
                getState,
                replaceReducer
            }, _ref2[$$observable] = observable, _ref2;
        }
        function assertReducerShape(reducers) {
            Object.keys(reducers).forEach((function(key) {
                var reducer = reducers[key];
                var initialState = reducer(void 0, {
                    type: ActionTypes.INIT
                });
                if ("undefined" === typeof initialState) throw new Error(true ? formatProdErrorMessage(12) : 0);
                if ("undefined" === typeof reducer(void 0, {
                    type: ActionTypes.PROBE_UNKNOWN_ACTION()
                })) throw new Error(true ? formatProdErrorMessage(13) : 0);
            }));
        }
        function combineReducers(reducers) {
            var reducerKeys = Object.keys(reducers);
            var finalReducers = {};
            for (var i = 0; i < reducerKeys.length; i++) {
                var key = reducerKeys[i];
                if (false) ;
                if ("function" === typeof reducers[key]) finalReducers[key] = reducers[key];
            }
            var finalReducerKeys = Object.keys(finalReducers);
            if (false) ;
            var shapeAssertionError;
            try {
                assertReducerShape(finalReducers);
            } catch (e) {
                shapeAssertionError = e;
            }
            return function(state, action) {
                if (void 0 === state) state = {};
                if (shapeAssertionError) throw shapeAssertionError;
                if (false) ;
                var hasChanged = false;
                var nextState = {};
                for (var _i = 0; _i < finalReducerKeys.length; _i++) {
                    var _key = finalReducerKeys[_i];
                    var reducer = finalReducers[_key];
                    var previousStateForKey = state[_key];
                    var nextStateForKey = reducer(previousStateForKey, action);
                    if ("undefined" === typeof nextStateForKey) {
                        action && action.type;
                        throw new Error(true ? formatProdErrorMessage(14) : 0);
                    }
                    nextState[_key] = nextStateForKey;
                    hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
                }
                hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
                return hasChanged ? nextState : state;
            };
        }
        function compose() {
            for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) funcs[_key] = arguments[_key];
            if (0 === funcs.length) return function(arg) {
                return arg;
            };
            if (1 === funcs.length) return funcs[0];
            return funcs.reduce((function(a, b) {
                return function() {
                    return a(b.apply(void 0, arguments));
                };
            }));
        }
        function applyMiddleware() {
            for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) middlewares[_key] = arguments[_key];
            return function(createStore) {
                return function() {
                    var store = createStore.apply(void 0, arguments);
                    var _dispatch = function() {
                        throw new Error(true ? formatProdErrorMessage(15) : 0);
                    };
                    var middlewareAPI = {
                        getState: store.getState,
                        dispatch: function() {
                            return _dispatch.apply(void 0, arguments);
                        }
                    };
                    var chain = middlewares.map((function(middleware) {
                        return middleware(middlewareAPI);
                    }));
                    _dispatch = compose.apply(void 0, chain)(store.dispatch);
                    return _objectSpread2(_objectSpread2({}, store), {}, {
                        dispatch: _dispatch
                    });
                };
            };
        }
        if (false) ;
        function createThunkMiddleware(extraArgument) {
            var middleware = function(_ref) {
                var dispatch = _ref.dispatch, getState = _ref.getState;
                return function(next) {
                    return function(action) {
                        if ("function" === typeof action) return action(dispatch, getState, extraArgument);
                        return next(action);
                    };
                };
            };
            return middleware;
        }
        var thunk = createThunkMiddleware();
        thunk.withExtraArgument = createThunkMiddleware;
        const es = thunk;
        var __extends = void 0 && (void 0).__extends || function() {
            var extendStatics = function(d, b) {
                extendStatics = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(d, b) {
                    d.__proto__ = b;
                } || function(d, b) {
                    for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
                };
                return extendStatics(d, b);
            };
            return function(d, b) {
                if ("function" !== typeof b && null !== b) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
                extendStatics(d, b);
                function __() {
                    this.constructor = d;
                }
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __);
            };
        }();
        var __generator = void 0 && (void 0).__generator || function(thisArg, body) {
            var f, y, t, g, _ = {
                label: 0,
                sent: function() {
                    if (1 & t[0]) throw t[1];
                    return t[1];
                },
                trys: [],
                ops: []
            };
            return g = {
                next: verb(0),
                throw: verb(1),
                return: verb(2)
            }, "function" === typeof Symbol && (g[Symbol.iterator] = function() {
                return this;
            }), g;
            function verb(n) {
                return function(v) {
                    return step([ n, v ]);
                };
            }
            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = 2 & op[0] ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 
                    0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [ 2 & op[0], t.value ];
                    switch (op[0]) {
                      case 0:
                      case 1:
                        t = op;
                        break;

                      case 4:
                        _.label++;
                        return {
                            value: op[1],
                            done: false
                        };

                      case 5:
                        _.label++;
                        y = op[1];
                        op = [ 0 ];
                        continue;

                      case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;

                      default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (6 === op[0] || 2 === op[0])) {
                            _ = 0;
                            continue;
                        }
                        if (3 === op[0] && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];
                            break;
                        }
                        if (6 === op[0] && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();
                        continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [ 6, e ];
                    y = 0;
                } finally {
                    f = t = 0;
                }
                if (5 & op[0]) throw op[1];
                return {
                    value: op[0] ? op[1] : void 0,
                    done: true
                };
            }
        };
        var __spreadArray = void 0 && (void 0).__spreadArray || function(to, from) {
            for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) to[j] = from[i];
            return to;
        };
        var __defProp = Object.defineProperty;
        var __defProps = Object.defineProperties;
        var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
        var __getOwnPropSymbols = Object.getOwnPropertySymbols;
        var __hasOwnProp = Object.prototype.hasOwnProperty;
        var __propIsEnum = Object.prototype.propertyIsEnumerable;
        var __defNormalProp = function(obj, key, value) {
            return key in obj ? __defProp(obj, key, {
                enumerable: true,
                configurable: true,
                writable: true,
                value
            }) : obj[key] = value;
        };
        var __spreadValues = function(a, b) {
            for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
            if (__getOwnPropSymbols) for (var _i = 0, _c = __getOwnPropSymbols(b); _i < _c.length; _i++) {
                prop = _c[_i];
                if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
            }
            return a;
        };
        var __spreadProps = function(a, b) {
            return __defProps(a, __getOwnPropDescs(b));
        };
        var __async = function(__this, __arguments, generator) {
            return new Promise((function(resolve, reject) {
                var fulfilled = function(value) {
                    try {
                        step(generator.next(value));
                    } catch (e) {
                        reject(e);
                    }
                };
                var rejected = function(value) {
                    try {
                        step(generator.throw(value));
                    } catch (e) {
                        reject(e);
                    }
                };
                var step = function(x) {
                    return x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
                };
                step((generator = generator.apply(__this, __arguments)).next());
            }));
        };
        var composeWithDevTools = "undefined" !== typeof window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
            if (0 === arguments.length) return;
            if ("object" === typeof arguments[0]) return compose;
            return compose.apply(null, arguments);
        };
        "undefined" !== typeof window && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__;
        function redux_toolkit_esm_isPlainObject(value) {
            if ("object" !== typeof value || null === value) return false;
            var proto = Object.getPrototypeOf(value);
            if (null === proto) return true;
            var baseProto = proto;
            while (null !== Object.getPrototypeOf(baseProto)) baseProto = Object.getPrototypeOf(baseProto);
            return proto === baseProto;
        }
        var MiddlewareArray = function(_super) {
            __extends(MiddlewareArray, _super);
            function MiddlewareArray() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
                var _this = _super.apply(this, args) || this;
                Object.setPrototypeOf(_this, MiddlewareArray.prototype);
                return _this;
            }
            Object.defineProperty(MiddlewareArray, Symbol.species, {
                get: function() {
                    return MiddlewareArray;
                },
                enumerable: false,
                configurable: true
            });
            MiddlewareArray.prototype.concat = function() {
                var arr = [];
                for (var _i = 0; _i < arguments.length; _i++) arr[_i] = arguments[_i];
                return _super.prototype.concat.apply(this, arr);
            };
            MiddlewareArray.prototype.prepend = function() {
                var arr = [];
                for (var _i = 0; _i < arguments.length; _i++) arr[_i] = arguments[_i];
                if (1 === arr.length && Array.isArray(arr[0])) return new (MiddlewareArray.bind.apply(MiddlewareArray, __spreadArray([ void 0 ], arr[0].concat(this))));
                return new (MiddlewareArray.bind.apply(MiddlewareArray, __spreadArray([ void 0 ], arr.concat(this))));
            };
            return MiddlewareArray;
        }(Array);
        function freezeDraftable(val) {
            return t(val) ? immer_esm(val, (function() {})) : val;
        }
        function isBoolean(x) {
            return "boolean" === typeof x;
        }
        function curryGetDefaultMiddleware() {
            return function(options) {
                return getDefaultMiddleware(options);
            };
        }
        function getDefaultMiddleware(options) {
            if (void 0 === options) options = {};
            var _c = options.thunk, thunk = void 0 === _c ? true : _c;
            options.immutableCheck, options.serializableCheck;
            var middlewareArray = new MiddlewareArray;
            if (thunk) if (isBoolean(thunk)) middlewareArray.push(es); else middlewareArray.push(es.withExtraArgument(thunk.extraArgument));
            if (false) ;
            return middlewareArray;
        }
        var IS_PRODUCTION = "production" === "production";
        function configureStore(options) {
            var curriedGetDefaultMiddleware = curryGetDefaultMiddleware();
            var _c = options || {}, _d = _c.reducer, reducer = void 0 === _d ? void 0 : _d, _e = _c.middleware, middleware = void 0 === _e ? curriedGetDefaultMiddleware() : _e, _f = _c.devTools, devTools = void 0 === _f ? true : _f, _g = _c.preloadedState, preloadedState = void 0 === _g ? void 0 : _g, _h = _c.enhancers, enhancers = void 0 === _h ? void 0 : _h;
            var rootReducer;
            if ("function" === typeof reducer) rootReducer = reducer; else if (redux_toolkit_esm_isPlainObject(reducer)) rootReducer = combineReducers(reducer); else throw new Error('"reducer" is a required argument, and must be a function or an object of functions that can be passed to combineReducers');
            var finalMiddleware = middleware;
            if ("function" === typeof finalMiddleware) {
                finalMiddleware = finalMiddleware(curriedGetDefaultMiddleware);
                if (!IS_PRODUCTION && !Array.isArray(finalMiddleware)) throw new Error("when using a middleware builder function, an array of middleware must be returned");
            }
            if (!IS_PRODUCTION && finalMiddleware.some((function(item) {
                return "function" !== typeof item;
            }))) throw new Error("each middleware provided to configureStore must be a function");
            var middlewareEnhancer = applyMiddleware.apply(void 0, finalMiddleware);
            var finalCompose = compose;
            if (devTools) finalCompose = composeWithDevTools(__spreadValues({
                trace: !IS_PRODUCTION
            }, "object" === typeof devTools && devTools));
            var storeEnhancers = [ middlewareEnhancer ];
            if (Array.isArray(enhancers)) storeEnhancers = __spreadArray([ middlewareEnhancer ], enhancers); else if ("function" === typeof enhancers) storeEnhancers = enhancers(storeEnhancers);
            var composedEnhancer = finalCompose.apply(void 0, storeEnhancers);
            return createStore(rootReducer, preloadedState, composedEnhancer);
        }
        function createAction(type, prepareAction) {
            function actionCreator() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
                if (prepareAction) {
                    var prepared = prepareAction.apply(void 0, args);
                    if (!prepared) throw new Error("prepareAction did not return an object");
                    return __spreadValues(__spreadValues({
                        type,
                        payload: prepared.payload
                    }, "meta" in prepared && {
                        meta: prepared.meta
                    }), "error" in prepared && {
                        error: prepared.error
                    });
                }
                return {
                    type,
                    payload: args[0]
                };
            }
            actionCreator.toString = function() {
                return "" + type;
            };
            actionCreator.type = type;
            actionCreator.match = function(action) {
                return action.type === type;
            };
            return actionCreator;
        }
        function executeReducerBuilderCallback(builderCallback) {
            var actionsMap = {};
            var actionMatchers = [];
            var defaultCaseReducer;
            var builder = {
                addCase: function(typeOrActionCreator, reducer) {
                    if (false) ;
                    var type = "string" === typeof typeOrActionCreator ? typeOrActionCreator : typeOrActionCreator.type;
                    if (type in actionsMap) throw new Error("addCase cannot be called with two reducers for the same action type");
                    actionsMap[type] = reducer;
                    return builder;
                },
                addMatcher: function(matcher, reducer) {
                    if (false) ;
                    actionMatchers.push({
                        matcher,
                        reducer
                    });
                    return builder;
                },
                addDefaultCase: function(reducer) {
                    if (false) ;
                    defaultCaseReducer = reducer;
                    return builder;
                }
            };
            builderCallback(builder);
            return [ actionsMap, actionMatchers, defaultCaseReducer ];
        }
        function isStateFunction(x) {
            return "function" === typeof x;
        }
        function createReducer(initialState, mapOrBuilderCallback, actionMatchers, defaultCaseReducer) {
            if (void 0 === actionMatchers) actionMatchers = [];
            if (false) ;
            var _c = "function" === typeof mapOrBuilderCallback ? executeReducerBuilderCallback(mapOrBuilderCallback) : [ mapOrBuilderCallback, actionMatchers, defaultCaseReducer ], actionsMap = _c[0], finalActionMatchers = _c[1], finalDefaultCaseReducer = _c[2];
            var getInitialState;
            if (isStateFunction(initialState)) getInitialState = function() {
                return freezeDraftable(initialState());
            }; else {
                var frozenInitialState_1 = freezeDraftable(initialState);
                getInitialState = function() {
                    return frozenInitialState_1;
                };
            }
            function reducer(state, action) {
                if (void 0 === state) state = getInitialState();
                var caseReducers = __spreadArray([ actionsMap[action.type] ], finalActionMatchers.filter((function(_c) {
                    var matcher = _c.matcher;
                    return matcher(action);
                })).map((function(_c) {
                    var reducer2 = _c.reducer;
                    return reducer2;
                })));
                if (0 === caseReducers.filter((function(cr) {
                    return !!cr;
                })).length) caseReducers = [ finalDefaultCaseReducer ];
                return caseReducers.reduce((function(previousState, caseReducer) {
                    if (caseReducer) if (r(previousState)) {
                        var draft = previousState;
                        var result = caseReducer(draft, action);
                        if (void 0 === result) return previousState;
                        return result;
                    } else if (!t(previousState)) {
                        result = caseReducer(previousState, action);
                        if (void 0 === result) {
                            if (null === previousState) return previousState;
                            throw Error("A case reducer on a non-draftable value must not return undefined");
                        }
                        return result;
                    } else return immer_esm(previousState, (function(draft) {
                        return caseReducer(draft, action);
                    }));
                    return previousState;
                }), state);
            }
            reducer.getInitialState = getInitialState;
            return reducer;
        }
        function getType2(slice, actionKey) {
            return slice + "/" + actionKey;
        }
        function createSlice(options) {
            var name = options.name;
            if (!name) throw new Error("`name` is a required option for createSlice");
            if ("undefined" !== typeof process && "production" === "development") ;
            var initialState = "function" == typeof options.initialState ? options.initialState : freezeDraftable(options.initialState);
            var reducers = options.reducers || {};
            var reducerNames = Object.keys(reducers);
            var sliceCaseReducersByName = {};
            var sliceCaseReducersByType = {};
            var actionCreators = {};
            reducerNames.forEach((function(reducerName) {
                var maybeReducerWithPrepare = reducers[reducerName];
                var type = getType2(name, reducerName);
                var caseReducer;
                var prepareCallback;
                if ("reducer" in maybeReducerWithPrepare) {
                    caseReducer = maybeReducerWithPrepare.reducer;
                    prepareCallback = maybeReducerWithPrepare.prepare;
                } else caseReducer = maybeReducerWithPrepare;
                sliceCaseReducersByName[reducerName] = caseReducer;
                sliceCaseReducersByType[type] = caseReducer;
                actionCreators[reducerName] = prepareCallback ? createAction(type, prepareCallback) : createAction(type);
            }));
            function buildReducer() {
                if (false) ;
                var _c = "function" === typeof options.extraReducers ? executeReducerBuilderCallback(options.extraReducers) : [ options.extraReducers ], _d = _c[0], extraReducers = void 0 === _d ? {} : _d, _e = _c[1], actionMatchers = void 0 === _e ? [] : _e, _f = _c[2], defaultCaseReducer = void 0 === _f ? void 0 : _f;
                var finalCaseReducers = __spreadValues(__spreadValues({}, extraReducers), sliceCaseReducersByType);
                return createReducer(initialState, (function(builder) {
                    for (var key in finalCaseReducers) builder.addCase(key, finalCaseReducers[key]);
                    for (var _i = 0, actionMatchers_1 = actionMatchers; _i < actionMatchers_1.length; _i++) {
                        var m = actionMatchers_1[_i];
                        builder.addMatcher(m.matcher, m.reducer);
                    }
                    if (defaultCaseReducer) builder.addDefaultCase(defaultCaseReducer);
                }));
            }
            var _reducer;
            return {
                name,
                reducer: function(state, action) {
                    if (!_reducer) _reducer = buildReducer();
                    return _reducer(state, action);
                },
                actions: actionCreators,
                caseReducers: sliceCaseReducersByName,
                getInitialState: function() {
                    if (!_reducer) _reducer = buildReducer();
                    return _reducer.getInitialState();
                }
            };
        }
        var urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";
        var nanoid = function(size) {
            if (void 0 === size) size = 21;
            var id = "";
            var i = size;
            while (i--) id += urlAlphabet[64 * Math.random() | 0];
            return id;
        };
        var commonProperties = [ "name", "message", "stack", "code" ];
        var RejectWithValue = function() {
            function RejectWithValue(payload, meta) {
                this.payload = payload;
                this.meta = meta;
            }
            return RejectWithValue;
        }();
        var FulfillWithMeta = function() {
            function FulfillWithMeta(payload, meta) {
                this.payload = payload;
                this.meta = meta;
            }
            return FulfillWithMeta;
        }();
        var miniSerializeError = function(value) {
            if ("object" === typeof value && null !== value) {
                var simpleError = {};
                for (var _i = 0, commonProperties_1 = commonProperties; _i < commonProperties_1.length; _i++) {
                    var property = commonProperties_1[_i];
                    if ("string" === typeof value[property]) simpleError[property] = value[property];
                }
                return simpleError;
            }
            return {
                message: String(value)
            };
        };
        (function() {
            function createAsyncThunk2(typePrefix, payloadCreator, options) {
                var fulfilled = createAction(typePrefix + "/fulfilled", (function(payload, requestId, arg, meta) {
                    return {
                        payload,
                        meta: __spreadProps(__spreadValues({}, meta || {}), {
                            arg,
                            requestId,
                            requestStatus: "fulfilled"
                        })
                    };
                }));
                var pending = createAction(typePrefix + "/pending", (function(requestId, arg, meta) {
                    return {
                        payload: void 0,
                        meta: __spreadProps(__spreadValues({}, meta || {}), {
                            arg,
                            requestId,
                            requestStatus: "pending"
                        })
                    };
                }));
                var rejected = createAction(typePrefix + "/rejected", (function(error, requestId, arg, payload, meta) {
                    return {
                        payload,
                        error: (options && options.serializeError || miniSerializeError)(error || "Rejected"),
                        meta: __spreadProps(__spreadValues({}, meta || {}), {
                            arg,
                            requestId,
                            rejectedWithValue: !!payload,
                            requestStatus: "rejected",
                            aborted: "AbortError" === (null == error ? void 0 : error.name),
                            condition: "ConditionError" === (null == error ? void 0 : error.name)
                        })
                    };
                }));
                var AC = "undefined" !== typeof AbortController ? AbortController : function() {
                    function class_1() {
                        this.signal = {
                            aborted: false,
                            addEventListener: function() {},
                            dispatchEvent: function() {
                                return false;
                            },
                            onabort: function() {},
                            removeEventListener: function() {},
                            reason: void 0,
                            throwIfAborted: function() {}
                        };
                    }
                    class_1.prototype.abort = function() {
                        if (false) ;
                    };
                    return class_1;
                }();
                function actionCreator(arg) {
                    return function(dispatch, getState, extra) {
                        var requestId = (null == options ? void 0 : options.idGenerator) ? options.idGenerator(arg) : nanoid();
                        var abortController = new AC;
                        var abortReason;
                        var abortedPromise = new Promise((function(_, reject) {
                            return abortController.signal.addEventListener("abort", (function() {
                                return reject({
                                    name: "AbortError",
                                    message: abortReason || "Aborted"
                                });
                            }));
                        }));
                        var started = false;
                        function abort(reason) {
                            if (started) {
                                abortReason = reason;
                                abortController.abort();
                            }
                        }
                        var promise2 = function() {
                            return __async(this, null, (function() {
                                var _a, _b, finalAction, conditionResult, err_1, skipDispatch;
                                return __generator(this, (function(_c) {
                                    switch (_c.label) {
                                      case 0:
                                        _c.trys.push([ 0, 4, , 5 ]);
                                        conditionResult = null == (_a = null == options ? void 0 : options.condition) ? void 0 : _a.call(options, arg, {
                                            getState,
                                            extra
                                        });
                                        if (!isThenable(conditionResult)) return [ 3, 2 ];
                                        return [ 4, conditionResult ];

                                      case 1:
                                        conditionResult = _c.sent();
                                        _c.label = 2;

                                      case 2:
                                        if (false === conditionResult) throw {
                                            name: "ConditionError",
                                            message: "Aborted due to condition callback returning false."
                                        };
                                        started = true;
                                        dispatch(pending(requestId, arg, null == (_b = null == options ? void 0 : options.getPendingMeta) ? void 0 : _b.call(options, {
                                            requestId,
                                            arg
                                        }, {
                                            getState,
                                            extra
                                        })));
                                        return [ 4, Promise.race([ abortedPromise, Promise.resolve(payloadCreator(arg, {
                                            dispatch,
                                            getState,
                                            extra,
                                            requestId,
                                            signal: abortController.signal,
                                            abort,
                                            rejectWithValue: function(value, meta) {
                                                return new RejectWithValue(value, meta);
                                            },
                                            fulfillWithValue: function(value, meta) {
                                                return new FulfillWithMeta(value, meta);
                                            }
                                        })).then((function(result) {
                                            if (result instanceof RejectWithValue) throw result;
                                            if (result instanceof FulfillWithMeta) return fulfilled(result.payload, requestId, arg, result.meta);
                                            return fulfilled(result, requestId, arg);
                                        })) ]) ];

                                      case 3:
                                        finalAction = _c.sent();
                                        return [ 3, 5 ];

                                      case 4:
                                        err_1 = _c.sent();
                                        finalAction = err_1 instanceof RejectWithValue ? rejected(null, requestId, arg, err_1.payload, err_1.meta) : rejected(err_1, requestId, arg);
                                        return [ 3, 5 ];

                                      case 5:
                                        skipDispatch = options && !options.dispatchConditionRejection && rejected.match(finalAction) && finalAction.meta.condition;
                                        if (!skipDispatch) dispatch(finalAction);
                                        return [ 2, finalAction ];
                                    }
                                }));
                            }));
                        }();
                        return Object.assign(promise2, {
                            abort,
                            requestId,
                            arg,
                            unwrap: function() {
                                return promise2.then(unwrapResult);
                            }
                        });
                    };
                }
                return Object.assign(actionCreator, {
                    pending,
                    rejected,
                    fulfilled,
                    typePrefix
                });
            }
            createAsyncThunk2.withTypes = createAsyncThunk2;
        })();
        function unwrapResult(action) {
            if (action.meta && action.meta.rejectedWithValue) throw action.payload;
            if (action.error) throw action.error;
            return action.payload;
        }
        function isThenable(value) {
            return null !== value && "object" === typeof value && "function" === typeof value.then;
        }
        var task = "task";
        var cancelled = "cancelled";
        (function() {
            function TaskAbortError(code) {
                this.code = code;
                this.name = "TaskAbortError";
                this.message = task + " " + cancelled + " (reason: " + code + ")";
            }
        })();
        Object.assign;
        var alm = "listenerMiddleware";
        createAction(alm + "/add");
        createAction(alm + "/removeAll");
        createAction(alm + "/remove");
        var promise;
        "function" === typeof queueMicrotask && queueMicrotask.bind("undefined" !== typeof window ? window : global);
        N();
        const {get_home_dir} = imports.gi.GLib;
        const CONFIG_DIR = `${get_home_dir()}/.cinnamon/configs/${{
            uuid: "reminder@jonath92",
            path: "/home/jonathan/Projekte/cinnamon-spices-applets/reminder@jonath92/files/reminder@jonath92"
        }.uuid}`;
        const APPLET_PATH = {
            uuid: "reminder@jonath92",
            path: "/home/jonathan/Projekte/cinnamon-spices-applets/reminder@jonath92/files/reminder@jonath92"
        }.path;
        const APPLET_SHORT_NAME = {
            uuid: "reminder@jonath92",
            path: "/home/jonathan/Projekte/cinnamon-spices-applets/reminder@jonath92/files/reminder@jonath92"
        }.uuid.split("@")[0];
        const OFFICE365_CLIENT_ID = "253aba70-3393-40a9-92ce-1296905d25fa";
        const OFFICE365_CLIENT_SECRET = "sva7Q~VDZS4yNJJ_4X3VDE4Rsh4SzP1AUpP.p";
        const OFFICE365_TOKEN_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
        const OFFICE365_USER_ENDPOINT = "https://graph.microsoft.com/v1.0/me";
        const OFFICE365_CALENDAR_ENDPOINT = "https://graph.microsoft.com/v1.0/me/calendarview";
        const {new_for_path} = imports.gi.Gio.File;
        const SETTINGS_PATH = CONFIG_DIR + "/settings.json";
        imports.byteArray;
        const settingsFile = new_for_path(SETTINGS_PATH);
        const {FileCreateFlags, Cancellable, SubprocessFlags, Subprocess, IOErrorEnum, io_error_from_errno} = imports.gi.Gio;
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
                settingsFile.create(FileCreateFlags.REPLACE_DESTINATION, null);
            }
            try {
                settingsFile.replace_contents(JSON.stringify(settings, null, 3), null, false, FileCreateFlags.REPLACE_DESTINATION, null);
            } catch (error) {}
        }
        const settingsSlice = createSlice({
            name: "settings",
            initialState: loadSettingsFromFile(),
            reducers: {
                refreshTokenChanged(state, action) {
                    var _a;
                    const {mail, refreshToken} = action.payload;
                    state.accounts = null === (_a = state.accounts) || void 0 === _a ? void 0 : _a.map((acc => mail === acc.mail ? Object.assign(Object.assign({}, acc), {
                        refreshToken
                    }) : acc));
                    saveSettingsToFile(state);
                },
                settingsFileChanged(state, action) {
                    state = action.payload;
                    return state;
                }
            }
        });
        const {refreshTokenChanged, settingsFileChanged} = settingsSlice.actions;
        const slices_settingsSlice = settingsSlice.reducer;
        const initialState = [];
        const calendarEventSlice = createSlice({
            name: "calendarEvents",
            initialState,
            reducers: {
                eventsLoaded(state, action) {
                    const updatedEventsSorted = action.payload.sort(((a, b) => a.startUTC.diff(b.startUTC).milliseconds));
                    return [ ...updatedEventsSorted ];
                }
            }
        });
        const {eventsLoaded} = calendarEventSlice.actions;
        const CalendarEventsSlice = calendarEventSlice.reducer;
        var lodash = __webpack_require__(486);
        const store = configureStore({
            reducer: {
                settings: slices_settingsSlice,
                calendarEvents: CalendarEventsSlice
            }
        });
        function watchSelector(selectProp, cb, checkEquality = true) {
            let currentValue = selectProp();
            store.subscribe((() => {
                const newValue = selectProp();
                if (checkEquality && (0, lodash.isEqual)(currentValue, newValue)) return;
                cb(newValue, currentValue);
                currentValue = newValue;
            }));
            cb(currentValue);
        }
        function getState() {
            return store.getState();
        }
        const dispatch = store.dispatch;
        const selectEvents = () => getState().calendarEvents;
        var query_string = __webpack_require__(563);
        const {Message, SessionAsync, Session} = imports.gi.Soup;
        const {PRIORITY_DEFAULT} = imports.gi.GLib;
        const httpSession = new Session;
        function isHttpError(x) {
            return "string" === typeof x.reason_phrase;
        }
        const HttpHandler_ByteArray = imports.byteArray;
        function loadJsonAsync(args) {
            const {url, method = "GET", bodyParams, queryParams, headers} = args;
            const uri = queryParams ? `${url}?${(0, query_string.stringify)(queryParams)}` : url;
            const message = Message.new(method, uri);
            Object.entries(headers).forEach((([key, value]) => {
                message.request_headers.append(key, value);
            }));
            if (bodyParams) {
                const bodyParamsStringified = (0, query_string.stringify)(bodyParams);
                message.request_body.append(HttpHandler_ByteArray.fromString(bodyParamsStringified, "UTF-8"));
            }
            return new Promise(((resolve, reject) => {
                httpSession.send_and_read_async(message, PRIORITY_DEFAULT, null, ((session, result) => {
                    const res = httpSession.send_and_read_finish(result);
                    const responseBody = null != res ? HttpHandler_ByteArray.toString(HttpHandler_ByteArray.fromGBytes(res)) : null;
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
        const formats_n = "numeric", formats_s = "short", formats_l = "long";
        const DATE_SHORT = {
            year: formats_n,
            month: formats_n,
            day: formats_n
        };
        const DATE_MED = {
            year: formats_n,
            month: formats_s,
            day: formats_n
        };
        const DATE_MED_WITH_WEEKDAY = {
            year: formats_n,
            month: formats_s,
            day: formats_n,
            weekday: formats_s
        };
        const DATE_FULL = {
            year: formats_n,
            month: formats_l,
            day: formats_n
        };
        const DATE_HUGE = {
            year: formats_n,
            month: formats_l,
            day: formats_n,
            weekday: formats_l
        };
        const TIME_SIMPLE = {
            hour: formats_n,
            minute: formats_n
        };
        const TIME_WITH_SECONDS = {
            hour: formats_n,
            minute: formats_n,
            second: formats_n
        };
        const TIME_WITH_SHORT_OFFSET = {
            hour: formats_n,
            minute: formats_n,
            second: formats_n,
            timeZoneName: formats_s
        };
        const TIME_WITH_LONG_OFFSET = {
            hour: formats_n,
            minute: formats_n,
            second: formats_n,
            timeZoneName: formats_l
        };
        const TIME_24_SIMPLE = {
            hour: formats_n,
            minute: formats_n,
            hourCycle: "h23"
        };
        const TIME_24_WITH_SECONDS = {
            hour: formats_n,
            minute: formats_n,
            second: formats_n,
            hourCycle: "h23"
        };
        const TIME_24_WITH_SHORT_OFFSET = {
            hour: formats_n,
            minute: formats_n,
            second: formats_n,
            hourCycle: "h23",
            timeZoneName: formats_s
        };
        const TIME_24_WITH_LONG_OFFSET = {
            hour: formats_n,
            minute: formats_n,
            second: formats_n,
            hourCycle: "h23",
            timeZoneName: formats_l
        };
        const DATETIME_SHORT = {
            year: formats_n,
            month: formats_n,
            day: formats_n,
            hour: formats_n,
            minute: formats_n
        };
        const DATETIME_SHORT_WITH_SECONDS = {
            year: formats_n,
            month: formats_n,
            day: formats_n,
            hour: formats_n,
            minute: formats_n,
            second: formats_n
        };
        const DATETIME_MED = {
            year: formats_n,
            month: formats_s,
            day: formats_n,
            hour: formats_n,
            minute: formats_n
        };
        const DATETIME_MED_WITH_SECONDS = {
            year: formats_n,
            month: formats_s,
            day: formats_n,
            hour: formats_n,
            minute: formats_n,
            second: formats_n
        };
        const DATETIME_MED_WITH_WEEKDAY = {
            year: formats_n,
            month: formats_s,
            day: formats_n,
            weekday: formats_s,
            hour: formats_n,
            minute: formats_n
        };
        const DATETIME_FULL = {
            year: formats_n,
            month: formats_l,
            day: formats_n,
            hour: formats_n,
            minute: formats_n,
            timeZoneName: formats_s
        };
        const DATETIME_FULL_WITH_SECONDS = {
            year: formats_n,
            month: formats_l,
            day: formats_n,
            hour: formats_n,
            minute: formats_n,
            second: formats_n,
            timeZoneName: formats_s
        };
        const DATETIME_HUGE = {
            year: formats_n,
            month: formats_l,
            day: formats_n,
            weekday: formats_l,
            hour: formats_n,
            minute: formats_n,
            timeZoneName: formats_l
        };
        const DATETIME_HUGE_WITH_SECONDS = {
            year: formats_n,
            month: formats_l,
            day: formats_n,
            weekday: formats_l,
            hour: formats_n,
            minute: formats_n,
            second: formats_n,
            timeZoneName: formats_l
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
        function util_isDate(o) {
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
                const ts = util_isDate(date) ? date.valueOf() : NaN;
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
        const {new_for_path: Logger_new_for_path} = imports.gi.Gio.File;
        Logger_new_for_path(LOG_FILE_PATH);
        const {FileCreateFlags: Logger_FileCreateFlags, Subprocess: Logger_Subprocess, SubprocessFlags: Logger_SubprocessFlags} = imports.gi.Gio;
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
            const proc = Logger_Subprocess.new([ "bash", "-c", script ], Logger_SubprocessFlags.STDIN_PIPE | Logger_SubprocessFlags.STDOUT_PIPE);
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
        const selectCalendarAccounts = () => getState().settings.accounts;
        const createCalendarPollingService = args => {
            const {onNewEventsPolled, calendarApi} = args;
            const intervalId = setInterval(queryNewEvents, 1e4);
            async function queryNewEvents() {
                const newEvents = await calendarApi.getTodayEvents();
                onNewEventsPolled(newEvents);
            }
            return () => clearInterval(intervalId);
        };
        function initCalendarEventEmitter() {
            const currentAccounts = [];
            watchSelector(selectCalendarAccounts, ((newAccounts, oldValue) => {
                newAccounts.forEach((account => {
                    if (currentAccounts.includes(account.mail)) return;
                    const api = new Office365Api({
                        onRefreshTokenChanged: newToken => dispatch(refreshTokenChanged({
                            mail: account.mail,
                            refreshToken: newToken
                        })),
                        refreshToken: account.refreshToken
                    });
                    createCalendarPollingService({
                        onNewEventsPolled: events => dispatch(eventsLoaded(events)),
                        calendarApi: api
                    });
                    currentAccounts.push(account.mail);
                }));
            }));
        }
        function createNotifyService() {
            let reminders = [];
            watchSelector(selectEvents, (events => {
                reminders = updateExistingReminders(reminders, events);
                const newEvents = events.filter((event => {
                    const isNew = !reminders.find((reminder => reminder.eventId === event.reminderId));
                    return isNew;
                }));
                newEvents.forEach((event => {
                    const newReminder = createNewReminder(event);
                    reminders.push(newReminder);
                }));
            }));
        }
        function updateExistingReminders(reminders, updatedEvents) {
            return reminders.flatMap((reminder => {
                const updatedEvent = updatedEvents.find((event => reminder.eventId === event.reminderId));
                const currentRemindTime = reminder.remindTime;
                const updatedRemindTime = null === updatedEvent || void 0 === updatedEvent ? void 0 : updatedEvent.remindTime;
                const reminderHasChanged = !(0, lodash.isEqual)(currentRemindTime, updatedRemindTime);
                if (reminderHasChanged) {
                    reminder.timerId && clearTimeout(reminder.timerId);
                    if (!updatedEvent) return [];
                    return createNewReminder(updatedEvent);
                }
                return reminder;
            }));
        }
        function createNewReminder(event) {
            const remindTime = event.remindTime;
            let timerId;
            if (event.remindTime <= DateTime.now()) sendNotification(event); else {
                const timeout = remindTime.diff(DateTime.now()).milliseconds;
                timerId = setTimeout((() => {
                    sendNotification(event);
                }), timeout);
            }
            return {
                eventId: event.reminderId,
                remindTime,
                timerId
            };
        }
        function sendNotification(event) {
            const {startFormated, subject} = event;
            const notificationText = `<b>${startFormated}</b>\n\n${subject}`;
            notify({
                notificationText,
                transient: false
            });
        }
        const {Label} = imports.gi.St;
        const {ActorAlign} = imports.gi.Clutter;
        const {EllipsizeMode} = imports.gi.Pango;
        let label = null;
        function getAppletLabel() {
            if (label) return label;
            label = new Label({
                reactive: true,
                track_hover: true,
                style_class: "applet-label",
                y_align: ActorAlign.CENTER,
                y_expand: false
            });
            label.clutter_text.ellipsize = EllipsizeMode.NONE;
            const clearInterval = setIntervalAccurate((() => {
                const time = DateTime.now();
                null === label || void 0 === label ? void 0 : label.set_text(time.toFormat(`EEEE, MMMM d, HH:mm`, {
                    locale: "de"
                }));
            }), 1e3, true);
            addCleanupFunction((() => {
                clearInterval();
                label = null;
            }));
            return label;
        }
        function setIntervalAccurate(callback, interval, callImmediately = false) {
            let expected = Date.now() + interval;
            callImmediately && callback();
            const step = () => {
                const dt = Date.now() - expected;
                expected += interval;
                callback();
                timerID = setTimeout(step, Math.max(0, interval - dt));
            };
            let timerID = setTimeout(step, interval);
            return () => clearTimeout(timerID);
        }
        var cinnamonpopup = __webpack_require__(447);
        const {BoxLayout, Label: ContextMenu_Label, Icon, IconType} = imports.gi.St;
        const {spawnCommandLine} = imports.misc.util;
        const {KEY_space, KEY_KP_Enter, KEY_Return} = imports.gi.Clutter;
        const {ConfirmDialog} = imports.ui.modalDialog;
        const {_removeAppletFromPanel} = imports.ui.appletManager;
        let contextMenu = null;
        function createContextMenuItem(args) {
            const {text, iconName, onClick} = args;
            const popupMenuItem = new BoxLayout({
                style_class: "popup-menu-item",
                can_focus: true,
                track_hover: true,
                reactive: true
            });
            popupMenuItem.connect("button-press-event", onClick);
            popupMenuItem.connect("notify::hover", (() => {
                popupMenuItem.change_style_pseudo_class("active", popupMenuItem.hover);
                popupMenuItem.hover && popupMenuItem.grab_key_focus();
            }));
            popupMenuItem.connect("key-press-event", ((actor, event) => {
                const symbol = event.get_key_symbol();
                const relevantKeys = [ KEY_space, KEY_KP_Enter, KEY_Return ];
                if (relevantKeys.includes(symbol) && popupMenuItem.hover) onClick();
            }));
            const label = new ContextMenu_Label({
                text
            });
            const icon = new Icon({
                style_class: "popup-menu-icon",
                icon_name: iconName,
                icon_type: IconType.SYMBOLIC
            });
            popupMenuItem.add_child(icon);
            popupMenuItem.add_child(label);
            return popupMenuItem;
        }
        function getContextMenu(args) {
            const {launcher, instanceId} = args;
            if (contextMenu) return {
                toggle: contextMenu.toggle
            };
            contextMenu = (0, cinnamonpopup.S)({
                launcher
            });
            const aboutItem = createContextMenuItem({
                text: "About ...",
                iconName: "dialog-question",
                onClick: () => {
                    spawnCommandLine(`xlet-about-dialog applets ${__meta.uuid}`);
                }
            });
            const removeItem = createContextMenuItem({
                text: `Remove ${__meta.name}`,
                iconName: "edit-delete",
                onClick: () => {
                    const dialog = new ConfirmDialog(`Are you sure you want to remove ${__meta.name}?`, (() => _removeAppletFromPanel(__meta.uuid, instanceId)));
                    dialog.open();
                }
            });
            const configureItem = createContextMenuItem({
                text: "Configure ...",
                iconName: "system-run",
                onClick: () => {
                    global.log(`cjs ${__dirname}/${APPLET_SHORT_NAME}-settings.js`);
                    spawnCommandLine(`cjs ${__dirname}/${APPLET_SHORT_NAME}-settings.js`);
                }
            });
            [ aboutItem, removeItem, configureItem ].forEach((item => null === contextMenu || void 0 === contextMenu ? void 0 : contextMenu.add_child(item)));
            return {
                toggle: contextMenu.toggle
            };
        }
        const {BoxLayout: PopupSeperator_BoxLayout, DrawingArea} = imports.gi.St;
        const {LinearGradient} = imports.gi.cairo;
        function createSeparatorMenuItem() {
            const container = new PopupSeperator_BoxLayout({
                style_class: "popup-menu-item"
            });
            const drawingArea = new DrawingArea({
                style_class: "popup-separator-menu-item",
                x_expand: true
            });
            container.add_child(drawingArea);
            drawingArea.connect("repaint", (() => {
                const cr = drawingArea.get_context();
                const themeNode = drawingArea.get_theme_node();
                const [width, height] = drawingArea.get_surface_size();
                const margin = themeNode.get_length("-margin-horizontal");
                const gradientHeight = themeNode.get_length("-gradient-height");
                const startColor = themeNode.get_color("-gradient-start");
                const endColor = themeNode.get_color("-gradient-end");
                const gradientWidth = width - 2 * margin;
                const gradientOffset = (height - gradientHeight) / 2;
                const pattern = new LinearGradient(margin, gradientOffset, width - margin, gradientOffset + gradientHeight);
                pattern.addColorStopRGBA(0, startColor.red / 255, startColor.green / 255, startColor.blue / 255, startColor.alpha / 255);
                pattern.addColorStopRGBA(.5, endColor.red / 255, endColor.green / 255, endColor.blue / 255, endColor.alpha / 255);
                pattern.addColorStopRGBA(1, startColor.red / 255, startColor.green / 255, startColor.blue / 255, startColor.alpha / 255);
                cr.setSource(pattern);
                cr.rectangle(margin, gradientOffset, gradientWidth, gradientHeight);
                cr.fill();
                cr.$dispose;
            }));
            return container;
        }
        function clsx_m_r(e) {
            var t, f, n = "";
            if ("string" == typeof e || "number" == typeof e) n += e; else if ("object" == typeof e) if (Array.isArray(e)) for (t = 0; t < e.length; t++) e[t] && (f = clsx_m_r(e[t])) && (n && (n += " "), 
            n += f); else for (t in e) e[t] && (n && (n += " "), n += t);
            return n;
        }
        function clsx() {
            for (var e, t, f = 0, n = ""; f < arguments.length; ) (e = arguments[f++]) && (t = clsx_m_r(e)) && (n && (n += " "), 
            n += t);
            return n;
        }
        const clsx_m = clsx;
        imports.gi.Cinnamon;
        const {Table, Label: Calendar_Label, Align, BoxLayout: Calendar_BoxLayout, Button, Bin} = imports.gi.St;
        const WEEKDAY_ABBREVATIONS = [ "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su" ];
        const Calendar_now = DateTime.now();
        const today = DateTime.fromObject({
            year: Calendar_now.year,
            month: Calendar_now.month,
            day: Calendar_now.day
        });
        const table = new Table({
            style_class: "calendar",
            reactive: true,
            homogeneous: false,
            y_expand: false,
            x_expand: false
        });
        const container = new Bin({
            child: table,
            x_expand: false,
            y_expand: false
        });
        function createPaginator(args) {
            const {text, onBack, onNext} = args;
            const backBtn = new Button({
                style_class: "calendar-change-month-back"
            });
            backBtn.connect("button-press-event", onBack);
            const label = new Calendar_Label({
                style_class: "calendar-month-label",
                text
            });
            const forwardBtn = new Button({
                style_class: "calendar-change-month-forward"
            });
            forwardBtn.connect("button-press-event", onNext);
            const box = new Calendar_BoxLayout({
                x_expand: true
            });
            box.add(backBtn);
            box.add(label, {
                expand: true,
                x_fill: false,
                x_align: Align.MIDDLE
            });
            box.add(forwardBtn);
            return {
                actor: box,
                setText: newText => label.text = newText
            };
        }
        function createHeader(month, year) {
            const date = DateTime.fromObject({
                year,
                month
            });
            const prevMonth = date.minus({
                month: 1
            });
            const nextMonth = date.plus({
                month: 1
            });
            const prevYear = date.minus({
                year: 1
            });
            const nextYear = date.plus({
                year: 1
            });
            const monthPaginator = createPaginator({
                text: date.monthLong,
                onBack: () => createCalendar(prevMonth.month, prevMonth.year),
                onNext: () => createCalendar(nextMonth.month, nextMonth.year)
            });
            const yearPaginator = createPaginator({
                text: date.year.toString(),
                onBack: () => createCalendar(prevYear.month, prevYear.year),
                onNext: () => createCalendar(nextYear.month, nextYear.year)
            });
            const layout = new Calendar_BoxLayout({
                x_expand: true
            });
            layout.add_child(monthPaginator.actor);
            layout.add_child(yearPaginator.actor);
            return layout;
        }
        function createCalendar(month = today.month, year = today.year) {
            table.destroy_all_children();
            const header = createHeader(month, year);
            table.add(header, {
                row: 0,
                col: 0,
                col_span: 10
            });
            WEEKDAY_ABBREVATIONS.forEach(((weekday, index) => {
                const label = new Calendar_Label({
                    style_class: clsx_m("calendar-day-base", "calendar-day-heading"),
                    text: weekday
                });
                table.add(label, {
                    row: 1,
                    col: index + 1,
                    x_fill: false,
                    x_align: Align.MIDDLE
                });
            }));
            const mondayBefore1st = DateTime.fromObject({
                year,
                month,
                day: 1
            }).startOf("week");
            for (let week = 0; week <= 5; week++) for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
                const isWorkDay = 5 !== dayOfWeek && 6 !== dayOfWeek;
                const isLeft = 0 === dayOfWeek;
                const isTop = 0 == week;
                const date = mondayBefore1st.plus({
                    week,
                    days: dayOfWeek
                });
                const isToday = date.equals(today);
                const isOtherMonth = date.month !== month;
                const style_class = clsx_m([ "calendar-day-base", isWorkDay ? "calendar-work-day" : "calendar-nonwork-day", isLeft && "calendar-day-left", isTop && "calendar-day-top", isToday && "calendar-today", isOtherMonth && "calendar-other-month-day" ]);
                const button = new Button({
                    label: date.day.toString(),
                    reactive: true,
                    style_class
                });
                table.add(button, {
                    row: week + 2,
                    col: dayOfWeek + 1
                });
            }
            return container;
        }
        const {Button: Card_Button, Table: Card_Table, BoxLayout: Card_BoxLayout, Label: Card_Label, Bin: Card_Bin} = imports.gi.St;
        const {WrapMode} = imports.gi.Pango;
        const {spawnCommandLine: Card_spawnCommandLine} = imports.misc.util;
        function createCard(args) {
            const {title, body, onlineMeetingUrl} = args;
            const button = new Card_Button({
                style_class: "notification-applet-padding"
            });
            button.connect("button-press-event", (() => {
                Card_spawnCommandLine(`xdg-open ${onlineMeetingUrl}`);
            }));
            const table = new Card_Table({
                name: "notification",
                reactive: true
            });
            button.set_child(table);
            const titleLabel = new Card_Label;
            titleLabel.clutter_text.line_wrap = true;
            titleLabel.clutter_text.line_wrap_mode = WrapMode.WORD_CHAR;
            table.add(titleLabel, {
                row: 0,
                col: 1
            });
            titleLabel.clutter_text.set_markup(`<b>${title}</b>`);
            const contentLabel = new Card_Label;
            contentLabel.clutter_text.set_markup(body);
            table.add(contentLabel, {
                row: 1,
                col: 1,
                col_span: 1
            });
            return button;
        }
        const {BoxLayout: CardContainer_BoxLayout, ScrollView, Align: CardContainer_Align, Bin: CardContainer_Bin, Label: CardContainer_Label, Widget} = imports.gi.St;
        const {PolicyType} = imports.gi.Gtk;
        function createScrollContainer() {
            const container = new CardContainer_BoxLayout({
                vertical: true,
                y_align: CardContainer_Align.START
            });
            const scrollView = new ScrollView({
                x_fill: true,
                y_fill: true,
                y_align: CardContainer_Align.START,
                style_class: "vfade",
                hscrollbar_policy: PolicyType.NEVER,
                vscrollbar_policy: PolicyType.AUTOMATIC
            });
            const box = new CardContainer_BoxLayout({
                vertical: true,
                y_align: CardContainer_Align.START
            });
            container.add_actor(scrollView);
            scrollView.add_actor(box);
            return {
                actor: container,
                add_child: widget => box.add_child(widget),
                destroy_all_children: () => box.destroy_all_children()
            };
        }
        const noEventLabel = new CardContainer_Label({
            text: "No events today"
        });
        function createCardContainer() {
            const outerContainer = new CardContainer_Bin({
                width: 250,
                x_expand: false,
                y_expand: false,
                y_align: CardContainer_Align.MIDDLE,
                child: noEventLabel
            });
            const scrollContainer = createScrollContainer();
            watchSelector(selectEvents, renderEvents);
            function renderEvents(events) {
                scrollContainer.destroy_all_children();
                if (0 === events.length) {
                    outerContainer.set_child(noEventLabel);
                    outerContainer.y_align = CardContainer_Align.MIDDLE;
                    return;
                }
                events.forEach((event => {
                    const card = createCard({
                        title: event.startFormated,
                        body: event.subject,
                        onlineMeetingUrl: event.onlineMeetingUrl
                    });
                    scrollContainer.add_child(card);
                }));
                outerContainer.set_child(scrollContainer.actor);
                outerContainer.y_align = CardContainer_Align.START;
            }
            return outerContainer;
        }
        const {BoxLayout: PopupMenu_BoxLayout, Bin: PopupMenu_Bin, Button: PopupMenu_Button, Align: PopupMenu_Align, Label: PopupMenu_Label} = imports.gi.St;
        let popupMenu = null;
        function createSimpleItem(text) {
            const popupMenuItem = new PopupMenu_BoxLayout({
                style_class: "popup-menu-item"
            });
            const label = new PopupMenu_Label({
                text
            });
            popupMenuItem.add_child(label);
            return popupMenuItem;
        }
        function getCalendarPopupMenu(args) {
            const {launcher} = args;
            if (popupMenu) return {
                toggle: popupMenu.toggle
            };
            popupMenu = (0, cinnamonpopup.S)({
                launcher
            });
            const mainContainer = new PopupMenu_BoxLayout;
            mainContainer.add_child(createCardContainer());
            mainContainer.add_child(createCalendar());
            popupMenu.add_child(mainContainer);
            popupMenu.add_child(createSeparatorMenuItem());
            popupMenu.add_child(new PopupMenu_Bin({
                x_align: PopupMenu_Align.START,
                child: createSimpleItem("As of:")
            }));
            addCleanupFunction((() => {
                null === popupMenu || void 0 === popupMenu ? void 0 : popupMenu.destroy_all_children();
                popupMenu = null;
            }));
            return {
                toggle: popupMenu.toggle
            };
        }
        const {Applet} = imports.ui.applet;
        const {uiGroup} = imports.ui.main;
        const {EventType} = imports.gi.Clutter;
        let appletBox = null;
        let cleanupFunctions = [];
        function createAppletBox(args) {
            if (appletBox) {
                global.logWarning("appletBox already defined");
                return appletBox;
            }
            const {instanceId, orientation, panelHeight} = args;
            appletBox = new Applet(orientation, panelHeight, instanceId);
            appletBox.actor.add_child(getAppletLabel());
            const popupMenu = getCalendarPopupMenu({
                launcher: appletBox.actor
            });
            const contextMenu = getContextMenu({
                launcher: appletBox.actor,
                instanceId
            });
            appletBox.on_applet_clicked = popupMenu.toggle;
            appletBox.actor.connect("event", ((actor, event) => {
                if (event.type() === EventType.BUTTON_PRESS && 3 === event.get_button()) {
                    contextMenu.toggle();
                    return true;
                }
                return false;
            }));
            appletBox.on_applet_removed_from_panel = () => {
                cleanupFunctions.forEach((cleanupFunc => cleanupFunc()));
                cleanupFunctions = [];
            };
            cleanupFunctions.push((() => {
                null === appletBox || void 0 === appletBox ? void 0 : appletBox.actor.destroy();
                appletBox = null;
            }));
            return appletBox;
        }
        function addCleanupFunction(cleanupFunction) {
            cleanupFunctions.push(cleanupFunction);
        }
        const {FileMonitorFlags, FileMonitorEvent} = imports.gi.Gio;
        function monitorSettingsFile() {
            const monitor = settingsFile.monitor_file(FileMonitorFlags.NONE, null);
            monitor.connect("changed", ((monitor, file, oldFile, eventType) => {
                if (eventType !== FileMonitorEvent.CHANGES_DONE_HINT) return;
                const newSettingsString = file.load_contents(null)[1];
                const newSettings = JSON.parse(newSettingsString);
                dispatch(settingsFileChanged(newSettings));
            }));
            return monitor;
        }
        const {Icon: applet_Icon, IconType: applet_IconType} = imports.gi.St;
        function main(args) {
            initCalendarEventEmitter();
            initNotificationFactory({
                iconFactory: () => new applet_Icon({
                    icon_type: applet_IconType.SYMBOLIC,
                    icon_name: "view-calendar",
                    icon_size: 25
                })
            });
            const appletBox = createAppletBox(args);
            createNotifyService();
            const settingsMonitor = monitorSettingsFile();
            appletBox.settingsMonitor = settingsMonitor;
            return appletBox;
        }
    })();
    reminderApplet = __webpack_exports__;
})();