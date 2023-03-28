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
    // private rotating: boolean = false;
    function ViewManager(game) {
        this.game = game;
        this.elements = [];
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
        this.setDefaultView();
        this.change3d(0, 0, 0, 0, 0, true, true);
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
        if (e.buttons == 2) {
            dojo.stopEvent(e);
            $("ebd-body").onmousemove = dojo.hitch(this, this.elementDrag3d);
            $("pagesection_gameview").onmouseleave = dojo.hitch(this, this.closeDragElement3d);
            dojo.addClass($("pagesection_gameview"), "grabbinghand");
        }
    };
    ViewManager.prototype.elementDrag3d = function (e) {
        e = e || window.event;
        dojo.stopEvent(e);
        if (e.buttons != 2) {
            $("ebd-body").onmousemove = null;
            dojo.removeClass($("pagesection_gameview"), "grabbinghand");
        }
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
            /*(this.game as any)*/ this.change3d(e.movementY / (-10), 0, 0, x / (-10), 0, true, false);
            this.isdragging = false;
        }
    };
    ViewManager.prototype.closeDragElement3d = function (evt) {
        /* stop moving when mouse button is released:*/
        if (evt.buttons == 2) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
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
        this.remainingstacksDiv = document.getElementById('remaining-stacks');
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
        var _this = this;
        var orderedTiles = this.orderTiles(tiles);
        this.setTiles(orderedTiles);
        orderedTiles.forEach(function (tile) {
            return _this.game.animationManager.slideFromElement(document.getElementById("market-tile-".concat(tile.id)), _this.remainingstacksDiv);
        });
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
var TILE_SHIFT_BY_ROTATION = [
    { minX: 0, maxX: 1, minY: 0, maxY: 2, },
    { minX: -1, maxX: 0, minY: 0, maxY: 2, },
    { minX: -1, maxX: 0, minY: -1, maxY: 1, },
    { minX: -1, maxX: 0, minY: -2, maxY: 0, },
    { minX: 0, maxX: 1, minY: -2, maxY: 0, },
    { minX: 0, maxX: 1, minY: 1, maxY: 1, },
];
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
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
        this.createGrid(player.board);
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
        this.removePreviewTile();
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
            this.previewTile = tileDiv;
        }
        else {
            this.minX = Math.min(this.minX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].minX);
            this.minY = Math.min(this.minY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].minY);
            this.maxX = Math.max(this.maxX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].maxX);
            this.maxY = Math.max(this.maxY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].maxY);
            var middleX = (this.maxX + this.minX) / 2;
            var middleY = (this.maxY + this.minY) / 2;
            this.grid.style.setProperty('--x-shift', '' + middleX);
            this.grid.style.setProperty('--y-shift', '' + middleY);
        }
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
    PlayerTable.prototype.createStartTile = function () {
        this.createTileHex(0, 0, 0, 'house-plaza');
        this.createTileHex(0, -2, 0, 'quarry');
        this.createTileHex(1, 1, 0, 'quarry');
        this.createTileHex(-1, 1, 0, 'quarry');
    };
    PlayerTable.prototype.createGrid = function (board) {
        var _this = this;
        this.createStartTile();
        board.tiles.forEach(function (tile) { return _this.placeTile(tile); });
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
        var _this = this;
        log("Starting game setup");
        this.gamedatas = gamedatas;
        // Setup camera controls reminder
        var reminderHtml = document.getElementsByTagName('body')[0].classList.contains('touch-device') ?
            "<div id=\"controls-reminder\">\n        ".concat(_('You can drag this block'), "\n        </div>")
            : "<div id=\"controls-reminder\">\n        <img src=\"".concat(g_gamethemeurl, "img/mouse-right.svg\"></img>\n        ").concat(_('Adjust camera with below controls or right-drag and scroll wheel'), "\n        </div>");
        dojo.place(reminderHtml, 'controls3d_wrap', 'first');
        log('gamedatas', gamedatas);
        this.animationManager = new AnimationManager(this);
        this.viewManager = new ViewManager(this);
        this.tilesManager = new TilesManager(this);
        this.constructionSite = new ConstructionSite(this, gamedatas.dock, gamedatas.deck / (Math.max(2, Object.keys(gamedatas.players).length) + 1));
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        document.getElementsByTagName('body')[0].addEventListener('keydown', function (e) { return _this.onKeyPress(e); });
        this.setupNotifications();
        this.setupPreferences();
        this.addHelp(gamedatas.allTiles ? 4 : Math.max(2, Object.keys(gamedatas.players).length));
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
        var players = Object.values(gamedatas.players);
        var soloPlayer = gamedatas.soloPlayer;
        if (soloPlayer) {
            dojo.place("\n            <div id=\"overall_player_board_0\" class=\"player-board current-player-board\">\t\t\t\t\t\n                <div class=\"player_board_inner\" id=\"player_board_inner_982fff\">\n                    \n                    <div class=\"emblemwrap\" id=\"avatar_active_wrap_0\">\n                        <img src=\"".concat(g_gamethemeurl, "img/gear.png\" alt=\"\" class=\"avatar avatar_active\" id=\"avatar_active_0\" />\n                    </div>\n                                               \n                    <div class=\"player-name\" id=\"player_name_0\">\n                        ").concat(_(soloPlayer.name), "\n                    </div>\n                    <div id=\"player_board_0\" class=\"player_board_content\">\n                        <div class=\"player_score\">\n                            <span id=\"player_score_0\" class=\"player_score_value\">0</span> <i class=\"fa fa-star\" id=\"icon_point_0\"></i>           \n                        </div>\n                    </div>\n                </div>\n            </div>"), "overall_player_board_".concat(players[0].id), 'after');
            var tomScoreCounter = new ebg.counter();
            tomScoreCounter.create("player_score_0");
            tomScoreCounter.setValue(soloPlayer.score);
            this.scoreCtrl[0] = tomScoreCounter;
        }
        (soloPlayer ? __spreadArray(__spreadArray([], players, true), [gamedatas.soloPlayer], false) : players).forEach(function (player) {
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
            var someVariants = gamedatas.activatedVariants.length > 0;
            var showScores = Boolean(player.board.scores);
            _this.hexesCounters[playerId] = [];
            _this.starsCounters[playerId] = [];
            _this.colorPointsCounters[playerId] = [];
            var _loop_1 = function (i) {
                var html = "<div class=\"counters ".concat(!showScores && !someVariants ? 'hide-live-scores' : '', "\" id=\"color-points-").concat(i, "-counter-border-").concat(player.id, "\">\n                    <div id=\"color-points-").concat(i, "-counter-wrapper-").concat(player.id, "\" class=\"color-points-counter\">\n                        <span class=\"").concat(!showScores ? 'hide-live-scores' : '', "\">\n                        <div class=\"score-icon star\" data-type=\"").concat(i, "\"></div> \n                        <span id=\"stars-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        <span class=\"multiplier\">\u00D7</span>\n                        </span>\n                        <div class=\"score-icon\" data-type=\"").concat(i, "\"></div> \n                        <span class=\"").concat(!showScores ? 'hide-live-scores' : '', "\">\n                        <span id=\"hexes-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        <span class=\"multiplier\">=</span>\n                        <span id=\"color-points-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        </span>\n                    </div>\n                </div>");
                dojo.place(html, "player_board_".concat(player.id));
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
                _loop_1(i);
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
            var table = new PlayerTable(this, gamedatas.soloPlayer);
            this.playersTables.push(table);
        }
    };
    Akropolis.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    };
    Akropolis.prototype.addHelp = function (playerCount) {
        var _this = this;
        var labels = "<div class=\"quantities-table plazza\">".concat(HEX_QUANTITIES[playerCount].map(function (quantities) { return "<div><span>".concat(quantities[0], "</span></div>"); }).join(''), "</div>");
        labels += "<div class=\"quantities-table district\">".concat(HEX_QUANTITIES[playerCount].map(function (quantities) { return "<div><span>".concat(quantities[1], "</span></div>"); }).join(''), "</div>");
        labels += "<div class=\"label-table\">".concat([1, 2, 3, 4, 5].map(function (i) { return "<div>".concat(_this.tilesManager.getScoreCondition(TYPES[i]), "</div>"); }).join(''), "</div>");
        dojo.place("\n            <button id=\"quantities-help-button\" data-folded=\"true\">".concat(labels, "</button>\n        "), 'left-side');
        var helpButton = document.getElementById('quantities-help-button');
        helpButton.addEventListener('click', function () { return helpButton.dataset.folded = helpButton.dataset.folded == 'true' ? 'false' : 'true'; });
        this.setTooltip('quantities-help-button', _('Plazzas / District quantities'));
    };
    Akropolis.prototype.onKeyPress = function (event) {
        if (['TEXTAREA', 'INPUT'].includes(event.target.nodeName) || !this.isCurrentPlayerActive()) {
            return;
        }
        var canRotate = !(this.selectedPosition && this.getSelectedPositionOption().r.length <= 1);
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
                    this.incRotation();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                break;
            case 'Alt': // 18            
            case 'ArrowUp': // 38
            case 'ArrowLeft': // 37
                if (canRotate) {
                    this.decRotation();
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
    /*private addHelp() {
        dojo.place(`
            <button id="akropolis-help-button">?</button>
        `, 'left-side');
        document.getElementById('akropolis-help-button').addEventListener('click', () => this.showHelp());
    }

    private showHelp() {
        const helpDialog = new ebg.popindialog();
        helpDialog.create('akropolisHelpDialog');
        helpDialog.setTitle(_*("Card details").toUpperCase());

        
        let html = `
        <div id="help-popin">
            TODO
        </div>
        `;
        
        // Show the dialog
        helpDialog.setContent(html);

        helpDialog.show();
    }*/
    Akropolis.prototype.updateScores = function (playerId, scores) {
        Array.from(document.querySelectorAll('.hide-live-scores')).forEach(function (element) { return element.classList.remove('hide-live-scores'); });
        var _loop_2 = function (i) {
            var type = TYPES[i];
            var starKey = Object.keys(scores.stars).find(function (key) { return key.startsWith(type); });
            var hexKey = Object.keys(scores.districts).find(function (key) { return key.startsWith(type); });
            this_1.starsCounters[playerId][i].toValue(scores.stars[starKey]);
            this_1.hexesCounters[playerId][i].toValue(scores.districts[hexKey]);
            this_1.colorPointsCounters[playerId][i].toValue(this_1.starsCounters[playerId][i].getValue() * this_1.hexesCounters[playerId][i].getValue());
        };
        var this_1 = this;
        for (var i = (playerId == 0 && this.gamedatas.soloPlayer.lvl == 1 ? 0 : 1); i <= 5; i++) {
            _loop_2(i);
        }
        ;
        this.setPlayerScore(playerId, scores.score);
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
            var option = this.getSelectedPositionOption();
            if (!option.r.includes(this.rotation)) {
                this.setRotation(this.findClosestRotation(option.r));
            }
            var tileCoordinates = TILE_COORDINATES[hexIndex];
            this.getCurrentPlayerTable().placeTile(__assign(__assign({}, this.selectedTile), { x: this.selectedPosition.x - tileCoordinates[0], y: this.selectedPosition.y - tileCoordinates[1], z: this.selectedPosition.z, r: this.rotation }), true, this.selectedTileHexIndex);
            this.updateRotationButtonState();
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
        this.updateRotationButtonState();
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
            this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options[0], this.rotation);
        }
        this.getCurrentPlayerTable().rotatePreviewTile(this.rotation);
    };
    Akropolis.prototype.cancelPlaceTile = function () {
        ["placeTile_button", "cancelPlaceTile_button"].forEach(function (id) { return document.getElementById(id).classList.add('disabled'); });
        this.selectedPosition = null;
        this.getCurrentPlayerTable().removePreviewTile();
        this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options[0], this.rotation);
        this.updateRotationButtonState();
    };
    Akropolis.prototype.updateRotationButtonState = function () {
        var cannotRotate = this.selectedPosition && this.getSelectedPositionOption().r.length <= 1;
        ["decRotation_button", "incRotation_button"].forEach(function (id) { return document.getElementById(id).classList.toggle('disabled', cannotRotate); });
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
            ['updateFirstPlayer', 1],
            ['updateScores', 1],
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
        this.constructionSite.refill(notif.args.dock, notif.args.deck / (Math.max(2, Object.keys(this.gamedatas.players).length) + 1));
    };
    Akropolis.prototype.notif_updateFirstPlayer = function (notif) {
        var firstPlayerToken = document.getElementById('first-player-token');
        var destinationId = "first-player-token-wrapper-".concat(notif.args.pId);
        var originId = firstPlayerToken.parentElement.id;
        if (destinationId !== originId) {
            this.animationManager.attachWithSlideAnimation(firstPlayerToken, document.getElementById(destinationId), { zoom: 1 });
        }
    };
    Akropolis.prototype.notif_updateScores = function (notif) {
        this.updateScores(notif.args.player_id, notif.args.scores);
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
