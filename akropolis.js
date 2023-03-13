var TilesManager = /** @class */ (function () {
    function TilesManager(game) {
        this.game = game;
        // TODO
    }
    TilesManager.prototype.createTile = function () {
        var tile = document.createElement('div');
        tile.id = "tile_11";
        tile.classList.add("tile", "rotate60", "level1");
        tile.style.left = "-77px";
        tile.style.top = "7px";
        tile.innerHTML = "\n        <div id=\"tile_11\" class=\"tile rotate60 level1\" style=\"left: -77px; top: -70px;\">\n            <div id=\"hex_11_0\" class=\"subface0 face face-6\" title=\"Volcan, niveau 1\"></div>\n            <div id=\"hex_11_1\" class=\"subface1 face face-1\" title=\"For\u00EAt, niveau 1\">\n                <div class=\"facelabel\">1</div>\n            </div>\n            <div id=\"hex_11_2\" class=\"subface2 face face-2\" title=\"Prairie, niveau 1\">\n                <div class=\"facelabel\">1</div>\n            </div>\n            <div class=\"sides\">\n                <div class=\"side side1\"></div>\n                <div class=\"side side2\"></div>\n                <div class=\"side side3\"></div>\n                <div class=\"side side4\"></div>\n                <div class=\"side side5\"></div>\n                <div class=\"side side6\"></div>\n            </div>\n        </div>\n        ";
        return tile;
    };
    TilesManager.prototype.testTile = function () {
        document.getElementById('test').appendChild(this.createTile());
    };
    return TilesManager;
}());
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        this.game = game;
        // TODO
    }
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
    PlayerTable.prototype.createGrid = function (grid) {
        var _this = this;
        Object.keys(grid).forEach(function (x) { return Object.keys(grid[x]).forEach(function (y) { return Object.keys(grid).forEach(function (z) {
            _this.createHex(Number(x), Number(y), Number(z), grid[x][y]);
        }); }); });
    };
    PlayerTable.prototype.createHex = function (x, y, z, types) {
        var _a;
        var typeArray = types[0].split('-');
        var type = typeArray[0];
        var plaza = typeArray[1] === 'plaza';
        dojo.place("<div class=\"temp-hex\" style=\"--x: ".concat(x, "; --y: ").concat(y, "; --z: ").concat(z, ";\" data-type=\"").concat(type, "\" data-plaza=\"").concat(plaza, "\">").concat(type).concat(plaza ? "<br>(".concat((_a = typeArray[1]) !== null && _a !== void 0 ? _a : '', ")") : '', "</div>"), document.getElementById("player-table-".concat(this.playerId, "-city")));
    };
    return PlayerTable;
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
var Akropolis = /** @class */ (function () {
    function Akropolis() {
        this.playersTables = [];
        this.stonesCounters = [];
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
        this.tableCenter = new TableCenter(this, this.gamedatas);
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
            /* example case 'chooseOperation':
                this.onEnteringChooseOperation(args.args);
                break;*/
        }
    };
    /* example private onEnteringChooseOperation(args: EnteringChooseOperationArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.getCurrentPlayerTable()?.setPossibleOperations(args.operations);
        }
    }*/
    Akropolis.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            /* example case 'planificationChooseFaces':
                this.onLeavingPlanificationChooseFaces();
                break;*/
        }
    };
    /* example private onLeavingPlanificationChooseFaces() {
        this.selectedPlanificationDice = {};
    }*/
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
            // hand cards counter
            dojo.place("<div class=\"counters\">\n                <div id=\"stones-counter-wrapper-".concat(player.id, "\" class=\"stones-counter\">\n                    <div class=\"stones icon\"></div> \n                    <span id=\"stones-counter-").concat(player.id, "\"></span>\n                </div>\n            </div>"), "player_board_".concat(player.id));
            var stonesCounter = new ebg.counter();
            stonesCounter.create("stones-counter-".concat(playerId));
            stonesCounter.setValue(player.money);
            _this.stonesCounters[playerId] = stonesCounter;
        });
        this.setTooltipToClass('stones-counter', _('Number of stones'));
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
    /* example public useFoulPlay() {
        if(!(this as any).checkAction('useFoulPlay')) {
            return;
        }

        this.takeAction('useFoulPlay');
    }*/
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
