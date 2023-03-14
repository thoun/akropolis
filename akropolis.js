var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var TilesManager = /** @class */ (function () {
    function TilesManager(game) {
        this.game = game;
    }
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
    TilesManager.prototype.createTileHex = function (x, y, z, type, plaza, withSides) {
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
        // temp
        var face = hex.getElementsByClassName('face')[0];
        face.dataset.type = type;
        face.dataset.plaza = (plaza !== null && plaza !== void 0 ? plaza : false).toString();
        face.innerHTML = "".concat(type).concat(plaza ? "<br>(plaza)" : '', "<br>").concat(x, ", ").concat(y, ", ").concat(z);
        return hex;
    };
    TilesManager.prototype.createPossibleHex = function (x, y, z) {
        return this.createHex(x, y, z, ['possible']);
    };
    TilesManager.prototype.createMarketTile = function (hexes) {
        var _this = this;
        var XY = [
            [0, 0],
            [1, 1],
            [0, 2],
        ];
        var tile = document.createElement('div');
        tile.classList.add('tile');
        hexes.forEach(function (hex, index) { return tile.appendChild(_this.createTileHex(XY[index][0], XY[index][1], 0, hex.type, hex.plaza, false)); });
        return tile;
    };
    return TilesManager;
}());
var TableCenter = /** @class */ (function () {
    function TableCenter(game, tiles) {
        var _this = this;
        this.game = game;
        tiles.forEach(function (tile, index) { return _this.addTile(tile, index); });
    }
    TableCenter.prototype.addTile = function (hexes, index) {
        var _this = this;
        var tileWithCost = document.createElement('div');
        tileWithCost.id = "market-tile-".concat(index);
        tileWithCost.classList.add('tile-with-cost');
        if (index > 0) {
            tileWithCost.classList.add('disabled');
        }
        tileWithCost.appendChild(this.game.tilesManager.createMarketTile(hexes));
        var cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = "\n            <span>".concat(index, "</span>\n            <div class=\"stone score-icon\"></div> \n        ");
        tileWithCost.appendChild(cost);
        tileWithCost.addEventListener('click', function () { return _this.game.chooseMarketTile(index); });
        document.getElementById('market').appendChild(tileWithCost);
    };
    return TableCenter;
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
    PlayerTable.prototype.setPlaceTileOptions = function (options) {
        var _this = this;
        options.forEach(function (option) {
            var hex = _this.createPossibleHex(option.x, option.y, option.z);
            var face = hex.getElementsByClassName('face')[0];
            option.r.forEach(function (r) {
                face.insertAdjacentHTML('beforeend', "<button id=\"place-tile-".concat(option.x, "-").concat(option.y, "-").concat(option.z, "-").concat(r, "\">placeTile r=").concat(r, "</button>"));
                document.getElementById("place-tile-".concat(option.x, "-").concat(option.y, "-").concat(option.z, "-").concat(r)).addEventListener('click', function () { return _this.game.placeTile(option.x, option.y, option.z, r); });
            });
        });
    };
    PlayerTable.prototype.removePlaceTileOptions = function () {
        var options = document.getElementById("player-table-".concat(this.playerId, "-city")).querySelectorAll('.possible');
        Array.from(options).forEach(function (option) { return option.remove(); });
    };
    PlayerTable.prototype.createGrid = function (grid) {
        var _this = this;
        Object.keys(grid).forEach(function (x) { return Object.keys(grid[x]).forEach(function (y) { return Object.keys(grid[x][y]).forEach(function (z) {
            _this.createTileHex(Number(x), Number(y), Number(z), grid[x][y][z]);
        }); }); });
    };
    PlayerTable.prototype.createTileHex = function (x, y, z, types) {
        var typeArray = types.split('-');
        var type = typeArray[0];
        var plaza = typeArray[1] === 'plaza';
        var hex = this.game.tilesManager.createTileHex(x, y, z, type, plaza);
        document.getElementById("player-table-".concat(this.playerId, "-city")).appendChild(hex);
    };
    PlayerTable.prototype.createPossibleHex = function (x, y, z) {
        var hex = this.game.tilesManager.createPossibleHex(x, y, z);
        document.getElementById("player-table-".concat(this.playerId, "-city")).appendChild(hex);
        return hex;
    };
    return PlayerTable;
}());
var Akropolis = /** @class */ (function () {
    function Akropolis() {
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
        // temp
        var marketTiles = [
            [
                { type: 'quarry' },
                { type: 'quarry' },
                { type: 'market', plaza: true },
            ],
            [
                { type: 'temple', plaza: true },
                { type: 'barrack' },
                { type: 'market' },
            ],
        ];
        this.tableCenter = new TableCenter(this, marketTiles);
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        // TODO temp
        // this.tilesManager.testTile();
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
            this.getCurrentPlayerTable().setPlaceTileOptions(args.options);
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
        (_a = this.getCurrentPlayerTable()) === null || _a === void 0 ? void 0 : _a.removePlaceTileOptions();
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Akropolis.prototype.onUpdateActionButtons = function (stateName, args) {
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                /* example case 'chooseOperation':
                    const chooseOperationArgs = args as EnteringChooseOperationArgs;
                    Object.keys(chooseOperationArgs.operations).forEach((type: any) => {
                        const operation = chooseOperationArgs.operations[type];
                        (this as any).addActionButton(`chooseOperation${type}_button`, `<div class="operation-icon" data-type="${type}"></div> ${operation.value}`, () => this.chooseOperation(type), null, null, 'gray');
                        if (operation.disabled) {
                            const button = document.getElementById(`chooseOperation${type}_button`);
                            button.classList.add('disabled');
                            if (operation.disabled == 'first-player') {
                                button.insertAdjacentHTML('beforeend', `<div class="first-player-token"></div>`);
                            }
                        }
                    });
                    break;*/
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
    Akropolis.prototype.chooseMarketTile = function (index) {
        if (!this.checkAction('chooseMarketTile')) {
            return;
        }
        this.takeAction('chooseMarketTile', {
            index: index,
        });
    };
    Akropolis.prototype.placeTile = function (x, y, z, r) {
        if (!this.checkAction('placeTile')) {
            return;
        }
        this.takeAction('placeTile', {
            x: x,
            y: y,
            z: z,
            r: r,
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
        // example ['doubleElimination', 1],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    /* example notif_setRealizedObjective(notif: Notif<NotifSetRealizedObjectiveArgs>) {
        this.markRealizedObjective(notif.args.letter, notif.args.realizedBy);
    }*/
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
