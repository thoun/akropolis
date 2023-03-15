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
    TilesManager.prototype.createTileHex = function (x, y, z, types, withSides) {
        if (withSides === void 0) { withSides = true; }
        var hex = this.createHex(x, y, z, ['temp']);
        if (withSides) {
            for (var i = 0; i < 6; i++) {
                var side = document.createElement('div');
                side.classList.add('side');
                side.style.setProperty('--side', "".concat(i));
                hex.appendChild(side);
            }
        }
        var face = hex.getElementsByClassName('face')[0];
        var typeArray = types.split('-');
        var type = typeArray[0];
        var plaza = typeArray[1] === 'plaza';
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
        // temp
        face.innerHTML = "".concat(x, ", ").concat(y, ", ").concat(z);
        hex.appendChild(face);
        return hex;
    };
    return TilesManager;
}());
var ConstructionSite = /** @class */ (function () {
    function ConstructionSite(game, tiles) {
        var _this = this;
        this.game = game;
        tiles.forEach(function (tile, index) { return _this.addTile(tile, index); });
    }
    ConstructionSite.prototype.addTile = function (tile, index) {
        var tileWithCost = document.createElement('div');
        tileWithCost.id = "market-tile-".concat(tile.id);
        tileWithCost.classList.add('tile-with-cost');
        tileWithCost.dataset.cost = "".concat(index);
        /* TODO if (index > 0) {
            tileWithCost.classList.add('disabled');
        }*/
        tileWithCost.appendChild(this.createMarketTile(tile));
        var cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = "\n            <span>".concat(index, "</span>\n            <div class=\"stone score-icon\"></div> \n        ");
        tileWithCost.appendChild(cost);
        /*tileWithCost.addEventListener('click', () => {
            if (!tileWithCost.classList.contains('disabled')) {
                this.setSelectedTileId(tile.id);
            }
        });*/
        document.getElementById('market').appendChild(tileWithCost);
    };
    ConstructionSite.prototype.setSelectedHex = function (tileId, hex) {
        var _a;
        Array.from(document.getElementById('market').querySelectorAll('.selected')).forEach(function (option) { return option.classList.remove('selected'); });
        (_a = document.getElementById("market-tile-".concat(tileId))) === null || _a === void 0 ? void 0 : _a.classList.add('selected');
        hex === null || hex === void 0 ? void 0 : hex.classList.add('selected');
    };
    ConstructionSite.prototype.setDisabledTiles = function (playerMoney) {
        Array.from(document.getElementById('market').querySelectorAll('.disabled')).forEach(function (option) { return option.classList.remove('disabled'); });
        if (playerMoney !== null) {
            Array.from(document.getElementById('market').querySelectorAll('.tile-with-cost')).forEach(function (option) { return option.classList.toggle('disabled', Number(option.dataset.cost) > playerMoney); });
        }
    };
    ConstructionSite.prototype.createMarketTile = function (tile) {
        var _this = this;
        var tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach(function (hex, index) {
            var hexDiv = tileDiv.querySelector("[data-index=\"".concat(index, "\"]"));
            hexDiv.addEventListener('click', function () { return _this.game.constructionSiteHexClicked(tile, index, hexDiv); });
            tileDiv.appendChild(hexDiv);
        });
        return tileDiv;
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
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\">\n            <div class=\"name-wrapper\">\n                <span class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</span>\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-city\" class=\"city\"></div>\n        </div>\n        ");
        dojo.place(html, document.getElementById('tables'));
        this.createGrid(player.board.grid);
    }
    PlayerTable.prototype.setPlaceTileOptions = function (options, rotation) {
        var _this = this;
        // clean previous
        Array.from(document.getElementById("player-table-".concat(this.playerId, "-city")).querySelectorAll('.possible')).forEach(function (option) { return option.parentElement.remove(); });
        options /*.filter(option => option.r.some(r => r == rotation))*/.forEach(function (option) {
            var hex = _this.createPossibleHex(option.x, option.y, option.z);
            var face = hex.getElementsByClassName('face')[0];
            face.addEventListener('click', function () {
                _this.game.possiblePositionClicked(option.x, option.y, option.z);
            });
        });
    };
    PlayerTable.prototype.placeTile = function (tile, temp, selectedHexIndex) {
        var _this = this;
        if (selectedHexIndex === void 0) { selectedHexIndex = null; }
        var tileDiv = this.game.tilesManager.createTile(tile, true, temp ? ['temp'] : []);
        tileDiv.style.setProperty('--x', "".concat(tile.x));
        tileDiv.style.setProperty('--y', "".concat(tile.y));
        tileDiv.style.setProperty('--z', "".concat(tile.z));
        tileDiv.style.setProperty('--r', "".concat(tile.r));
        tileDiv.dataset.selectedHexIndex = "".concat(selectedHexIndex);
        document.getElementById("player-table-".concat(this.playerId, "-city")).appendChild(tileDiv);
        if (temp) {
            tile.hexes.forEach(function (hex, index) {
                var hexDiv = tileDiv.querySelector("[data-index=\"".concat(index, "\"]"));
                if (index == selectedHexIndex) { // temp
                    hexDiv.classList.add('selected');
                    hexDiv.addEventListener('click', function () { return _this.game.incRotation(); });
                }
            });
            this.removeTempTile();
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
    PlayerTable.prototype.createGrid = function (grid) {
        var _this = this;
        Object.keys(grid).forEach(function (x) { return Object.keys(grid[x]).forEach(function (y) { return Object.keys(grid[x][y]).forEach(function (z) {
            _this.createTileHex(Number(x), Number(y), Number(z), grid[x][y][z]);
        }); }); });
    };
    PlayerTable.prototype.createTileHex = function (x, y, z, type) {
        var hex = this.game.tilesManager.createTileHex(x, y, z, type);
        document.getElementById("player-table-".concat(this.playerId, "-city")).appendChild(hex);
    };
    PlayerTable.prototype.createPossibleHex = function (x, y, z) {
        var hex = this.game.tilesManager.createPossibleHex(x, y, z);
        document.getElementById("player-table-".concat(this.playerId, "-city")).appendChild(hex);
        return hex;
    };
    return PlayerTable;
}());
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
        log('gamedatas', gamedatas);
        this.tilesManager = new TilesManager(this);
        this.constructionSite = new ConstructionSite(this, gamedatas.dock);
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
            this.getCurrentPlayerTable().setPlaceTileOptions(args.options, this.rotation);
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
            dojo.place("<div class=\"counters\">\n                <div id=\"stones-counter-wrapper-".concat(player.id, "\" class=\"stones-counter\">\n                    <div class=\"stone score-icon\"></div> \n                    <span id=\"stones-counter-").concat(player.id, "\"></span>\n                </div>\n            </div>"), "player_board_".concat(player.id));
            var stonesCounter = new ebg.counter();
            stonesCounter.create("stones-counter-".concat(playerId));
            stonesCounter.setValue(player.money);
            _this.stonesCounters[playerId] = stonesCounter;
            _this.hexesCounters[playerId] = [];
            _this.starsCounters[playerId] = [];
            _this.colorPointsCounters[playerId] = [];
            for (var i = 1; i <= 5; i++) {
                dojo.place("<div class=\"counters\">\n                    <div id=\"color-points-".concat(i, "-counter-wrapper-").concat(player.id, "\" class=\"color-points-counter\">\n                        <div class=\"score-icon\" data-type=\"").concat(i, "\"></div> \n                        <span id=\"hexes-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        <span class=\"multiplier\">\u00D7</span>\n                        <div class=\"score-icon star\" data-type=\"").concat(i, "\"></div> \n                        <span id=\"stars-").concat(i, "-counter-").concat(player.id, "\"></span>\n                        <span class=\"multiplier\">=</span>\n                        <span id=\"color-points-").concat(i, "-counter-").concat(player.id, "\"></span>\n                    </div>\n                </div>"), "player_board_".concat(player.id));
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
        return this.gamedatas.gamestate.args.options.find(function (o) {
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
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    Akropolis.prototype.notif_placedTile = function (notif) {
        this.getPlayerTable(notif.args.tile.pId).placeTile(notif.args.tile, false);
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
