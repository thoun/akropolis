var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Jump to entry.
 */
var JumpToEntry = /** @class */ (function () {
    function JumpToEntry(
    /**
     * Label shown on the entry. For players, it's player name.
     */
    label, 
    /**
     * HTML Element id, to scroll into view when clicked.
     */
    targetId, 
    /**
     * Any element that is useful to customize the link.
     * Basic ones are 'color' and 'colorback'.
     */
    data) {
        if (data === void 0) { data = {}; }
        this.label = label;
        this.targetId = targetId;
        this.data = data;
    }
    return JumpToEntry;
}());
var JumpToManager = /** @class */ (function () {
    function JumpToManager(game, settings) {
        var _a, _b, _c, _d;
        this.game = game;
        this.settings = settings;
        var entries = __spreadArray(__spreadArray(__spreadArray([], ((_a = settings === null || settings === void 0 ? void 0 : settings.topEntries) !== null && _a !== void 0 ? _a : []), true), ((_b = settings === null || settings === void 0 ? void 0 : settings.playersEntries) !== null && _b !== void 0 ? _b : this.createEntries(Object.values(game.gamedatas.players))), true), ((_c = settings === null || settings === void 0 ? void 0 : settings.bottomEntries) !== null && _c !== void 0 ? _c : []), true);
        this.createPlayerJumps(entries);
        var folded = (_d = settings === null || settings === void 0 ? void 0 : settings.defaultFolded) !== null && _d !== void 0 ? _d : false;
        if (settings === null || settings === void 0 ? void 0 : settings.localStorageFoldedKey) {
            var localStorageValue = localStorage.getItem(settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        document.getElementById('bga-jump-to_controls').classList.toggle('folded', folded);
    }
    JumpToManager.prototype.createPlayerJumps = function (entries) {
        var _this = this;
        var _a, _b, _c, _d;
        document.getElementById("game_play_area_wrap").insertAdjacentHTML('afterend', "\n        <div id=\"bga-jump-to_controls\">        \n            <div id=\"bga-jump-to_toggle\" class=\"bga-jump-to_link ".concat((_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : '', " toggle\" style=\"--color: ").concat((_d = (_c = this.settings) === null || _c === void 0 ? void 0 : _c.toggleColor) !== null && _d !== void 0 ? _d : 'black', "\">\n                \u21D4\n            </div>\n        </div>"));
        document.getElementById("bga-jump-to_toggle").addEventListener('click', function () { return _this.jumpToggle(); });
        entries.forEach(function (entry) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var html = "<div id=\"bga-jump-to_".concat(entry.targetId, "\" class=\"bga-jump-to_link ").concat((_b = (_a = _this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : '', "\">");
            if ((_d = (_c = _this.settings) === null || _c === void 0 ? void 0 : _c.showEye) !== null && _d !== void 0 ? _d : true) {
                html += "<div class=\"eye\"></div>";
            }
            if (((_f = (_e = _this.settings) === null || _e === void 0 ? void 0 : _e.showAvatar) !== null && _f !== void 0 ? _f : true) && ((_g = entry.data) === null || _g === void 0 ? void 0 : _g.id)) {
                var cssUrl = (_h = entry.data) === null || _h === void 0 ? void 0 : _h.avatarUrl;
                if (!cssUrl) {
                    var img = document.getElementById("avatar_".concat(entry.data.id));
                    var url = img === null || img === void 0 ? void 0 : img.src;
                    // ? Custom image : Bga Image
                    //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                    if (url) {
                        cssUrl = "url('".concat(url, "')");
                    }
                }
                if (cssUrl) {
                    html += "<div class=\"bga-jump-to_avatar\" style=\"--avatar-url: ".concat(cssUrl, ";\"></div>");
                }
            }
            html += "\n                <span class=\"bga-jump-to_label\">".concat(entry.label, "</span>\n            </div>");
            //
            document.getElementById("bga-jump-to_controls").insertAdjacentHTML('beforeend', html);
            var entryDiv = document.getElementById("bga-jump-to_".concat(entry.targetId));
            Object.getOwnPropertyNames((_j = entry.data) !== null && _j !== void 0 ? _j : []).forEach(function (key) {
                entryDiv.dataset[key] = entry.data[key];
                entryDiv.style.setProperty("--".concat(key), entry.data[key]);
            });
            entryDiv.addEventListener('click', function () { return _this.jumpTo(entry.targetId); });
        });
        var jumpDiv = document.getElementById("bga-jump-to_controls");
        jumpDiv.style.marginTop = "-".concat(Math.round(jumpDiv.getBoundingClientRect().height / 2), "px");
    };
    JumpToManager.prototype.jumpToggle = function () {
        var _a;
        var jumpControls = document.getElementById('bga-jump-to_controls');
        jumpControls.classList.toggle('folded');
        if ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.localStorageFoldedKey) {
            localStorage.setItem(this.settings.localStorageFoldedKey, jumpControls.classList.contains('folded').toString());
        }
    };
    JumpToManager.prototype.jumpTo = function (targetId) {
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };
    JumpToManager.prototype.getOrderedPlayers = function (unorderedPlayers) {
        var _this = this;
        var players = unorderedPlayers.sort(function (a, b) { return Number(a.playerNo) - Number(b.playerNo); });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.game.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    JumpToManager.prototype.createEntries = function (players) {
        var orderedPlayers = this.getOrderedPlayers(players);
        return orderedPlayers.map(function (player) { return new JumpToEntry(player.name, "player-table-".concat(player.id), {
            'color': '#' + player.color,
            'colorback': player.color_back ? '#' + player.color_back : null,
            'id': player.id,
        }); });
    };
    return JumpToManager;
}());
var BgaAnimation = /** @class */ (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = /** @class */ (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = /** @class */ (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
/**
 * Slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = (_e = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _e !== void 0 ? _e : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
/**
 * Slide of the element from destination to origin.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg) scale(").concat((_e = settings.scale) !== null && _e !== void 0 ? _e : 1, ")");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        // TODO make it an option ?
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    /**
     * Plays an animation if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @param animation the animation to play
     * @returns the animation promise.
     */
    AnimationManager.prototype.play = function (animation) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, _a;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3 /*break*/, 2];
                        settings = animation.settings;
                        (_b = settings.animationStart) === null || _b === void 0 ? void 0 : _b.call(settings, animation);
                        (_c = settings.element) === null || _c === void 0 ? void 0 : _c.classList.add((_d = settings.animationClass) !== null && _d !== void 0 ? _d : 'bga-animations_animated');
                        animation.settings = __assign({ duration: (_h = (_f = (_e = animation.settings) === null || _e === void 0 ? void 0 : _e.duration) !== null && _f !== void 0 ? _f : (_g = this.settings) === null || _g === void 0 ? void 0 : _g.duration) !== null && _h !== void 0 ? _h : 500, scale: (_m = (_k = (_j = animation.settings) === null || _j === void 0 ? void 0 : _j.scale) !== null && _k !== void 0 ? _k : (_l = this.zoomManager) === null || _l === void 0 ? void 0 : _l.zoom) !== null && _m !== void 0 ? _m : undefined }, animation.settings);
                        _a = animation;
                        return [4 /*yield*/, animation.animationFunction(this, animation)];
                    case 1:
                        _a.result = _s.sent();
                        (_p = (_o = animation.settings).animationEnd) === null || _p === void 0 ? void 0 : _p.call(_o, animation);
                        (_q = settings.element) === null || _q === void 0 ? void 0 : _q.classList.remove((_r = settings.animationClass) !== null && _r !== void 0 ? _r : 'bga-animations_animated');
                        return [3 /*break*/, 3];
                    case 2: return [2 /*return*/, Promise.resolve(animation)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Plays multiple animations in parallel.
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    /**
     * Plays multiple animations in sequence (the second when the first ends, ...).
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, __spreadArray([result], others, true)];
                    case 3: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    /**
     * Plays multiple animations with a delay between each animation start.
     *
     * @param animations the animations to play
     * @param delay the delay (in ms)
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param animation the animation function
     * @param attachElement the destination parent
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
var TILE_COORDINATES = [
    [0, 0],
    [1, 1],
    [0, 2],
];
var TilesManager = /** @class */ (function () {
    function TilesManager(game) {
        this.game = game;
    }
    TilesManager.prototype.hexFromString = function (types) {
        if (Array.isArray(types)) { // double tiles
            return {
                type: types.map(function (type) { return type.split('-')[0]; }).join('-'),
                plaza: false,
            };
        }
        var typeArray = types.split('-');
        var type = typeArray[0];
        var plaza = typeArray[1] === 'plaza';
        return { type: type, plaza: plaza };
    };
    TilesManager.prototype.createTileHex = function (x, y, z, types, withSides) {
        if (withSides === void 0) { withSides = true; }
        var hex = this.createHex(x, y, z);
        if (withSides) {
            for (var i = 0; i < 6; i++) {
                var side = document.createElement('div');
                side.classList.add('side');
                side.style.setProperty('--side', "".concat(i));
                hex.appendChild(side);
            }
        }
        var face = hex.getElementsByClassName('face')[0];
        var _a = this.hexFromString(types), type = _a.type, plaza = _a.plaza;
        face.dataset.type = type;
        face.dataset.plaza = (plaza !== null && plaza !== void 0 ? plaza : false).toString();
        return hex;
    };
    TilesManager.prototype.createPossibleHex = function (x, y, z) {
        return this.createHex(x, y, z, ['possible']);
    };
    TilesManager.prototype.createTile = function (tile, withSides, classes) {
        var _a;
        var _this = this;
        if (withSides === void 0) { withSides = true; }
        if (classes === void 0) { classes = []; }
        var tileDiv = document.createElement('div');
        if (tile.hexes.length === 1) {
            classes.push('single-tile');
        }
        (_a = tileDiv.classList).add.apply(_a, __spreadArray(['tile'], classes, false));
        tile.hexes.forEach(function (hex, index) {
            var hexDiv = _this.createTileHex(TILE_COORDINATES[index][0], TILE_COORDINATES[index][1], 0, hex, withSides);
            hexDiv.dataset.index = "".concat(index);
            tileDiv.appendChild(hexDiv);
        });
        return tileDiv;
    };
    TilesManager.prototype.getTypeTitle = function (type) {
        switch (type) {
            case 'house': return _('Houses');
            case 'market': return _('Markets');
            case 'barrack': return _('Barracks');
            case 'temple': return _('Temples');
            case 'garden': return _('Gardens');
        }
    };
    TilesManager.prototype.getScoreCondition = function (type) {
        switch (type) {
            case 'house': return _("You only earn points for Houses that are part of your largest group of adjacent Houses.");
            case 'market': return _("A Market must not be adjacent to any other Market.");
            case 'barrack': return _("Barracks must be placed on the edge of your city.");
            case 'temple': return _("Temples must be completely surrounded.");
            case 'garden': return _("There are no placement conditions on Gardens.");
        }
    };
    TilesManager.prototype.getHexTooltip = function (type, plaza) {
        if (plaza) {
            return "<strong>".concat(_('Plazas'), "</strong>\n            <br><br>\n            ").concat(_("Plazas will multiply the points that you gain for Districts of the same type at the end of the game. The multipliers are represented by the stars. If you have several matching Plazas, their stars are cumulative.") + "<br><br>" + _("A Plaza does not need to border Districts of the same type."));
        }
        else if (type === 'quarry') {
            return "<strong>".concat(_('Quarries'), "</strong>\n            <br><br>\n            ").concat(_("Quarries do not score any points at the end of the game, but they allow you to gain Stones. When an Architect covers a Quarry with another tile, they take 1 Stone from the reserve."));
        }
        else {
            var firstLine = null;
            switch (type) {
                case 'house':
                    firstLine = _("The citizens of your city like to live together in one large neighborhood.");
                    break;
                case 'market':
                    firstLine = _("Merchants don’t like competition, so want to be kept separate from other markets.");
                    break;
                case 'barrack':
                    firstLine = _("Soldiers keep watch over your city’s borders.");
                    break;
                case 'temple':
                    firstLine = _("Priests attract followers from the surrounding area.");
                    break;
                case 'garden':
                    firstLine = _("Parks always enhance your city.");
                    break;
            }
            return "<strong>".concat(this.getTypeTitle(type), "</strong>\n                    <br><br>\n                    <i>").concat(firstLine, "</i><br>\n                    <strong>").concat(_('Score condition:'), "</strong> ").concat(this.getScoreCondition(type), "\n                    <br><br>\n                    ").concat(_("A District constructed on a higher level of your City can earn you more points. The value of a District is defined by its construction height: a District built on the 1st level would be worth 1 point, on the 2nd level 2 points, on the 3rd level 3 points, etc."));
        }
    };
    TilesManager.prototype.getVariantTooltip = function (type) {
        switch (type) {
            case 'house':
                return _("If your group of Houses Districts has a value of 10 or more, its points are doubled.");
            case 'market':
                return _("If your Market District is next to a Market Plaza, its points are doubled.");
            case 'barrack':
                return _("If your Barracks has 3 or 4 empty spaces adjacent to it, its points are doubled.");
            case 'temple':
                return _("If your Temple is built on a higher level, its points are doubled.");
            case 'garden':
                return _("If your Garden is adjacent to a lake (an empty space that is completely surrounded), its points are doubled.");
        }
    };
    TilesManager.prototype.createHex = function (x, y, z, faceClasses) {
        var _a;
        if (faceClasses === void 0) { faceClasses = []; }
        var hex = document.createElement('div');
        hex.classList.add('hex');
        hex.style.setProperty('--x', "".concat(x));
        hex.style.setProperty('--y', "".concat(y));
        hex.style.setProperty('--z', "".concat(z));
        var face = document.createElement('div');
        (_a = face.classList).add.apply(_a, __spreadArray(['face'], faceClasses, false));
        hex.appendChild(face);
        return hex;
    };
    return TilesManager;
}());
var ZOOM_MAX = 3;
var ViewManager = /** @class */ (function () {
    function ViewManager(game) {
        this.game = game;
        this.isDragging = false;
        this.elements = [];
        // private rotating: boolean = false;
        this.moving = false;
        if (!dojo.hasClass("ebd-body", "mode_3d")) {
            dojo.addClass("ebd-body", "mode_3d");
            $("globalaction_3d").innerHTML = "2D"; // controls the upper right button
            this.setDefaultView();
        }
    }
    ViewManager.prototype.setDefaultView = function () {
        this.game.control3dxaxis = 40; // rotation in degrees of x axis (it has a limit of 0 to 80 degrees in the frameword so users cannot turn it upsidedown)
        this.game.control3dzaxis = 0; // rotation in degrees of z axis
        this.game.control3dxpos = -100; // center of screen in pixels
        this.game.control3dypos = -50; // center of screen in pixels
        this.game.control3dscale = 1; // zoom level, 1 is default 2 is double normal size,
        this.game.control3dmode3d = true; // is the 3d enabled
    };
    ViewManager.prototype.resetView = function () {
        this.change3d(0, 0, 0, 0, 0, true, true);
        this.fitCitiesToView();
    };
    ViewManager.prototype.fitCitiesToView = function () {
        var maxSpan = 0;
        this.elements.forEach(function (element) {
            var tiles = Array.from(element.querySelectorAll('.tile:not(.preview)'));
            var minX = null;
            var maxX = null;
            tiles.forEach(function (tile) {
                var rect = tile.getBoundingClientRect();
                if (minX == null || rect.x < minX) {
                    minX = rect.x;
                }
                if (maxX == null || (rect.x + rect.width) > maxX) {
                    maxX = rect.x + rect.width;
                }
            });
            if ((maxX - minX) > maxSpan) {
                maxSpan = maxX - minX;
            }
        });
        if (!maxSpan) {
            return;
        }
        var expectedWidth = maxSpan + 50;
        var width = this.elements[0].clientWidth;
        this.game.control3dscale = Math.min(width / expectedWidth, 1);
        this.updateTransformOnElements();
    };
    ViewManager.prototype.draggableElement3d = function (element) {
        var _this = this;
        this.elements.push(element);
        element.addEventListener('mousedown', function (e) { return _this.drag3dMouseDown(e); });
        element.addEventListener('mouseup', function (e) { return _this.closeDragElement3d(e); });
        element.addEventListener('mousewheel', function (e) { return _this.onMouseWheel(e); });
        element.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        });
        this.game.drag3d = element;
    };
    ViewManager.prototype.drag3dMouseDown = function (e) {
        e = e || window.event;
        if (e.buttons == 2 || e.buttons == 4) {
            dojo.stopEvent(e);
            $("ebd-body").onmousemove = dojo.hitch(this, this.elementDrag3d);
            $("pagesection_gameview").onmouseleave = dojo.hitch(this, this.closeDragElement3d);
            dojo.addClass($("pagesection_gameview"), "grabbinghand");
            this.moving = true;
        }
    };
    ViewManager.prototype.elementDrag3d = function (e) {
        e = e || window.event;
        dojo.stopEvent(e);
        if (e.buttons != 2 && e.buttons != 4) {
            $("ebd-body").onmousemove = null;
            dojo.removeClass($("pagesection_gameview"), "grabbinghand");
            this.moving = false;
        }
        if (!this.isDragging) {
            this.isDragging = true;
            if (e.buttons == 2) {
                var viewportOffset = e.currentTarget.getBoundingClientRect();
                var x = void 0;
                if ((e.screenY - viewportOffset.top) > (3 * window.innerHeight / 4)) {
                    x = e.movementX;
                }
                else {
                    x = -1 * e.movementX;
                }
                this.change3d(e.movementY / (-10), 0, 0, x / (-10), 0, true, false);
            }
            else if (e.buttons == 4) {
                this.change3d(0, e.movementY, e.movementX, 0, 0, true, false);
            }
            this.isDragging = false;
        }
    };
    ViewManager.prototype.closeDragElement3d = function (evt) {
        /* stop moving when mouse button is released:*/
        if (evt.buttons == 2 || evt.buttons == 4) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            $("ebd-body").onmousemove = null;
            dojo.removeClass($("pagesection_gameview"), "grabbinghand");
            this.moving = false;
        }
    };
    ViewManager.prototype.onMouseWheel = function (evt) {
        dojo.stopEvent(evt);
        if (!this.moving) {
            var d = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail))) * 0.1;
            this.change3d(0, 0, 0, 0, d, true, false);
        }
    };
    // override of framework function to apply 3D on each player city instead of the whole view
    ViewManager.prototype.change3d = function (incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset) {
        this.game.control3dscale = Math.min(ZOOM_MAX, this.game.control3dscale);
        if (incScale > 0 && this.game.control3dscale >= ZOOM_MAX) {
            incScale = 0;
        }
        if (is3Dactive == false) {
            this.game.control3dmode3d = !this.game.control3dmode3d;
        }
        if (this.game.control3dmode3d == false) {
            if (dojo.hasClass("ebd-body", "mode_3d")) {
                dojo.removeClass("ebd-body", "mode_3d");
            }
            this.elements.forEach(function (element) { return element.style.transform = "rotatex(" + 0 + "deg) translate(" + 0 + "px," + 0 + "px) rotateZ(" + 0 + "deg)"; });
        }
        else {
            if (!dojo.hasClass("ebd-body", "mode_3d")) {
                dojo.addClass("ebd-body", "mode_3d");
            }
            dojo.addClass("ebd-body", "enableTransitions");
            this.game.control3dxaxis += incXAxis;
            if (this.game.control3dxaxis >= 80) {
                this.game.control3dxaxis = 80;
            }
            if (this.game.control3dxaxis <= 0) {
                this.game.control3dxaxis = 0;
            }
            if (this.game.control3dscale < 0.5) {
                this.game.control3dscale = 0.5;
            }
            this.game.control3dzaxis += xAxis;
            this.game.control3dxpos += xpos;
            this.game.control3dypos += ypos;
            this.game.control3dscale += incScale;
            if (reset) {
                this.setDefaultView();
            }
            dojo.toggleClass($("pagesection_gameview"), "view-changed", !reset);
            this.updateTransformOnElements();
        }
    };
    ViewManager.prototype.updateTransformOnElements = function () {
        var _this = this;
        this.elements.forEach(function (element) { return element.style.transform = "rotatex(" + _this.game.control3dxaxis + "deg) translate(" + _this.game.control3dypos + "px," + _this.game.control3dxpos + "px) rotateZ(" + _this.game.control3dzaxis + "deg) scale3d(" + _this.game.control3dscale + "," + _this.game.control3dscale + "," + _this.game.control3dscale + ")"; });
    };
    return ViewManager;
}());
var ConstructionSite = /** @class */ (function () {
    function ConstructionSite(game, tiles, remainingStacks) {
        this.game = game;
        this.selectionActivated = false;
        this.market = document.getElementById('market');
        this.remainingstacksDiv = document.getElementById('remaining-stacks');
        this.setTiles(this.orderTiles(tiles.filter(function (tile) { return tile.location === 'dock'; })));
        document.getElementById('remaining-stacks-counter').insertAdjacentText('beforebegin', _('Remaining stacks'));
        this.remainingStacksCounter = new ebg.counter();
        this.remainingStacksCounter.create("remaining-stacks-counter");
        this.remainingStacksCounter.setValue(remainingStacks);
    }
    ConstructionSite.prototype.addTile = function (tile, index) {
        var _this = this;
        var tileWithCost = document.createElement('div');
        tileWithCost.id = "market-tile-".concat(tile.id);
        tileWithCost.classList.add('tile-with-cost');
        tileWithCost.dataset.cost = "".concat(index);
        var tileDiv = this.createMarketTile(tile);
        tileWithCost.appendChild(tileDiv);
        var cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = "\n            <span>".concat(index, "</span>\n            <div class=\"stone score-icon\"></div> \n        ");
        tileWithCost.appendChild(cost);
        this.market.appendChild(tileWithCost);
        tile.hexes.forEach(function (hex, index) {
            var hexDiv = tileDiv.querySelector("[data-index=\"".concat(index, "\"]"));
            hexDiv.id = "market-tile-".concat(tile.id, "-hex-").concat(index);
            var _a = _this.game.tilesManager.hexFromString(hex), type = _a.type, plaza = _a.plaza;
            _this.game.setTooltip(hexDiv.id, _this.game.tilesManager.getHexTooltip(type, plaza));
        });
    };
    ConstructionSite.prototype.setSelectedHex = function (tileId, hex) {
        var _a;
        Array.from(this.market.querySelectorAll('.selected')).forEach(function (option) { return option.classList.remove('selected'); });
        (_a = document.getElementById("market-tile-".concat(tileId))) === null || _a === void 0 ? void 0 : _a.classList.add('selected');
        if (!this.game.usePivotRotation()) {
            hex === null || hex === void 0 ? void 0 : hex.classList.add('selected');
        }
    };
    ConstructionSite.prototype.setDisabledTiles = function (playerMoney) {
        Array.from(this.market.querySelectorAll('.disabled')).forEach(function (option) { return option.classList.remove('disabled'); });
        if (playerMoney !== null) {
            Array.from(this.market.querySelectorAll('.tile-with-cost')).forEach(function (option) { return option.classList.toggle('disabled', Number(option.dataset.cost) > playerMoney); });
        }
    };
    ConstructionSite.prototype.refill = function (tiles, remainingStacks) {
        return __awaiter(this, void 0, void 0, function () {
            var orderedTiles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        orderedTiles = this.orderTiles(tiles);
                        this.setTiles(orderedTiles);
                        return [4 /*yield*/, Promise.all(orderedTiles.map(function (tile) {
                                return _this.game.animationManager.play(new BgaSlideAnimation({
                                    element: document.getElementById("market-tile-".concat(tile.id)),
                                    fromElement: _this.remainingstacksDiv,
                                }));
                            }))];
                    case 1:
                        _a.sent();
                        this.remainingStacksCounter.setValue(remainingStacks);
                        return [2 /*return*/];
                }
            });
        });
    };
    ConstructionSite.prototype.animateTileTo = function (tile, to) {
        return __awaiter(this, void 0, void 0, function () {
            var marketTileDiv, finalTransform;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        marketTileDiv = document.getElementById("market-tile-".concat(tile.id)).querySelector('.tile');
                        finalTransform = "rotate(".concat(60 * Number(marketTileDiv.style.getPropertyValue('--r')), "deg)");
                        return [4 /*yield*/, this.game.animationManager.play(new BgaSlideToAnimation({
                                element: marketTileDiv,
                                fromElement: to,
                                scale: 1,
                                finalTransform: finalTransform,
                            }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConstructionSite.prototype.removeTile = function (tile) {
        var index = this.tiles.findIndex(function (t) { return t.id == tile.id; });
        if (index !== -1) {
            this.tiles.splice(index, 1);
            this.setTiles(this.tiles);
        }
    };
    ConstructionSite.prototype.setSelectable = function (selectable) {
        this.selectionActivated = selectable;
        this.market.classList.toggle('selectable', selectable);
    };
    ConstructionSite.prototype.setTiles = function (tiles) {
        var _this = this;
        this.tiles = tiles;
        Array.from(this.market.querySelectorAll('.tile-with-cost')).forEach(function (option) { return option.remove(); });
        this.tiles.forEach(function (tile, index) { return _this.addTile(tile, index); });
        if (this.game.isCurrentPlayerActive() && this.game.stonesCounters[this.game.getPlayerId()]) {
            this.setDisabledTiles(this.game.stonesCounters[this.game.getPlayerId()].getValue());
        }
    };
    ConstructionSite.prototype.createMarketTile = function (tile) {
        var _this = this;
        var tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach(function (hex, index) {
            var hexDiv = tileDiv.querySelector("[data-index=\"".concat(index, "\"]"));
            hexDiv.addEventListener('click', function () {
                if (_this.selectionActivated) {
                    _this.game.constructionSiteHexClicked(tile, _this.game.usePivotRotation() ? 0 : index, hexDiv, Number(tileDiv.style.getPropertyValue('--r')));
                }
            });
        });
        return tileDiv;
    };
    // temp ? remove if sorted by state ASC on back-end side
    ConstructionSite.prototype.orderTiles = function (tiles) {
        tiles.sort(function (a, b) { return a.state - b.state; });
        return tiles;
    };
    ConstructionSite.prototype.setRotation = function (rotation, tile) {
        var tileDiv = document.getElementById("market-tile-".concat(tile.id)).getElementsByClassName('tile')[0];
        var SHIFT_LEFT = [0, 20, -16, 0, -20, 16];
        var SHIFT_TOP = [0, 12, 16, 8, -4, -8];
        tileDiv.style.setProperty('--r', "".concat(rotation));
        tileDiv.style.setProperty('--shift-left', "".concat(SHIFT_LEFT[(rotation + 600) % 6], "px"));
        tileDiv.style.setProperty('--shift-top', "".concat(SHIFT_TOP[(rotation + 600) % 6], "px"));
    };
    return ConstructionSite;
}());
var CARDS = {
    "Housing": '#55b5e9',
    "Villa": '#55b5e9',
    "DistrictCenter": '#55b5e9',
    "CityMarket": '#fcc812',
    "Storehouses": '#fcc812',
    "LuxuryGoods": '#fcc812',
    "Rampart": '#d11e25',
    "GuardTower": '#d11e25',
    "Fortress": '#d11e25',
    "Sanctuary": '#782f9a',
    "Pantheon": '#782f9a',
    "PilgrimsStairs": '#782f9a',
    "Oasis": '#3cb941',
    "HangingGardens": '#3cb941',
    "Parkland": '#3cb941',
    "MainStreet": '#918f90',
    "QuarryMine": '#918f90',
    "Agora": '#918f90',
};
var COLORED_DISCTRICT_ICON = function (color) { return "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 9 10\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xml:space=\"preserve\" xmlns:serif=\"http://www.serif.com/\" style=\"fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\"><path d=\"M8.531,7.388l0,-4.925l-4.265,-2.463l-4.266,2.463l0,4.925l4.266,2.463l4.265,-2.463Z\" style=\"fill:".concat(color, ";fill-rule:nonzero;\"/></svg>"); };
var COLORED_PLAZA_ICON = function (color) { return "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 11 11\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xml:space=\"preserve\" xmlns:serif=\"http://www.serif.com/\" style=\"fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\"><path d=\"M10.71,3.997l-2.142,2.322c-0.153,0.166 -0.225,0.392 -0.197,0.617l0.402,3.133c0.013,0.1 -0.089,0.175 -0.18,0.133l-2.87,-1.32c-0.206,-0.094 -0.443,-0.093 -0.648,0.004l-2.856,1.35c-0.091,0.043 -0.193,-0.031 -0.182,-0.13l0.368,-3.138c0.027,-0.225 -0.048,-0.45 -0.203,-0.615l-2.167,-2.298c-0.069,-0.073 -0.03,-0.194 0.068,-0.214l3.098,-0.619c0.222,-0.045 0.413,-0.185 0.521,-0.384l1.517,-2.771c0.048,-0.088 0.175,-0.089 0.224,-0.001l1.547,2.754c0.111,0.198 0.303,0.336 0.526,0.378l3.104,0.586c0.098,0.019 0.138,0.139 0.07,0.213\" style=\"fill:".concat(color, ";fill-rule:nonzero;\"/></svg>"); };
var WHITE_DISCTRICT_ICON = "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 10 11\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xml:space=\"preserve\" xmlns:serif=\"http://www.serif.com/\" style=\"fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\"><path d=\"M0.141,7.797l0,-5.089l4.407,-2.545l4.407,2.545l0,5.089l-4.407,2.544l-4.407,-2.544Z\" style=\"fill:#fff;fill-rule:nonzero;\"/><path d=\"M4.549,0l-0.142,0.082l-4.265,2.462l-0.142,0.082l-0,5.253l0.142,0.082l4.265,2.462l0.142,0.082l0.142,-0.082l4.265,-2.462l0.142,-0.082l-0,-5.253l-0.142,-0.082l-4.265,-2.462l-0.142,-0.082Zm-0,0.327l4.265,2.463l-0,4.925l-4.265,2.463l-4.265,-2.463l-0,-4.925l4.265,-2.463Z\" style=\"fill:#231f20;fill-rule:nonzero;\"/></svg>";
var WHITE_PLAZA_ICON = "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 12 11\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xml:space=\"preserve\" xmlns:serif=\"http://www.serif.com/\" style=\"fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\"><path d=\"M2.448,10.673c-0.077,0 -0.15,-0.033 -0.202,-0.091c-0.051,-0.057 -0.074,-0.134 -0.066,-0.21l0.369,-3.138c0.021,-0.183 -0.039,-0.366 -0.167,-0.501l-2.167,-2.298c-0.067,-0.072 -0.09,-0.175 -0.06,-0.268c0.029,-0.093 0.107,-0.163 0.203,-0.182l3.099,-0.62c0.181,-0.036 0.336,-0.15 0.425,-0.312l1.516,-2.771c0.048,-0.087 0.139,-0.141 0.237,-0.141c0.098,0 0.186,0.052 0.235,0.138l1.547,2.755c0.091,0.161 0.247,0.273 0.428,0.307l3.105,0.587c0.096,0.018 0.175,0.086 0.205,0.179c0.031,0.093 0.01,0.196 -0.057,0.268l-2.142,2.323c-0.126,0.136 -0.185,0.319 -0.16,0.502l0.401,3.134c0.011,0.075 -0.013,0.153 -0.063,0.211c-0.052,0.059 -0.126,0.093 -0.204,0.093l-0.031,0l-0.082,-0.025l-2.871,-1.319c-0.082,-0.038 -0.169,-0.057 -0.26,-0.057c-0.092,0 -0.184,0.02 -0.267,0.06l-2.884,1.363l-0.087,0.013Z\" style=\"fill:#fff;fill-rule:nonzero;\"/><path d=\"M5.635,-0c-0.15,-0 -0.289,0.082 -0.361,0.214l-1.517,2.771c-0.068,0.125 -0.188,0.213 -0.328,0.242l-3.098,0.619c-0.147,0.03 -0.266,0.136 -0.311,0.279c-0.046,0.142 -0.01,0.298 0.092,0.407l2.167,2.299c0.098,0.104 0.145,0.245 0.128,0.387l-0.368,3.137c-0.013,0.117 0.023,0.234 0.101,0.322c0.079,0.088 0.191,0.138 0.308,0.138c0.061,-0 0.12,-0.013 0.176,-0.04l2.856,-1.35c0.064,-0.03 0.135,-0.046 0.206,-0.046c0.07,-0 0.138,0.015 0.202,0.044l2.87,1.319c0.054,0.025 0.112,0.038 0.172,0.038c0.118,-0 0.231,-0.051 0.309,-0.14c0.078,-0.089 0.114,-0.207 0.099,-0.324l-0.402,-3.133c-0.018,-0.142 0.027,-0.284 0.124,-0.389l2.142,-2.322c0.101,-0.11 0.135,-0.266 0.088,-0.408c-0.047,-0.142 -0.167,-0.248 -0.314,-0.275l-3.104,-0.587c-0.141,-0.026 -0.262,-0.113 -0.332,-0.238l-1.546,-2.754c-0.073,-0.13 -0.21,-0.21 -0.359,-0.21m-0,0.283c0.044,-0 0.087,0.022 0.112,0.066l1.546,2.754c0.111,0.198 0.304,0.336 0.526,0.378l3.104,0.586c0.099,0.019 0.139,0.139 0.071,0.213l-2.142,2.322c-0.154,0.166 -0.226,0.392 -0.197,0.617l0.402,3.133c0.01,0.08 -0.054,0.145 -0.127,0.145c-0.018,-0 -0.036,-0.004 -0.054,-0.012l-2.87,-1.32c-0.101,-0.046 -0.211,-0.07 -0.32,-0.07c-0.112,-0 -0.224,0.025 -0.327,0.074l-2.856,1.35c-0.018,0.009 -0.037,0.013 -0.055,0.013c-0.073,-0 -0.136,-0.064 -0.127,-0.144l0.368,-3.137c0.026,-0.225 -0.048,-0.45 -0.204,-0.615l-2.166,-2.298c-0.069,-0.074 -0.031,-0.194 0.068,-0.214l3.097,-0.62c0.222,-0.044 0.413,-0.184 0.522,-0.383l1.517,-2.771c0.024,-0.044 0.068,-0.067 0.112,-0.067\" style=\"fill:#231f20;fill-rule:nonzero;\"/></svg>";
function formatDescIcons(text, color) {
    if (typeof text !== 'string') { // TODO TEMP
        return '';
    }
    return text
        .replace(/<STONE>/g, "<div class=\"stone score-icon\"></div>")
        .replace(/<PLAZA>/g, WHITE_PLAZA_ICON)
        .replace(/<DISTRICT>/g, WHITE_DISCTRICT_ICON)
        .replace(/<(\w+)_PLAZA>/g, COLORED_PLAZA_ICON(color))
        .replace(/<(\w+)>/g, COLORED_DISCTRICT_ICON(color)); // last, because not suffixed by _DISTRICT
}
var AthenaConstructionSite = /** @class */ (function () {
    function AthenaConstructionSite(game, cards, cardStatuses, dockTiles, players) {
        var _this = this;
        this.game = game;
        this.selectionActivated = false;
        this.cards = []; // 0 indexed!
        var html = "\n            <div id=\"athena-contruction-spaces\">";
        [1, 2, 3, 4].forEach(function (space) {
            var card = cards.find(function (card) { return card.location === "athena-".concat(space); });
            _this.cards.push(card);
            html += "\n            <div id=\"contruction-space-".concat(card.id, "\" class=\"athena-contruction-space\">\n                <div class=\"construction-card-holder\">").concat(_this.generateCardHTML(card), "</div>\n                <div class=\"statue-parts-holder\">").concat(players.map(function (player) {
                var _a;
                var statuePartDone = ((_a = cardStatuses[player.id]) !== null && _a !== void 0 ? _a : []).includes(card.id);
                return "<div id=\"player-statue-part-".concat(player.id, "-").concat(space, "\" class=\"player-statue-part\" style=\"outline: 1px solid #").concat(player.color, "; background-color: #").concat(player.color, "20;\">\n                        <!--<div class=\"player-name\" style=\"color: #").concat(player.color, "\">").concat(player.name, "</div>-->\n                        ").concat(statuePartDone ? '' : "<div class=\"statue-part\" data-part=\"".concat(space, "\"></div>"), "\n                    </div>");
            }).join(''), "</div>\n                <div id=\"athena-tiles-").concat(space, "\" class=\"athena-tiles-space\"></div>\n            </div>\n            ");
        });
        html += "</div>";
        document.getElementById('market').insertAdjacentHTML('beforebegin', html);
        [1, 2, 3, 4].forEach(function (space) {
            var card = _this.cards[space - 1];
            _this.game.setTooltip("construction-card-".concat(card.id), _this.getCardTooltip(card));
            var tiles = dockTiles.filter(function (tile) { return tile.location === "athena-".concat(space); });
            tiles.forEach(function (tile) { return _this.addTile(tile, space); });
        });
    }
    AthenaConstructionSite.prototype.generateCardHTML = function (card) {
        var cardIndex = Object.keys(CARDS).indexOf(card.id);
        var row = Math.floor(cardIndex / 9);
        var col = cardIndex % 9;
        var color = CARDS[card.id];
        return "<div id=\"construction-card-".concat(card.id, "\" class=\"construction-card\" style=\"background-position: ").concat(col * 100 / 8, "% ").concat(row * 100, "%; --background: ").concat(color, ";\">\n            <div class=\"name-wrapper\"><div class=\"name\">").concat(_(card.name), "</div></div>\n            <div class=\"desc bga-autofit\">").concat(formatDescIcons(_(card.desc), color), "</div>\n        </div>");
    };
    AthenaConstructionSite.prototype.getCardTooltip = function (card) {
        var color = CARDS[card.id];
        return "<strong>".concat(_(card.name), "</strong>\n        <br><br>\n        ").concat(formatDescIcons(_(card.desc), color));
    };
    AthenaConstructionSite.prototype.addTile = function (tile, space) {
        var _this = this;
        var tileWithWrapper = document.createElement('div');
        tileWithWrapper.id = "market-tile-".concat(tile.id);
        var tileDiv = this.createSingleTile(tile);
        tileWithWrapper.appendChild(tileDiv);
        document.getElementById("athena-tiles-".concat(space)).appendChild(tileWithWrapper);
        tile.hexes.forEach(function (hex, index) {
            var hexDiv = tileDiv.querySelector("[data-index=\"".concat(index, "\"]"));
            hexDiv.id = "market-tile-".concat(tile.id, "-hex-").concat(index);
            var _a = _this.game.tilesManager.hexFromString(hex), type = _a.type, plaza = _a.plaza;
            var tooltip = type.split('-').map(function (t) { return _this.game.tilesManager.getHexTooltip(t, plaza); }).join('<hr>');
            _this.game.setTooltip(hexDiv.id, tooltip);
        });
    };
    AthenaConstructionSite.prototype.createSingleTile = function (tile) {
        var _this = this;
        var tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach(function (hex, index) {
            var hexDiv = tileDiv.querySelector("[data-index=\"".concat(index, "\"]"));
            hexDiv.addEventListener('click', function () {
                if (_this.selectionActivated && hexDiv.closest('.athena-tiles-space.selectable')) {
                    _this.game.constructionSiteHexClicked(tile, _this.game.usePivotRotation() ? 0 : index, hexDiv, Number(tileDiv.style.getPropertyValue('--r')));
                }
            });
        });
        return tileDiv;
    };
    AthenaConstructionSite.prototype.setRotation = function (rotation, tile) {
        var tileDiv = document.getElementById("market-tile-".concat(tile.id)).getElementsByClassName('tile')[0];
        var SHIFT_LEFT = [0, -6, -6, 0, 6, 6];
        var SHIFT_TOP = [0, -3, -10, -13, -10, -3];
        tileDiv.style.setProperty('--r', "".concat(rotation));
        tileDiv.style.setProperty('--shift-left', "".concat(SHIFT_LEFT[(rotation + 600) % 6], "px"));
        tileDiv.style.setProperty('--shift-top', "".concat(SHIFT_TOP[(rotation + 600) % 6], "px"));
    };
    AthenaConstructionSite.prototype.setSelectable = function (selectable) {
        this.selectionActivated = selectable.length > 0;
        [1, 2, 3, 4].forEach(function (space) {
            document.getElementById("athena-tiles-".concat(space)).classList.toggle('selectable', selectable.includes(space));
        });
    };
    AthenaConstructionSite.prototype.removeTile = function (tile) {
        var _a;
        (_a = document.getElementById("market-tile-".concat(tile.id))) === null || _a === void 0 ? void 0 : _a.remove();
    };
    AthenaConstructionSite.prototype.setSelectedHex = function (tileId, hex) {
        var _a;
        Array.from(document.getElementById('athena-contruction-spaces').querySelectorAll('.selected')).forEach(function (option) { return option.classList.remove('selected'); });
        (_a = document.getElementById("market-tile-".concat(tileId))) === null || _a === void 0 ? void 0 : _a.classList.add('selected');
        if (!this.game.usePivotRotation()) {
            hex === null || hex === void 0 ? void 0 : hex.classList.add('selected');
        }
    };
    AthenaConstructionSite.prototype.completeCard = function (playerId, cardId) {
        return __awaiter(this, void 0, void 0, function () {
            var space;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        space = this.cards.findIndex(function (card) { return card.id === cardId; }) + 1;
                        return [4 /*yield*/, this.game.animationManager.attachWithAnimation(new BgaSlideAnimation({
                                element: document.querySelector("#player-statue-part-".concat(playerId, "-").concat(space, " .statue-part")),
                            }), document.getElementById("statue-".concat(playerId, "-").concat(space)))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AthenaConstructionSite;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
var TILE_SHIFT_BY_ROTATION = [
    { minX: 0, maxX: 1, minY: 0, maxY: 2, },
    { minX: -1, maxX: 0, minY: 0, maxY: 2, },
    { minX: -1, maxX: 0, minY: -1, maxY: 1, },
    { minX: -1, maxX: 0, minY: -2, maxY: 0, },
    { minX: 0, maxX: 1, minY: -2, maxY: 0, },
    { minX: 0, maxX: 1, minY: 1, maxY: 1, },
];
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, lastMove) {
        var _this = this;
        this.game = game;
        this.minX = -1;
        this.maxX = 1;
        this.minY = -2;
        this.maxY = 1;
        this.playerId = Number(player.id);
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\">\n            <div class=\"name-wrapper\" style=\"color: #").concat(player.color, ";\">\n                <div class=\"pattern left\"></div>\n                <span class=\"name\">").concat(this.playerId == 0 ? _(player.name) : player.name, "</span>\n                ").concat(this.playerId == 0 ? "<span class=\"difficulty\">(".concat(this.getSoloDifficulty(player.lvl + 1), ")</span>") : '', "\n                <div class=\"pattern right\"></div>\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-frame\" class=\"frame\">\n                <div id=\"player-table-").concat(this.playerId, "-city\" class=\"city\">\n                    <!--<div class=\"flag\" style=\"--flag-color: red; top: 50%; left: 50%;\"></div>-->\n                    <div id=\"player-table-").concat(this.playerId, "-grid\" class=\"grid\">\n                        <!--<div class=\"flag\" style=\"--flag-color: blue;\"></div>-->\n                    </div>\n                </div>\n                <button type=\"button\" id=\"reset-view-").concat(this.playerId, "\" class=\"bgabutton bgabutton_gray reset-view-button\">").concat(_('Reset view'), "</button>\n            </div>\n        </div>\n        ");
        document.getElementById('tables').insertAdjacentHTML('beforeend', html);
        if (this.playerId == 0) {
            document.getElementById("player-table-".concat(this.playerId, "-frame")).insertAdjacentHTML('beforebegin', "\n            <div class=\"solo-text\">".concat(this.getSoloText(player.lvl + 1), "</div>\n            "));
        }
        this.city = document.getElementById("player-table-".concat(this.playerId, "-city"));
        this.grid = document.getElementById("player-table-".concat(this.playerId, "-grid"));
        document.getElementById("reset-view-".concat(this.playerId)).addEventListener('click', function () { return _this.game.viewManager.resetView(); });
        this.createGrid(player.board, lastMove);
        this.city.style.transform = "rotatex(" + game.control3dxaxis + "deg) translate(" + game.control3dypos + "px," + game.control3dxpos + "px) rotateZ(" + game.control3dzaxis + "deg) scale3d(" + game.control3dscale + "," + game.control3dscale + "," + game.control3dscale + ")";
        this.game.viewManager.draggableElement3d(this.city);
    }
    PlayerTable.prototype.cleanPossibleHex = function () {
        Array.from(this.grid.querySelectorAll('.possible')).forEach(function (option) { return option.parentElement.remove(); });
    };
    PlayerTable.prototype.setPlaceTileOptions = function (options, rotation) {
        var _this = this;
        this.cleanPossibleHex();
        var pivot = this.game.usePivotRotation();
        options /*.filter(option => option.r.some(r => r == rotation))*/.forEach(function (option) {
            if (pivot) {
                if (option.r && option.r.includes(0)) {
                    var pivot_1 = _this.createPossiblePivot(option.x, option.y, option.z);
                    pivot_1.addEventListener('click', function () {
                        _this.game.possiblePositionClicked(option.x, option.y, option.z);
                    });
                }
            }
            else {
                var hex = _this.createPossibleHex(option.x, option.y, option.z);
                var face = hex.getElementsByClassName('face')[0];
                face.addEventListener('click', function () {
                    _this.game.possiblePositionClicked(option.x, option.y, option.z);
                });
            }
        });
    };
    PlayerTable.prototype.placeTile = function (tile, lastMove, type, selectedHexIndex) {
        var _this = this;
        if (selectedHexIndex === void 0) { selectedHexIndex = null; }
        if (this.playerId == 0) {
            var placedTiles = this.city.querySelectorAll('.tile:not(.invisible)').length;
            var x = placedTiles % 5;
            var y = Math.floor(placedTiles / 5);
            tile.x = x * 2.5 - 5;
            tile.y = 3.5 + y * 4.5;
            tile.z = 0;
            tile.r = 0;
        }
        var tileDiv = this.game.tilesManager.createTile(tile, true, [type]);
        tileDiv.style.setProperty('--x', "".concat(tile.x));
        tileDiv.style.setProperty('--y', "".concat(tile.y));
        tileDiv.style.setProperty('--z', "".concat(tile.z));
        tileDiv.style.setProperty('--r', "".concat(tile.r));
        tileDiv.dataset.z = "".concat(tile.z % 4);
        tileDiv.dataset.selectedHexIndex = "".concat(selectedHexIndex);
        this.grid.appendChild(tileDiv);
        this.removePreviewTile();
        if (type === 'preview') {
            tile.hexes.forEach(function (hex, index) {
                var hexDiv = tileDiv.querySelector("[data-index=\"".concat(index, "\"]"));
                if (index == selectedHexIndex && !_this.game.usePivotRotation()) {
                    hexDiv.classList.add('selected');
                    hexDiv.addEventListener('click', function () { return _this.game.incRotation(); });
                }
            });
            this.previewTile = tileDiv;
        }
        else {
            this.removeInvisibleTile();
            if (type === 'invisible') {
                this.invisibleTile = tileDiv;
            }
            this.minX = Math.min(this.minX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].minX);
            this.minY = Math.min(this.minY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].minY);
            this.maxX = Math.max(this.maxX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].maxX);
            this.maxY = Math.max(this.maxY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].maxY);
            var middleX = (this.maxX + this.minX) / 2;
            var middleY = (this.maxY + this.minY) / 2;
            this.grid.style.setProperty('--x-shift', '' + middleX);
            this.grid.style.setProperty('--y-shift', '' + middleY);
        }
        if (lastMove) {
            Array.from(this.grid.getElementsByClassName('last-move')).forEach(function (elem) { return elem.classList.remove('last-move'); });
            tileDiv.classList.add('last-move');
        }
        return tileDiv;
    };
    PlayerTable.prototype.rotatePreviewTile = function (r) {
        var _a;
        (_a = this.previewTile) === null || _a === void 0 ? void 0 : _a.style.setProperty('--r', "".concat(r));
    };
    PlayerTable.prototype.removePreviewTile = function () {
        var _a;
        (_a = this.previewTile) === null || _a === void 0 ? void 0 : _a.remove();
        this.previewTile = null;
    };
    PlayerTable.prototype.removeInvisibleTile = function () {
        var _a;
        (_a = this.previewTile) === null || _a === void 0 ? void 0 : _a.remove();
        this.previewTile = null;
    };
    PlayerTable.prototype.createStartTile = function () {
        this.createTileHex(0, 0, 0, 'house-plaza');
        this.createTileHex(0, -2, 0, 'quarry');
        this.createTileHex(1, 1, 0, 'quarry');
        this.createTileHex(-1, 1, 0, 'quarry');
    };
    PlayerTable.prototype.createGrid = function (board, lastMove) {
        var _this = this;
        this.createStartTile();
        board.tiles.forEach(function (tile) { return _this.placeTile(tile, tile.id == (lastMove === null || lastMove === void 0 ? void 0 : lastMove.id), 'final'); });
    };
    PlayerTable.prototype.createTileHex = function (x, y, z, types) {
        var hex = this.game.tilesManager.createTileHex(x, y, z, types, true);
        //hex.id = `player-${this.playerId}-hex-${x}-${y}-${z}`;
        this.grid.appendChild(hex);
        //const { type, plaza } = this.game.tilesManager.hexFromString(types);
        //this.game.setTooltip(hex.id, this.game.tilesManager.getHexTooltip(type, plaza));
    };
    PlayerTable.prototype.createPossibleHex = function (x, y, z) {
        var hex = this.game.tilesManager.createPossibleHex(x, y, z);
        //hex.id = `player-${this.playerId}-possible-hex-${x}-${y}-${z}`;
        this.grid.appendChild(hex);
        return hex;
    };
    PlayerTable.prototype.createPossiblePivot = function (x, y, z) {
        var pivot = document.createElement('div');
        pivot.style.setProperty('--x', "".concat(x));
        pivot.style.setProperty('--y', "".concat(y));
        pivot.style.setProperty('--z', "".concat(z));
        pivot.classList.add('pivot');
        this.grid.appendChild(pivot);
        return pivot;
    };
    PlayerTable.prototype.getSoloDifficulty = function (level) {
        switch (level) {
            case 1: return _('Easy level');
            case 2: return _('Medium level');
            case 3: return _('Hard level');
        }
    };
    PlayerTable.prototype.getSoloText = function (level) {
        switch (level) {
            case 1: return _('All the Districts of Hippodamos are considered to be at the 1st level.');
            case 2: return _('All the Districts of Metagenes are considered to be at the 1st level. Metagenes earns 2 additional points for each Quarry he owns.');
            case 3: return _('All Callicrates Districts are considered to be at the 2nd level.');
        }
    };
    return PlayerTable;
}());
var MIN_NOTIFICATION_MS = 1200;
var TYPES = {
    0: 'quarry',
    1: 'house',
    2: 'market',
    3: 'barrack',
    4: 'temple',
    5: 'garden',
};
var HEX_QUANTITIES = {
    2: [[5, 18], [4, 12], [4, 10], [4, 8], [3, 6]],
    3: [[6, 27], [5, 16], [5, 13], [5, 10], [4, 7]],
    4: [[7, 36], [6, 20], [6, 16], [6, 12], [5, 8]],
};
var PIVOT_ROTATIONS = [
    [+1, +1],
    [0, +2],
    [-1, +1],
    [-1, -1],
    [0, -2],
    [+1, -1],
];
var PIVOT_ROTATIONS_REVERSE = [
    [0, +2],
    [-1, +1],
    [-1, -1],
    [0, -2],
    [+1, -1],
    [+1, +1],
];
var AKROPOLIS_FOLDED_HELP = 'Akropolis-FoldedHelp';
var LOCAL_STORAGE_JUMP_KEY = 'Akropolis-jump-to-folded';
function sleep(ms) {
    return new Promise(function (r) { return setTimeout(r, ms); });
}
var Akropolis = /** @class */ (function () {
    function Akropolis() {
        this.rotation = 0;
        this.playersTables = [];
        this.stonesCounters = [];
        this.hexesCounters = [];
        this.starsCounters = [];
        this.colorPointsCounters = [];
        this.pivotRotation = false;
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    Akropolis.prototype.setup = function (gamedatas) {
        var _this = this;
        log("Starting game setup");
        this.pivotRotation = window.location.href.indexOf('pivot') !== -1;
        this.gamedatas = gamedatas;
        // Setup camera controls reminder
        var reminderHtml = document.getElementsByTagName('body')[0].classList.contains('touch-device') ?
            "<div id=\"controls-reminder\">\n        ".concat(_('You can drag this block'), "\n        </div>")
            : "<div id=\"controls-reminder\">\n        <img src=\"".concat(g_gamethemeurl, "img/mouse-right.svg\"></img>\n        ").concat(_('Adjust camera with below controls or right-drag, middle-drag and scroll wheel'), "\n        </div>");
        dojo.place(reminderHtml, 'controls3d_wrap', 'first');
        log('gamedatas', gamedatas);
        this.animationManager = new AnimationManager(this);
        this.viewManager = new ViewManager(this);
        this.tilesManager = new TilesManager(this);
        this.constructionSite = new ConstructionSite(this, gamedatas.dock, gamedatas.deck / (Math.max(2, Object.keys(gamedatas.players).length) + 1));
        if (gamedatas.isAthena) {
            this.athenaConstructionSite = new AthenaConstructionSite(this, gamedatas.cards, gamedatas.cardStatuses, gamedatas.dock, Object.values(gamedatas.players));
            this.bgaAutoFit();
        }
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        var topEntries = [];
        if (gamedatas.isAthena) {
            topEntries.push(new JumpToEntry(_("Athena"), 'athena-contruction-spaces', { 'color': '#1fa7d9' }));
        }
        topEntries.push(new JumpToEntry(_("Construction Site"), 'market', { 'color': '#7e7978' }));
        var bottomEntries = [];
        if (gamedatas.soloPlayer) {
            bottomEntries.push(new JumpToEntry(_(gamedatas.soloPlayer.name), 'player-table-0', { 'color': "#".concat(gamedatas.soloPlayer.color) }));
        }
        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_KEY,
            topEntries: topEntries,
            bottomEntries: bottomEntries,
            entryClasses: 'hexa-point',
            defaultFolded: false,
        });
        document.getElementsByTagName('body')[0].addEventListener('keydown', function (e) { return _this.onKeyPress(e); });
        this.setupNotifications();
        this.setupPreferences();
        this.addHelp(gamedatas.allTiles ? 4 : Math.max(2, Object.keys(gamedatas.players).length));
        window.addEventListener('resize', function () { return _this.viewManager.fitCitiesToView(); });
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Akropolis.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'placeTile':
                this.onEnteringPlaceTile(args.args);
                break;
            case 'completeCard':
                this.onEnteringCompleteCard(args.args);
                break;
        }
    };
    Akropolis.prototype.onEnteringPlaceTile = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.selectedPosition = null;
            this.selectedTile = null;
            this.selectedTileHexIndex = null;
            this.setRotation(0);
            this.constructionSite.setSelectable(true);
            this.getCurrentPlayerTable().setPlaceTileOptions(args.options[0], this.rotation);
            this.constructionSite.setDisabledTiles(this.stonesCounters[this.getPlayerId()].getValue());
        }
    };
    Akropolis.prototype.onEnteringCompleteCard = function (args) {
        var _this = this;
        args.cardIds.forEach(function (id) { return document.getElementById("contruction-space-".concat(id)).classList.add('active'); });
        if (this.isCurrentPlayerActive()) {
            this.selectedPosition = null;
            this.selectedTile = null;
            this.selectedTileHexIndex = null;
            this.setRotation(0);
            var spaces = args.cardIds.map(function (id) { return Number(_this.gamedatas.cards.find(function (card) { return card.id === id; }).location.split('-')[1]); });
            this.athenaConstructionSite.setSelectable(spaces);
            /*this.getCurrentPlayerTable().setPlaceTileOptions(args.options[0], this.rotation);
            this.constructionSite.setDisabledTiles(this.stonesCounters[this.getPlayerId()].getValue());*/
        }
    };
    Akropolis.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'placeTile':
                this.onLeavingPlaceTile();
                break;
            case 'completeCard':
                this.onLeavingCompleteCard();
                break;
        }
    };
    Akropolis.prototype.onLeavingPlaceTile = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setPlaceTileOptions([], this.rotation);
        this.constructionSite.setSelectable(false);
    };
    Akropolis.prototype.onLeavingCompleteCard = function () {
        var _a;
        document.querySelectorAll('.athena-contruction-space.active').forEach(function (elem) { return elem.classList.remove('active'); });
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setPlaceTileOptions([], this.rotation);
        this.athenaConstructionSite.setSelectable([]);
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Akropolis.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeTile':
                    if (this.usePivotRotation()) {
                        this.addActionButton("decRotationPivot_button", "\u2B6F", function () { return _this.decRotationPivot(); });
                        this.addActionButton("incRotationPivot_button", "\u2B6E", function () { return _this.incRotationPivot(); });
                    }
                    else {
                        this.addActionButton("decRotation_button", "\u2939", function () { return _this.decRotation(); });
                        this.addActionButton("incRotation_button", "\u2938", function () { return _this.incRotation(); });
                    }
                    this.addActionButton("placeTile_button", _('Confirm'), function () { return _this.placeTile(); });
                    this.addActionButton("cancelPlaceTile_button", _('Cancel'), function () { return _this.cancelPlaceTile(); }, null, null, 'gray');
                    ["placeTile_button", "cancelPlaceTile_button"].forEach(function (id) { return document.getElementById(id).classList.add('disabled'); });
                    this.updateRotationButtonState();
                    break;
                case 'completeCard':
                    if (this.usePivotRotation()) {
                        this.addActionButton("decRotationPivot_button", "\u2B6F", function () { return _this.decRotationPivot(); });
                        this.addActionButton("incRotationPivot_button", "\u2B6E", function () { return _this.incRotationPivot(); });
                    }
                    else {
                        this.addActionButton("decRotation_button", "\u2939", function () { return _this.decRotation(); });
                        this.addActionButton("incRotation_button", "\u2938", function () { return _this.incRotation(); });
                    }
                    this.addActionButton("placeTile_button", _('Confirm'), function () { return _this.placeTile(); });
                    this.addActionButton("cancelPlaceTile_button", _('Cancel'), function () { return _this.cancelPlaceTile(); }, null, null, 'gray');
                    ["placeTile_button", "cancelPlaceTile_button"].forEach(function (id) { return document.getElementById(id).classList.add('disabled'); });
                    this.updateRotationButtonState();
                    this.addActionButton("skip_button", _('Skip'), function () { return _this.bgaPerformAction('actSkipCompleteCard'); }, null, null, 'gray');
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    Akropolis.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    };
    Akropolis.prototype.setTooltipToClass = function (className, html) {
        this.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    };
    Akropolis.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    Akropolis.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
    };
    Akropolis.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === playerId; });
    };
    Akropolis.prototype.getCurrentPlayerTable = function () {
        var _this = this;
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === _this.getPlayerId(); });
    };
    Akropolis.prototype.setupPreferences = function () {
        var _this = this;
        // Extract the ID and value from the UI control
        var onchange = function (e) {
            var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
            if (!match) {
                return;
            }
            var prefId = +match[1];
            var prefValue = +e.target.value;
            _this.prefs[prefId].value = prefValue;
            _this.onPreferenceChange(prefId, prefValue);
        };
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        // Call onPreferenceChange() now
        dojo.forEach(dojo.query("#ingame_menu_content .preference_control"), function (el) { return onchange({ target: el }); });
    };
    Akropolis.prototype.onPreferenceChange = function (prefId, prefValue) {
        switch (prefId) {
            case 201:
                document.getElementsByTagName('html')[0].classList.toggle('tile-level-colors', prefValue == 2);
                break;
            case 203:
                document.getElementById("market").classList.toggle('left-to-right', prefValue != 2);
                break;
            case 204:
                document.getElementsByTagName('html')[0].classList.toggle('animated-opacity', prefValue == 2);
                break;
            case 206:
                document.getElementsByTagName('html')[0].dataset.background = prefValue == 2 ? 'dark' : (prefValue == 1 ? 'light' : 'auto');
                break;
        }
    };
    Akropolis.prototype.usePivotRotation = function () {
        /*const playersIds = Object.keys(this.gamedatas.players).map(val => +val);
        return (playersIds.length == 1 && [
            2343492, // thoun studio
            86175279, // thoun BGA
            2322020, // tisaac studio
            83846198, // tisaac BGA
            84834479, // jules
        ].includes(playersIds[0]));*/
        return this.pivotRotation;
    };
    Akropolis.prototype.getOrderedPlayers = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.no - b.no; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    Akropolis.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players);
        var soloPlayer = gamedatas.soloPlayer;
        if (soloPlayer) {
            dojo.place("\n            <div id=\"overall_player_board_0\" class=\"player-board current-player-board\">\t\t\t\t\t\n                <div class=\"player_board_inner\" id=\"player_board_inner_982fff\">\n                    \n                    <div class=\"emblemwrap\" id=\"avatar_active_wrap_0\">\n                        <img src=\"".concat(g_gamethemeurl, "img/gear.png\" alt=\"\" class=\"avatar avatar_active\" id=\"avatar_active_0\" />\n                    </div>\n                                               \n                    <div class=\"player-name\" id=\"player_name_0\">\n                        ").concat(_(soloPlayer.name), "\n                    </div>\n                    <div id=\"player_board_0\" class=\"player_board_content\">\n                        <div class=\"player_score\">\n                            <span id=\"player_score_0\" class=\"player_score_value\">0</span> <i class=\"fa fa-star\" id=\"icon_point_0\"></i>           \n                        </div>\n                    </div>\n                </div>\n            </div>"), "overall_player_board_".concat(players[0].id), 'after');
            var soloScoreCounter = new ebg.counter();
            soloScoreCounter.create("player_score_0");
            soloScoreCounter.setValue(soloPlayer.score);
            this.scoreCtrl[0] = soloScoreCounter;
        }
        (soloPlayer ? __spreadArray(__spreadArray([], players, true), [gamedatas.soloPlayer], false) : players).forEach(function (player) {
            var _a;
            var playerId = Number(player.id);
            // Stones counter
            dojo.place("<div class=\"counters\">\n                <div id=\"stones-counter-wrapper-".concat(player.id, "\" class=\"stones-counter\">\n                    <div id=\"stones-icon-").concat(player.id, "\" class=\"stone score-icon\"></div> \n                    <span id=\"stones-counter-").concat(player.id, "\"></span>\n                </div>\n                <div id=\"first-player-token-wrapper-").concat(player.id, "\" class=\"first-player-token-wrapper\"></div>\n            </div>\n            <div class=\"scores-and-statue\">\n                <div id=\"scores-").concat(player.id, "\"></div> \n                <div id=\"statue-").concat(player.id, "\"></div>\n            </div>"), "player_board_".concat(player.id));
            if (gamedatas.firstPlayerId == playerId) {
                dojo.place("<div id=\"first-player-token\" class=\"first-player-token\"></div>", "first-player-token-wrapper-".concat(player.id));
            }
            var stonesCounter = new ebg.counter();
            stonesCounter.create("stones-counter-".concat(playerId));
            stonesCounter.setValue(player.money);
            _this.stonesCounters[playerId] = stonesCounter;
            var someVariants = gamedatas.activatedVariants.length > 0;
            var showScores = Boolean(player.board.scores);
            _this.hexesCounters[playerId] = [];
            _this.starsCounters[playerId] = [];
            _this.colorPointsCounters[playerId] = [];
            var _loop_2 = function (i) {
                var html = "<div class=\"counters ".concat(!showScores && !someVariants ? 'hide-live-scores' : '', "\" id=\"color-points-").concat(i, "-counter-border-").concat(player.id, "\">\n                    <div id=\"color-points-").concat(i, "-counter-wrapper-").concat(player.id, "\" class=\"color-points-counter\">\n                        <span class=\"").concat(!showScores ? 'hide-live-scores' : '', "\">\n                        <div class=\"score-icon star\" data-type=\"").concat(i, "\"></div> \n                        <span id=\"stars-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        <span class=\"multiplier\">\u00D7</span>\n                        </span>\n                        <div class=\"score-icon\" data-type=\"").concat(i, "\"></div> \n                        <span class=\"").concat(!showScores ? 'hide-live-scores' : '', "\">\n                        <span id=\"hexes-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        <span class=\"multiplier\">=</span>\n                        <span id=\"color-points-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        </span>\n                    </div>\n                </div>");
                dojo.place(html, "scores-".concat(player.id));
                var starKey = showScores ? Object.keys(player.board.scores.stars).find(function (key) { return key.startsWith(TYPES[i]); }) : null;
                var starCounter = new ebg.counter();
                starCounter.create("stars-".concat(i, "-counter-").concat(playerId));
                starCounter.setValue(showScores ? player.board.scores.stars[starKey] : 0);
                _this.starsCounters[playerId][i] = starCounter;
                var hexKey = showScores ? Object.keys(player.board.scores.districts).find(function (key) { return key.startsWith(TYPES[i]); }) : null;
                var hexCounter = new ebg.counter();
                hexCounter.create("hexes-".concat(i, "-counter-").concat(playerId));
                hexCounter.setValue(showScores ? player.board.scores.districts[hexKey] : 0);
                _this.hexesCounters[playerId][i] = hexCounter;
                var colorPointsCounter = new ebg.counter();
                colorPointsCounter.create("color-points-".concat(i, "-counter-").concat(playerId));
                colorPointsCounter.setValue(starCounter.getValue() * hexCounter.getValue());
                _this.colorPointsCounters[playerId][i] = colorPointsCounter;
                if (showScores) {
                    setTimeout(function () { return _this.setPlayerScore(playerId, player.board.scores.score); }, 100);
                }
                var activated = gamedatas.activatedVariants.some(function (variant) { return variant.startsWith(TYPES[i]); });
                if (someVariants) {
                    document.getElementById("color-points-".concat(i, "-counter-border-").concat(player.id)).style.setProperty('--border-color', activated ? 'darkgreen' : 'darkred');
                }
                var tooltip = "".concat(_('Score for this color (number of valid districts multiplied by matching stars)'), "\n                <br><br>\n                <strong>").concat(_this.tilesManager.getTypeTitle(TYPES[i]), "</strong><br>\n                ").concat(_this.tilesManager.getScoreCondition(TYPES[i]));
                if (someVariants) {
                    tooltip += "<br><br>\n                    <strong>".concat(_('Variant'), "</strong><br>\n                    ").concat(_('Activated:'), " <strong style=\"color: ").concat(activated ? 'darkgreen' : 'darkred', ";\">").concat(activated ? _('Yes') : _('No'), "</strong><br>\n                    ").concat(_(_this.tilesManager.getVariantTooltip(TYPES[i])));
                }
                _this.setTooltip("color-points-".concat(i, "-counter-border-").concat(player.id), tooltip);
            };
            for (var i = (playerId == 0 && player.lvl == 1 ? 0 : 1); i <= 5; i++) {
                _loop_2(i);
            }
            if (playerId > 0 && gamedatas.isAthena) {
                var _loop_3 = function (space) {
                    var card = gamedatas.cards.find(function (card) { return card.location === "athena-".concat(space); });
                    var statuePartDone = ((_a = gamedatas.cardStatuses[playerId]) !== null && _a !== void 0 ? _a : []).includes(card.id);
                    var html = "\n                    <div id=\"statue-".concat(player.id, "-").concat(space, "\">\n                        ").concat(statuePartDone ? "<div class=\"statue-part\" data-part=\"".concat(space, "\"></div>") : '', "\n                    </div>");
                    dojo.place(html, "statue-".concat(player.id));
                };
                for (var space = 1; space <= 4; space++) {
                    _loop_3(space);
                }
            }
        });
        this.setTooltipToClass('stones-counter', _('Number of stones'));
        this.setTooltipToClass("player_score_value", _('The sum of the score for each color, plus 1 point for each stone'));
    };
    Akropolis.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
        if (gamedatas.soloPlayer) {
            var table = new PlayerTable(this, gamedatas.soloPlayer, gamedatas.lastMoves[0]);
            this.playersTables.push(table);
        }
    };
    Akropolis.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId], gamedatas.lastMoves[playerId]);
        this.playersTables.push(table);
    };
    Akropolis.prototype.addHelp = function (playerCount) {
        var _this = this;
        var _a;
        var labels = "<div class=\"quantities-table plazza\">".concat(HEX_QUANTITIES[playerCount].map(function (quantities) { return "<div><span>".concat(quantities[0], "</span></div>"); }).join(''), "</div>");
        labels += "<div class=\"quantities-table district\">".concat(HEX_QUANTITIES[playerCount].map(function (quantities) { return "<div><span>".concat(quantities[1], "</span></div>"); }).join(''), "</div>");
        labels += "<div class=\"label-table\">".concat([1, 2, 3, 4, 5].map(function (i) { return "<div>".concat(_this.tilesManager.getScoreCondition(TYPES[i]), "</div>"); }).join(''), "</div>");
        labels += "<div class=\"fake-close\"><div class=\"fake-close-dash\"></div></div>";
        dojo.place("\n            <button id=\"quantities-help-button\" data-folded=\"".concat((_a = localStorage.getItem(AKROPOLIS_FOLDED_HELP)) !== null && _a !== void 0 ? _a : 'false', "\">").concat(labels, "</button>\n        "), 'left-side');
        var helpButton = document.getElementById('quantities-help-button');
        helpButton.addEventListener('click', function () {
            helpButton.dataset.folded = helpButton.dataset.folded == 'true' ? 'false' : 'true';
            localStorage.setItem(AKROPOLIS_FOLDED_HELP, helpButton.dataset.folded);
        });
        this.setTooltip('quantities-help-button', _('Plazzas / District quantities'));
    };
    Akropolis.prototype.onKeyPress = function (event) {
        var _a;
        if (['TEXTAREA', 'INPUT'].includes(event.target.nodeName) || !this.isCurrentPlayerActive()) {
            return;
        }
        var pivot = this.usePivotRotation();
        var canRotate = pivot ? true : ((_a = this.selectedTile) === null || _a === void 0 ? void 0 : _a.hexes.length) === 1 || !(this.selectedPosition && this.getSelectedPositionOption().r.length <= 1);
        var canConfirmCancel = this.selectedPosition;
        switch (event.key) { // event.keyCode
            case ' ': // 32
            case 'Space': // 32
            case 'Tab': // 9
            case 'Shift': // 16
            case 'Control': // 17
            case 'ArrowRight': // 39
            case 'ArrowDown': // 40
                if (canRotate) {
                    pivot ? this.incRotationPivot() : this.incRotation();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                break;
            case 'Alt': // 18            
            case 'ArrowUp': // 38
            case 'ArrowLeft': // 37
                if (canRotate) {
                    pivot ? this.decRotationPivot() : this.decRotation();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                break;
            case 'Enter': // 13
                if (canConfirmCancel) {
                    this.placeTile();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                break;
            case 'Escape': // 27
                if (canConfirmCancel) {
                    this.cancelPlaceTile();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                break;
        }
    };
    Akropolis.prototype.setPlayerScore = function (playerId, score) {
        if (this.scoreCtrl[playerId]) {
            this.scoreCtrl[playerId].toValue(score);
        }
        else {
            document.getElementById("player_score_".concat(playerId)).innerHTML = '' + score;
        }
    };
    Akropolis.prototype.updateScores = function (playerId, scores) {
        Array.from(document.querySelectorAll('.hide-live-scores')).forEach(function (element) { return element.classList.remove('hide-live-scores'); });
        var _loop_4 = function (i) {
            var type = TYPES[i];
            var starKey = Object.keys(scores.stars).find(function (key) { return key.startsWith(type); });
            var hexKey = Object.keys(scores.districts).find(function (key) { return key.startsWith(type); });
            this_1.starsCounters[playerId][i].toValue(scores.stars[starKey]);
            this_1.hexesCounters[playerId][i].toValue(scores.districts[hexKey]);
            this_1.colorPointsCounters[playerId][i].toValue(this_1.starsCounters[playerId][i].getValue() * this_1.hexesCounters[playerId][i].getValue());
        };
        var this_1 = this;
        for (var i = (playerId == 0 && this.gamedatas.soloPlayer.lvl == 1 ? 0 : 1); i <= 5; i++) {
            _loop_4(i);
        }
        ;
        this.setPlayerScore(playerId, scores.score);
    };
    Akropolis.prototype.constructionSiteHexClicked = function (tile, hexIndex, hex, rotation) {
        if (hex.classList.contains('selected')) {
            this.incRotation();
            return;
        }
        var pivot = this.usePivotRotation();
        if (pivot && tile == this.selectedTile) {
            return;
        }
        this.selectedTile = tile;
        this.selectedTileHexIndex = hexIndex;
        if (this.gamedatas.gamestate.name === 'completeCard') {
            this.athenaConstructionSite.setSelectedHex(tile.id, hex);
        }
        else {
            this.constructionSite.setSelectedHex(tile.id, hex);
        }
        this.setRotation(rotation);
        if (this.selectedPosition) {
            var option = this.getSelectedPositionOption();
            if (option.r && !option.r.includes(this.rotation)) {
                this.setRotation(this.findClosestRotation(option.r));
            }
            var tileCoordinates = TILE_COORDINATES[hexIndex];
            this.getCurrentPlayerTable().placeTile(__assign(__assign({}, this.selectedTile), { x: this.selectedPosition.x - tileCoordinates[0], y: this.selectedPosition.y - tileCoordinates[1], z: this.selectedPosition.z, r: this.rotation }), true, 'preview', this.selectedTileHexIndex);
        }
        this.updateRotationButtonState();
    };
    Akropolis.prototype.findClosestRotation = function (rotations) {
        var _this = this;
        var minDistance = 999;
        var minIndex = 0;
        rotations.forEach(function (r, index) {
            var distance = Math.min(Math.abs(_this.rotation - r), Math.abs(_this.rotation + 6 - r));
            if (distance < minDistance) {
                minDistance = distance;
                minIndex = index;
            }
        });
        return rotations[minIndex];
    };
    Akropolis.prototype.getSelectedPositionOption = function () {
        var _this = this;
        if (this.gamedatas.gamestate.name === 'completeCard') {
            return this.gamedatas.gamestate.args.options.find(function (o) {
                return o.x == _this.selectedPosition.x && o.y == _this.selectedPosition.y && o.z == _this.selectedPosition.z;
            });
        }
        else {
            return this.gamedatas.gamestate.args.options[this.selectedTileHexIndex].find(function (o) {
                return o.x == _this.selectedPosition.x && o.y == _this.selectedPosition.y && o.z == _this.selectedPosition.z;
            });
        }
    };
    Akropolis.prototype.possiblePositionClicked = function (x, y, z) {
        if (!this.selectedTile) {
            return;
        }
        var pivot = this.usePivotRotation();
        if (pivot && this.selectedPosition != null) {
            console.log(x, y, z, this.rotation, this.selectedPosition);
            if (this.selectedPosition.x == x && this.selectedPosition.y == y && this.selectedPosition.z == z) {
                this.incRotationPivot();
                console.log('possiblePositionClicked pivot, return');
                return;
            }
        }
        this.selectedPosition = { x: x, y: y, z: z };
        var option = this.getSelectedPositionOption();
        if (option.r && !option.r.includes(this.rotation) && !pivot) {
            this.setRotation(this.findClosestRotation(option.r));
        }
        var tileCoordinates = TILE_COORDINATES[this.selectedTileHexIndex];
        this.getCurrentPlayerTable().placeTile(__assign(__assign({}, this.selectedTile), { x: this.selectedPosition.x - tileCoordinates[0], y: this.selectedPosition.y - tileCoordinates[1], z: this.selectedPosition.z, r: this.rotation }), true, 'preview', this.selectedTileHexIndex);
        ["placeTile_button", "cancelPlaceTile_button"].forEach(function (id) { return document.getElementById(id).classList.remove('disabled'); });
        this.updateRotationButtonState();
    };
    Akropolis.prototype.decRotation = function () {
        var _this = this;
        if (this.selectedPosition && this.gamedatas.gamestate.name !== 'completeCard') {
            var option = this.getSelectedPositionOption();
            var index = option.r.findIndex(function (r) { return r == _this.rotation; });
            if (index !== -1 && option.r.length > 1) {
                this.setRotation(option.r[index == 0 ? option.r.length - 1 : index - 1]);
            }
        }
        else {
            this.setRotation(this.rotation == 0 ? 5 : this.rotation - 1);
        }
    };
    Akropolis.prototype.incRotation = function () {
        var _this = this;
        if (this.selectedPosition && this.gamedatas.gamestate.name !== 'completeCard') {
            var option = this.getSelectedPositionOption();
            var index = option.r.findIndex(function (r) { return r == _this.rotation; });
            if (index !== -1 && option.r.length > 1) {
                this.setRotation(option.r[index == option.r.length - 1 ? 0 : index + 1]);
            }
        }
        else {
            this.setRotation(this.rotation == 5 ? 0 : this.rotation + 1);
        }
    };
    Akropolis.prototype.setRotation = function (rotation) {
        while (rotation < 0) {
            rotation += 6;
        }
        rotation %= 6;
        this.rotation = rotation;
        if (this.selectedTile) {
            if (this.gamedatas.gamestate.name === 'completeCard') {
                this.athenaConstructionSite.setRotation(rotation, this.selectedTile);
            }
            else {
                this.constructionSite.setRotation(rotation, this.selectedTile);
            }
        }
        if (!this.selectedPosition) {
            if (this.gamedatas.gamestate.name === 'completeCard') {
                this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
            }
            else {
                this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options[0], this.rotation);
            }
        }
        this.getCurrentPlayerTable().rotatePreviewTile(this.rotation);
    };
    Akropolis.prototype.decRotationPivot = function () {
        this.changeRotationPivot(-1);
    };
    Akropolis.prototype.incRotationPivot = function () {
        this.changeRotationPivot(+1);
    };
    Akropolis.prototype.changeRotationPivot = function (direction) {
        var rotation = this.rotation;
        while (rotation < 0) {
            rotation += 6;
        }
        var pivotRotation = (direction == -1 ? PIVOT_ROTATIONS_REVERSE : PIVOT_ROTATIONS)[(rotation + (this.selectedTileHexIndex * 2)) % 6];
        this.possiblePositionClicked(this.selectedPosition.x + pivotRotation[0], this.selectedPosition.y + pivotRotation[1], this.selectedPosition.z);
        this.setRotation(rotation + direction * 2);
    };
    Akropolis.prototype.cancelPlaceTile = function () {
        ["placeTile_button", "cancelPlaceTile_button"].forEach(function (id) { return document.getElementById(id).classList.add('disabled'); });
        this.selectedPosition = null;
        this.getCurrentPlayerTable().removePreviewTile();
        if (this.gamedatas.gamestate.name === 'completeCard') {
            this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
        }
        else {
            this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options[0], this.rotation);
        }
        this.updateRotationButtonState();
    };
    Akropolis.prototype.updateRotationButtonState = function () {
        var _a;
        var cannotRotate = this.selectedTile ? (this.selectedTile.hexes.length > 1 && this.selectedPosition && ((_a = this.getSelectedPositionOption()) === null || _a === void 0 ? void 0 : _a.r.length) <= 1) : true;
        ["decRotation_button", "incRotation_button"].forEach(function (id) { var _a; return (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', cannotRotate); });
    };
    Akropolis.prototype.placeTile = function () {
        var _this = this;
        var _a, _b;
        if (this.gamedatas.gamestate.name === 'completeCard') {
            if (!this.checkAction('actCompleteCard')) {
                return;
            }
            (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.cleanPossibleHex();
            this.takeAction('actCompleteCard', {
                x: this.selectedPosition.x,
                y: this.selectedPosition.y,
                z: this.selectedPosition.z,
                r: this.rotation,
                tileId: this.selectedTile.id,
                cardId: this.gamedatas.cards.find(function (card) { return card.location === _this.selectedTile.location; }).id,
            });
        }
        else {
            if (!this.checkAction('actPlaceTile')) {
                return;
            }
            (_b = this.getCurrentPlayerTable()) === null || _b === void 0 ? void 0 : _b.cleanPossibleHex();
            this.takeAction('actPlaceTile', {
                x: this.selectedPosition.x,
                y: this.selectedPosition.y,
                z: this.selectedPosition.z,
                r: this.rotation,
                tileId: this.selectedTile.id,
                hex: this.selectedTileHexIndex,
            });
        }
    };
    Akropolis.prototype.takeAction = function (action, data) {
        this.bgaPerformAction(action, data);
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    Akropolis.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        var notifs = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (name) { return name.startsWith('notif_'); }).map(function (name) { return name.slice(6); });
        notifs.forEach(function (notifName) {
            dojo.subscribe(notifName, _this, function (notifDetails) {
                log("notif_".concat(notifName), notifDetails.args);
                var promise = _this["notif_".concat(notifName)](notifDetails.args);
                var promises = promise ? [promise] : [];
                var minDuration = 1;
                var msg = _this.format_string_recursive(notifDetails.log, notifDetails.args);
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;
                    $('generalactions').innerHTML = '';
                    // If there is some text, we let the message some time, to be read 
                    minDuration = MIN_NOTIFICATION_MS;
                }
                // tell the UI notification ends, if the function returned a promise. 
                if (_this.animationManager.animationsActive()) {
                    Promise.all(__spreadArray(__spreadArray([], promises, true), [sleep(minDuration)], false)).then(function () { return _this.notifqueue.onSynchronousNotificationEnd(); });
                }
                else {
                    _this.notifqueue.setSynchronousDuration(0);
                }
            });
            _this.notifqueue.setSynchronous(notifName, undefined);
        });
    };
    Akropolis.prototype.notif_placedTile = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerTable, tile, invisibleTile;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerTable = this.getPlayerTable(args.tile.pId);
                        tile = args.tile;
                        playerTable.removePreviewTile();
                        invisibleTile = playerTable.placeTile(tile, false, 'invisible');
                        return [4 /*yield*/, this.constructionSite.animateTileTo(tile, invisibleTile).then(function () {
                                playerTable.placeTile(tile, true, 'final');
                                if (tile.hexes.length === 1) {
                                    _this.athenaConstructionSite.removeTile(tile);
                                }
                                else {
                                    _this.constructionSite.removeTile(tile);
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Akropolis.prototype.notif_completeCard = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var player_id, card;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        player_id = args.player_id, card = args.card;
                        return [4 /*yield*/, this.athenaConstructionSite.completeCard(player_id, card.id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Akropolis.prototype.notif_pay = function (args) {
        this.stonesCounters[args.player_id].incValue(-args.cost);
    };
    Akropolis.prototype.notif_gainStones = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, n, origin_1, animated, lastTile, promises, _loop_5, this_2, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerId = args.player_id;
                        n = +args.n;
                        this.stonesCounters[playerId].incValue(n);
                        if (!(playerId == 0)) return [3 /*break*/, 2];
                        origin_1 = document.getElementById("stones-icon-".concat(this.gamedatas.playerorder[0]));
                        animated = document.createElement('div');
                        animated.classList.add('stone', 'score-icon', 'animated');
                        document.getElementById("stones-icon-".concat(playerId)).appendChild(animated);
                        return [4 /*yield*/, this.animationManager.play(new BgaSlideAnimation({
                                element: animated,
                                fromElement: origin_1,
                            }))];
                    case 1:
                        _a.sent();
                        animated.remove();
                        return [3 /*break*/, 6];
                    case 2:
                        lastTile = document.getElementById("player-table-".concat(playerId, "-grid")).getElementsByClassName('last-move')[0];
                        if (!lastTile) return [3 /*break*/, 6];
                        promises = [];
                        _loop_5 = function (i) {
                            var origin_2, animated;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        origin_2 = lastTile.getElementsByClassName('hex')[i];
                                        animated = document.createElement('div');
                                        animated.classList.add('stone', 'score-icon', 'animated');
                                        document.getElementById("stones-icon-".concat(playerId)).appendChild(animated);
                                        promises.push(this_2.animationManager.play(new BgaSlideAnimation({
                                            element: animated,
                                            fromElement: origin_2,
                                        })).then(function () { return animated.remove(); }));
                                        return [4 /*yield*/, Promise.all(promises)];
                                    case 1:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < n)) return [3 /*break*/, 6];
                        return [5 /*yield**/, _loop_5(i)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Akropolis.prototype.notif_refillDock = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.constructionSite.refill(args.dock, args.deck / (Math.max(2, Object.keys(this.gamedatas.players).length) + 1))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Akropolis.prototype.notif_updateFirstPlayer = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var firstPlayerToken, destinationId, originId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        firstPlayerToken = document.getElementById('first-player-token');
                        destinationId = "first-player-token-wrapper-".concat(args.pId);
                        originId = firstPlayerToken.parentElement.id;
                        if (!(destinationId !== originId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.animationManager.attachWithAnimation(new BgaSlideAnimation({
                                element: firstPlayerToken,
                                zoom: 1,
                            }), document.getElementById(destinationId))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Akropolis.prototype.notif_updateScores = function (args) {
        this.updateScores(args.player_id, args.scores);
    };
    Akropolis.prototype.notif_automataDelay = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sleep(2000)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* @Override */
    Akropolis.prototype.change3d = function (incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset) {
        this.viewManager.change3d(incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset);
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    Akropolis.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    /**
     * Auto-scale the content of divs with a `bga-autofit` class. Those divs should have a fixed width and height.
     * @param settings settings, width default : { scaleStep: 0.05, minScale: 0.1 }
     */
    Akropolis.prototype.bgaAutoFit = function (settings) {
        if (settings === void 0) { settings = {}; }
        settings = __assign({ scaleStep: 0.05, minScale: 0.1 }, settings);
        // apply an automatic scaling for each element with `bga-autofit` class
        document.querySelectorAll('.bga-autofit').forEach(function (element) {
            // we get (or create) the inner div, that will contain the resized content
            var inner = element.querySelector('.bga-autofit__inner');
            if (!inner) {
                inner = document.createElement('div');
                inner.classList.add('bga-autofit__inner');
                while (element.childNodes.length > 0) {
                    inner.appendChild(element.childNodes[0]);
                }
                element.appendChild(inner);
            }
            var scale = 1;
            var outerWidth = element.clientWidth;
            element.style.setProperty('--autofit-scale', "".concat(scale)); // reset, in case there was a font reloading when bgaAutoFit was called again, and scale needs to go back up
            // while the inner element is of a bigger height than the element, make it smaller
            while (scale > settings.minScale && inner.clientHeight * scale > element.clientHeight) {
                scale -= settings.scaleStep;
                element.style.setProperty('--autofit-scale', "".concat(scale));
                element.style.setProperty('--autofit-inner-width', "".concat(outerWidth / scale, "px"));
            }
        });
    };
    return Akropolis;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.akropolisathena", ebg.core.gamegui, new Akropolis());
});
