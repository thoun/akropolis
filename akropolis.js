/**
 * Linear slide of the card from origin to destination.
 *
 * @param element the element to animate. The element should be attached to the destination element before the animation starts.
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function slideAnimation(element, settings) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        // should be checked at the beginning of every animation
        if (!shouldAnimate(settings)) {
            success(false);
            return promise;
        }
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg)");
        (_d = settings.animationStart) === null || _d === void 0 ? void 0 : _d.call(settings, element);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            var _a;
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            (_a = settings.animationEnd) === null || _a === void 0 ? void 0 : _a.call(settings, element);
            success(true);
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
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = (_e = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _e !== void 0 ? _e : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
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
function logAnimation(element, settings) {
    console.log(element, element.getBoundingClientRect(), element.style.transform, settings);
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
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
    }
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param element the element to animate
     * @param toElement the destination parent
     * @param fn the animation function
     * @param settings the animation settings
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (element, toElement, fn, settings) {
        var _a, _b, _c, _d, _e, _f;
        var fromRect = element.getBoundingClientRect();
        toElement.appendChild(element);
        (_a = settings === null || settings === void 0 ? void 0 : settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, toElement);
        return (_f = fn(element, __assign(__assign({ duration: (_c = (_b = this.settings) === null || _b === void 0 ? void 0 : _b.duration) !== null && _c !== void 0 ? _c : 500, scale: (_e = (_d = this.zoomManager) === null || _d === void 0 ? void 0 : _d.zoom) !== null && _e !== void 0 ? _e : undefined }, settings !== null && settings !== void 0 ? settings : {}), { game: this.game, fromRect: fromRect }))) !== null && _f !== void 0 ? _f : Promise.resolve(false);
    };
    /**
     * Attach an element to a parent with a slide animation.
     *
     * @param card the card informations
     */
    AnimationManager.prototype.attachWithSlideAnimation = function (element, toElement, settings) {
        return this.attachWithAnimation(element, toElement, slideAnimation, settings);
    };
    /**
     * Attach an element to a parent with a slide animation.
     *
     * @param card the card informations
     */
    AnimationManager.prototype.attachWithShowToScreenAnimation = function (element, toElement, settingsOrSettingsArray) {
        var _this = this;
        var cumulatedAnimation = function (element, settings) { return cumulatedAnimations(element, [
            showScreenCenterAnimation,
            pauseAnimation,
            function (element) { return _this.attachWithSlideAnimation(element, toElement); },
        ], settingsOrSettingsArray); };
        return this.attachWithAnimation(element, toElement, cumulatedAnimation, null);
    };
    /**
     * Slide from an element.
     *
     * @param element the element to animate
     * @param fromElement the origin element
     * @param settings the animation settings
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.slideFromElement = function (element, fromElement, settings) {
        var _a, _b, _c, _d, _e;
        return (_e = slideAnimation(element, __assign(__assign({ duration: (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 500, scale: (_d = (_c = this.zoomManager) === null || _c === void 0 ? void 0 : _c.zoom) !== null && _d !== void 0 ? _d : undefined }, settings !== null && settings !== void 0 ? settings : {}), { game: this.game, fromElement: fromElement }))) !== null && _e !== void 0 ? _e : Promise.resolve(false);
    };
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
    return AnimationManager;
}());
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
        (_a = tileDiv.classList).add.apply(_a, __spreadArray(['tile'], classes, false));
        var firstHex = null; // temp
        tile.hexes.forEach(function (hex, index) {
            var hexDiv = _this.createTileHex(TILE_COORDINATES[index][0], TILE_COORDINATES[index][1], 0, hex, withSides);
            hexDiv.dataset.index = "".concat(index);
            if (index == 0) {
                firstHex = hexDiv;
            } // temp
            tileDiv.appendChild(hexDiv);
        });
        return tileDiv;
    };
    TilesManager.prototype.getHexTooltip = function (type, plaza) {
        if (plaza) {
            return "<strong>".concat(_('Plazas'), "</strong>\n            <br><br>\n            ").concat(_("Plazas will multiply the points that you gain for Districts of the same type at the end of the game. The multipliers are represented by the stars. If you have several matching Plazas, their stars are cumulative.") + "<br><br>" + _("A Plaza does not need to border Districts of the same type."));
        }
        else if (type === 'quarry') {
            return "<strong>".concat(_('Quarries'), "</strong>\n            <br><br>\n            ").concat(_("Quarries do not score any points at the end of the game, but they allow you to gain Stones. When an Architect covers a Quarry with another tile, they take 1 Stone from the reserve."));
        }
        else {
            var title = null;
            var firstLine = null;
            var secondLine = null;
            switch (type) {
                case 'house':
                    title = _('Houses');
                    firstLine = _("The citizens of your city like to live together in one large neighborhood.");
                    secondLine = _("You only earn points for Houses that are part of your largest group of adjacent Houses.");
                    break;
                case 'market':
                    title = _('Markets');
                    firstLine = _("Merchants don’t like competition, so want to be kept separate from other markets.");
                    secondLine = _("A Market must not be adjacent to any other Market.");
                    break;
                case 'barrack':
                    title = _('Barracks');
                    firstLine = _("Soldiers keep watch over your city’s borders.");
                    secondLine = _("Barracks must be placed on the edge of your city.");
                    break;
                case 'temple':
                    title = _('Temples');
                    firstLine = _("Priests attract followers from the surrounding area.");
                    secondLine = _("Temples must be completely surrounded.");
                    break;
                case 'garden':
                    title = _('Gardens');
                    firstLine = _("Parks always enhance your city.");
                    secondLine = _("There are no placement conditions on Gardens.");
                    break;
            }
            return "<strong>".concat(title, "</strong>\n                    <br><br>\n                    <i>").concat(firstLine, "</i><br>\n                    <strong>").concat(_('Score condition:'), "</strong> ").concat(secondLine, "\n                    <br><br>\n                    ").concat(_("A District constructed on a higher level of your City can earn you more points. The value of a District is defined by its construction height: a District built on the 1st level would be worth 1 point, on the 2nd level 2 points, on the 3rd level 3 points, etc."));
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
        this.elements = [];
        if (!dojo.hasClass("ebd-body", "mode_3d")) {
            dojo.addClass("ebd-body", "mode_3d");
            $("globalaction_3d").innerHTML = "2D"; // controls the upper right button
            game.control3dxaxis = 40; // rotation in degrees of x axis (it has a limit of 0 to 80 degrees in the frameword so users cannot turn it upsidedown)
            game.control3dzaxis = 0; // rotation in degrees of z axis
            game.control3dxpos = -100; // center of screen in pixels
            game.control3dypos = -50; // center of screen in pixels
            game.control3dscale = 1; // zoom level, 1 is default 2 is double normal size,
            game.control3dmode3d = true; // is the 3d enabled
        }
    }
    ViewManager.prototype.draggableElement3d = function (element) {
        var _this = this;
        this.elements.push(element);
        element.addEventListener('mousedown', function (e) { return _this.drag3dMouseDown(e); });
        element.addEventListener('mouseup', function (e) { return _this.closeDragElement3d(e); });
        element.addEventListener('mousewheel', function (e) { return _this.onMouseWheel(e); });
        element.oncontextmenu = function () { return false; };
        this.game.drag3d = element;
    };
    ViewManager.prototype.drag3dMouseDown = function (e) {
        e = e || window.event;
        if (e.which == 3) {
            dojo.stopEvent(e);
            $("ebd-body").onmousemove = dojo.hitch(this, this.elementDrag3d);
            $("pagesection_gameview").onmouseleave = dojo.hitch(this, this.closeDragElement3d);
            dojo.addClass($("pagesection_gameview"), "grabbinghand");
        }
    };
    ViewManager.prototype.elementDrag3d = function (e) {
        e = e || window.event;
        dojo.stopEvent(e);
        if (!this.isdragging) {
            this.isdragging = true;
            var viewportOffset = e.currentTarget.getBoundingClientRect();
            var x = void 0;
            if ((e.screenY - viewportOffset.top) > (3 * window.innerHeight / 4)) {
                x = e.movementX;
            }
            else {
                x = -1 * e.movementX;
            }
            this.game.change3d(e.movementY / (-10), 0, 0, x / (-10), 0, true, false);
            this.isdragging = false;
        }
    };
    ViewManager.prototype.closeDragElement3d = function (evt) {
        /* stop moving when mouse button is released:*/
        if (evt.which == 3) {
            dojo.stopEvent(evt);
            $("ebd-body").onmousemove = null;
            dojo.removeClass($("pagesection_gameview"), "grabbinghand");
        }
    };
    ViewManager.prototype.onMouseWheel = function (evt) {
        dojo.stopEvent(evt);
        var d = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail))) * 0.1;
        this.change3d(0, 0, 0, 0, d, true, false);
    };
    // override of framework function to apply 3D on each player city instead of the whole view
    ViewManager.prototype.change3d = function (incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset) {
        var _this = this;
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
            $("ingame_menu_3d_label").innerHTML = __("lang_mainsite", "3D mode");
            this.elements.forEach(function (element) { return element.style.transform = "rotatex(" + 0 + "deg) translate(" + 0 + "px," + 0 + "px) rotateZ(" + 0 + "deg)"; });
        }
        else {
            if (!dojo.hasClass("ebd-body", "mode_3d")) {
                dojo.addClass("ebd-body", "mode_3d");
            }
            dojo.addClass("ebd-body", "enableTransitions");
            $("ingame_menu_3d_label").innerHTML = __("lang_mainsite", "2D mode");
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
            if (reset == true) {
                this.game.control3dxaxis = 0;
                this.game.control3dzaxis = 0;
                this.game.control3dxpos = 0;
                this.game.control3dypos = 0;
                this.game.control3dscale = 1;
            }
            this.elements.forEach(function (element) { return element.style.transform = "rotatex(" + _this.game.control3dxaxis + "deg) translate(" + _this.game.control3dypos + "px," + _this.game.control3dxpos + "px) rotateZ(" + _this.game.control3dzaxis + "deg) scale3d(" + _this.game.control3dscale + "," + _this.game.control3dscale + "," + _this.game.control3dscale + ")"; });
        }
    };
    return ViewManager;
}());
var ConstructionSite = /** @class */ (function () {
    function ConstructionSite(game, tiles, remainingStacks) {
        this.game = game;
        this.selectionActivated = false;
        this.market = document.getElementById('market');
        this.setTiles(this.orderTiles(tiles));
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
        hex === null || hex === void 0 ? void 0 : hex.classList.add('selected');
    };
    ConstructionSite.prototype.setDisabledTiles = function (playerMoney) {
        Array.from(this.market.querySelectorAll('.disabled')).forEach(function (option) { return option.classList.remove('disabled'); });
        if (playerMoney !== null) {
            Array.from(this.market.querySelectorAll('.tile-with-cost')).forEach(function (option) { return option.classList.toggle('disabled', Number(option.dataset.cost) > playerMoney); });
        }
    };
    ConstructionSite.prototype.refill = function (tiles, remainingStacks) {
        this.setTiles(this.orderTiles(tiles));
        this.remainingStacksCounter.setValue(remainingStacks);
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
    };
    ConstructionSite.prototype.createMarketTile = function (tile) {
        var _this = this;
        var tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach(function (hex, index) {
            var hexDiv = tileDiv.querySelector("[data-index=\"".concat(index, "\"]"));
            hexDiv.addEventListener('click', function () {
                if (_this.selectionActivated) {
                    _this.game.constructionSiteHexClicked(tile, index, hexDiv);
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
    return ConstructionSite;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        this.game = game;
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\">\n            <div class=\"name-wrapper\">\n                <span class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</span>\n            </div>\n            <div class=\"frame\">\n                <div id=\"player-table-").concat(this.playerId, "-city\" class=\"city\">\n                    <div id=\"player-table-").concat(this.playerId, "-grid\" class=\"grid\"></div>\n                </div>\n            </div>\n        </div>\n        ");
        dojo.place(html, document.getElementById('tables'));
        this.city = document.getElementById("player-table-".concat(this.playerId, "-city"));
        this.grid = document.getElementById("player-table-".concat(this.playerId, "-grid"));
        this.createGrid(player.board);
        //    transform: rotateX(10deg) translate(-100px, -100px) rotateZ(0deg) scale3d(0.7, 0.7, 0.7);
        this.city.style.transform = "rotatex(" + game.control3dxaxis + "deg) translate(" + game.control3dypos + "px," + game.control3dxpos + "px) rotateZ(" + game.control3dzaxis + "deg) scale3d(" + game.control3dscale + "," + game.control3dscale + "," + game.control3dscale + ")";
        this.game.viewManager.draggableElement3d(this.city);
    }
    PlayerTable.prototype.setPlaceTileOptions = function (options, rotation) {
        var _this = this;
        // clean previous
        Array.from(this.grid.querySelectorAll('.possible')).forEach(function (option) { return option.parentElement.remove(); });
        options /*.filter(option => option.r.some(r => r == rotation))*/.forEach(function (option) {
            var hex = _this.createPossibleHex(option.x, option.y, option.z);
            var face = hex.getElementsByClassName('face')[0];
            face.addEventListener('click', function () {
                _this.game.possiblePositionClicked(option.x, option.y, option.z);
            });
        });
    };
    PlayerTable.prototype.placeTile = function (tile, preview, selectedHexIndex) {
        var _this = this;
        if (preview === void 0) { preview = false; }
        if (selectedHexIndex === void 0) { selectedHexIndex = null; }
        var tileDiv = this.game.tilesManager.createTile(tile, true, preview ? ['preview'] : []);
        tileDiv.style.setProperty('--x', "".concat(tile.x));
        tileDiv.style.setProperty('--y', "".concat(tile.y));
        tileDiv.style.setProperty('--z', "".concat(tile.z));
        tileDiv.style.setProperty('--r', "".concat(tile.r));
        tileDiv.dataset.selectedHexIndex = "".concat(selectedHexIndex);
        this.grid.appendChild(tileDiv);
        this.removeTempTile();
        if (preview) {
            tile.hexes.forEach(function (hex, index) {
                var hexDiv = tileDiv.querySelector("[data-index=\"".concat(index, "\"]"));
                if (index == selectedHexIndex) {
                    hexDiv.classList.add('selected');
                    hexDiv.addEventListener('click', function () { return _this.game.incRotation(); });
                }
                hexDiv.id = "player-".concat(_this.playerId, "-tile-").concat(tile.id, "-hex-").concat(index);
                var _a = _this.game.tilesManager.hexFromString(hex), type = _a.type, plaza = _a.plaza;
                _this.game.setTooltip(hexDiv.id, _this.game.tilesManager.getHexTooltip(type, plaza));
            });
            this.tempTile = tileDiv;
        }
    };
    PlayerTable.prototype.rotateTempTile = function (r) {
        var _a;
        (_a = this.tempTile) === null || _a === void 0 ? void 0 : _a.style.setProperty('--r', "".concat(r));
    };
    PlayerTable.prototype.removeTempTile = function () {
        var _a;
        (_a = this.tempTile) === null || _a === void 0 ? void 0 : _a.remove();
        this.tempTile = null;
    };
    PlayerTable.prototype.tileHasHex = function (tile, x, y, z) {
        return tile.z == z && TILE_COORDINATES.some(function (tileCoordinates) { return tile.x + tileCoordinates[0] == x && tile.y + tileCoordinates[1] == y; });
    };
    PlayerTable.prototype.createGrid = function (board) {
        var _this = this;
        var grid = board.grid;
        Object.keys(grid).forEach(function (x) { return Object.keys(grid[x]).forEach(function (y) { return Object.keys(grid[x][y]).forEach(function (z) {
            // we only want hexes that aren't already sent in tiles. So basically, it will be the starting tile
            if (!board.tiles.some(function (tile) { return _this.tileHasHex(tile, Number(x), Number(y), Number(z)); })) {
                _this.createTileHex(Number(x), Number(y), Number(z), grid[x][y][z]);
            }
        }); }); });
        board.tiles.forEach(function (tile) { return _this.placeTile(tile); });
    };
    PlayerTable.prototype.createTileHex = function (x, y, z, types) {
        var hex = this.game.tilesManager.createTileHex(x, y, z, types, true);
        hex.id = "player-".concat(this.playerId, "-hex-").concat(x, "-").concat(y, "-").concat(z);
        this.grid.appendChild(hex);
        var _a = this.game.tilesManager.hexFromString(types), type = _a.type, plaza = _a.plaza;
        this.game.setTooltip(hex.id, "".concat(x, ", ").concat(y, ", ").concat(z, "<br><br>") + this.game.tilesManager.getHexTooltip(type, plaza));
    };
    PlayerTable.prototype.createPossibleHex = function (x, y, z) {
        var hex = this.game.tilesManager.createPossibleHex(x, y, z);
        hex.id = "player-".concat(this.playerId, "-possible-hex-").concat(x, "-").concat(y, "-").concat(z);
        this.grid.appendChild(hex);
        this.game.setTooltip(hex.id, "".concat(x, ", ").concat(y, ", ").concat(z));
        return hex;
    };
    return PlayerTable;
}());
// Greek font used in rules : DalekPinpointBold. Free only for personal use
var Akropolis = /** @class */ (function () {
    function Akropolis() {
        this.rotation = 0;
        this.playersTables = [];
        this.stonesCounters = [];
        this.hexesCounters = [];
        this.starsCounters = [];
        this.colorPointsCounters = [];
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
        log("Starting game setup");
        this.gamedatas = gamedatas;
        // Setup camera controls reminder
        var reminderHtml = "<div id=\"controls-reminder\">\n        <img src=\"".concat(g_gamethemeurl, "img/mouse-right.svg\"></img>\n        ").concat(_('Adjust camera with below controls or right-drag and scroll wheel'), "\n        </div>");
        dojo.place(reminderHtml, 'controls3d_wrap', 'first');
        log('gamedatas', gamedatas);
        this.animationManager = new AnimationManager(this);
        this.viewManager = new ViewManager(this);
        this.tilesManager = new TilesManager(this);
        this.constructionSite = new ConstructionSite(this, gamedatas.dock, gamedatas.deck / (Object.keys(this.gamedatas.players).length + 1));
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        this.setupNotifications();
        this.setupPreferences();
        // this.addHelp();
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
    Akropolis.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'placeTile':
                this.onLeavingPlaceTile();
                break;
        }
    };
    Akropolis.prototype.onLeavingPlaceTile = function () {
        var _a;
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.setPlaceTileOptions([], this.rotation);
        this.constructionSite.setSelectable(false);
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Akropolis.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeTile':
                    this.addActionButton("decRotation_button", "\u2939", function () { return _this.decRotation(); });
                    this.addActionButton("incRotation_button", "\u2938", function () { return _this.incRotation(); });
                    this.addActionButton("placeTile_button", _('Confirm'), function () { return _this.placeTile(); });
                    this.addActionButton("cancelPlaceTile_button", _('Cancel'), function () { return _this.cancelPlaceTile(); }, null, null, 'gray');
                    ["placeTile_button", "cancelPlaceTile_button"].forEach(function (id) { return document.getElementById(id).classList.add('disabled'); });
                    break;
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
            /* example case 201:
                (document.getElementsByTagName('html')[0] as HTMLHtmlElement).dataset.fillingPattern = (prefValue == 2).toString();
                break;*/
        }
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
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            // Stones counter
            dojo.place("<div class=\"counters\">\n                <div id=\"stones-counter-wrapper-".concat(player.id, "\" class=\"stones-counter\">\n                    <div class=\"stone score-icon\"></div> \n                    <span id=\"stones-counter-").concat(player.id, "\"></span>\n                </div>\n                <div id=\"first-player-token-wrapper-").concat(player.id, "\" class=\"first-player-token-wrapper\"></div>\n            </div>"), "player_board_".concat(player.id));
            if (gamedatas.firstPlayerId == playerId) {
                dojo.place("<div id=\"first-player-token\" class=\"first-player-token\"></div>", "first-player-token-wrapper-".concat(player.id));
            }
            var stonesCounter = new ebg.counter();
            stonesCounter.create("stones-counter-".concat(playerId));
            stonesCounter.setValue(player.money);
            _this.stonesCounters[playerId] = stonesCounter;
            _this.hexesCounters[playerId] = [];
            _this.starsCounters[playerId] = [];
            _this.colorPointsCounters[playerId] = [];
            for (var i = 1; i <= 5; i++) {
                dojo.place("<div class=\"counters\">\n                    <div id=\"color-points-".concat(i, "-counter-wrapper-").concat(player.id, "\" class=\"color-points-counter\">\n                        <div class=\"score-icon star\" data-type=\"").concat(i, "\"></div> \n                        <span id=\"stars-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        <span class=\"multiplier\">\u00D7</span>\n                        <div class=\"score-icon\" data-type=\"").concat(i, "\"></div> \n                        <span id=\"hexes-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        <span class=\"multiplier\">=</span>\n                        <span id=\"color-points-").concat(i, "-counter-").concat(player.id, "\"></span>\n                    </div>\n                </div>"), "player_board_".concat(player.id));
                var hexCounter = new ebg.counter();
                hexCounter.create("hexes-".concat(i, "-counter-").concat(playerId));
                hexCounter.setValue(0); // TODO
                _this.hexesCounters[playerId][i] = hexCounter;
                var starCounter = new ebg.counter();
                starCounter.create("stars-".concat(i, "-counter-").concat(playerId));
                starCounter.setValue(0); // TODO
                _this.starsCounters[playerId][i] = starCounter;
                var colorPointsCounter = new ebg.counter();
                colorPointsCounter.create("color-points-".concat(i, "-counter-").concat(playerId));
                colorPointsCounter.setValue(hexCounter.getValue() * starCounter.getValue());
                _this.colorPointsCounters[playerId][i] = colorPointsCounter;
            }
        });
        this.setTooltipToClass('stones-counter', _('Number of stones'));
        this.setTooltipToClass('color-points-counter', _('Score for this color (number of valid districts multiplied by matching stars)'));
    };
    Akropolis.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
    };
    Akropolis.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    };
    Akropolis.prototype.addHelp = function () {
        var _this = this;
        dojo.place("\n            <button id=\"akropolis-help-button\">?</button>\n        ", 'left-side');
        document.getElementById('akropolis-help-button').addEventListener('click', function () { return _this.showHelp(); });
    };
    Akropolis.prototype.showHelp = function () {
        var helpDialog = new ebg.popindialog();
        helpDialog.create('akropolisHelpDialog');
        helpDialog.setTitle(_("Card details").toUpperCase());
        var html = "\n        <div id=\"help-popin\">\n            TODO\n        </div>\n        ";
        // Show the dialog
        helpDialog.setContent(html);
        helpDialog.show();
    };
    Akropolis.prototype.constructionSiteHexClicked = function (tile, hexIndex, hex) {
        if (hex.classList.contains('selected')) {
            this.incRotation();
            return;
        }
        this.selectedTile = tile;
        this.selectedTileHexIndex = hexIndex;
        this.constructionSite.setSelectedHex(tile.id, hex);
        if (this.selectedPosition) {
            var tileCoordinates = TILE_COORDINATES[hexIndex];
            this.getCurrentPlayerTable().placeTile(__assign(__assign({}, this.selectedTile), { x: this.selectedPosition.x - tileCoordinates[0], y: this.selectedPosition.y - tileCoordinates[1], z: this.selectedPosition.z, r: this.rotation }), true, this.selectedTileHexIndex);
        }
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
        return this.gamedatas.gamestate.args.options[this.selectedTileHexIndex].find(function (o) {
            return o.x == _this.selectedPosition.x && o.y == _this.selectedPosition.y && o.z == _this.selectedPosition.z;
        });
    };
    Akropolis.prototype.possiblePositionClicked = function (x, y, z) {
        if (!this.selectedTile) {
            return;
        }
        this.getCurrentPlayerTable().setPlaceTileOptions([], this.rotation);
        this.selectedPosition = { x: x, y: y, z: z };
        var option = this.getSelectedPositionOption();
        if (!option.r.includes(this.rotation)) {
            this.setRotation(this.findClosestRotation(option.r));
        }
        var tileCoordinates = TILE_COORDINATES[this.selectedTileHexIndex];
        this.getCurrentPlayerTable().placeTile(__assign(__assign({}, this.selectedTile), { x: this.selectedPosition.x - tileCoordinates[0], y: this.selectedPosition.y - tileCoordinates[1], z: this.selectedPosition.z, r: this.rotation }), true, this.selectedTileHexIndex);
        ["placeTile_button", "cancelPlaceTile_button"].forEach(function (id) { return document.getElementById(id).classList.remove('disabled'); });
    };
    Akropolis.prototype.decRotation = function () {
        var _this = this;
        if (this.selectedPosition) {
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
        if (this.selectedPosition) {
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
        this.rotation = rotation;
        document.getElementById('market').style.setProperty('--r', "".concat(rotation));
        if (!this.selectedPosition) {
            this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
        }
        this.getCurrentPlayerTable().rotateTempTile(this.rotation);
        // temp
        document.getElementById('r').innerHTML = "r = ".concat(rotation);
    };
    Akropolis.prototype.cancelPlaceTile = function () {
        ["placeTile_button", "cancelPlaceTile_button"].forEach(function (id) { return document.getElementById(id).classList.add('disabled'); });
        this.selectedPosition = null;
        this.getCurrentPlayerTable().removeTempTile();
        this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
    };
    Akropolis.prototype.placeTile = function () {
        if (!this.checkAction('actPlaceTile')) {
            return;
        }
        this.takeAction('actPlaceTile', {
            x: this.selectedPosition.x,
            y: this.selectedPosition.y,
            z: this.selectedPosition.z,
            r: this.rotation,
            tileId: this.selectedTile.id,
            hex: this.selectedTileHexIndex,
        });
    };
    Akropolis.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/akropolis/akropolis/".concat(action, ".html"), data, this, function () { });
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
        var notifs = [
            ['placedTile', 1],
            ['pay', 1],
            ['gainStones', 1],
            ['refillDock', 1],
            ['newFirstPlayer', 1],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    Akropolis.prototype.notif_placedTile = function (notif) {
        this.getPlayerTable(notif.args.tile.pId).placeTile(notif.args.tile);
        this.constructionSite.removeTile(notif.args.tile);
    };
    Akropolis.prototype.notif_pay = function (notif) {
        this.stonesCounters[notif.args.player_id].incValue(-notif.args.cost);
    };
    Akropolis.prototype.notif_gainStones = function (notif) {
        this.stonesCounters[notif.args.player_id].incValue(+notif.args.n);
    };
    Akropolis.prototype.notif_refillDock = function (notif) {
        this.constructionSite.refill(notif.args.dock, notif.args.deck / (Object.keys(this.gamedatas.players).length + 1));
    };
    Akropolis.prototype.notif_newFirstPlayer = function (notif) {
        var firstPlayerToken = document.getElementById('first-player-token');
        var destinationId = "first-player-token-wrapper-".concat(notif.args.playerId);
        var originId = firstPlayerToken.parentElement.id;
        if (destinationId !== originId) {
            this.animationManager.attachWithSlideAnimation(firstPlayerToken, document.getElementById(destinationId), { zoom: 1 });
        }
    };
    /* @Override */
    Akropolis.prototype.change3d = function (incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset) {
        this.viewManager.change3d(incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset);
        /*(this as any).control3dscale = Math.min(ZOOM_MAX, (this as any).control3dscale);
        if (arguments[4] > 0 && (this as any).control3dscale >= ZOOM_MAX) {
            arguments[4] = 0;
        }
        return (this as any).inherited(arguments);*/
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    Akropolis.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                // TODO
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return Akropolis;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.akropolis", ebg.core.gamegui, new Akropolis());
});
