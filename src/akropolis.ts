declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

// Greek font used in rules : DalekPinpointBold. Free only for personal use
class Akropolis implements AkropolisGame {
    public tilesManager: TilesManager;
    public viewManager: ViewManager;
    public animationManager: AnimationManager;

    private gamedatas: AkropolisGamedatas;
    private constructionSite: ConstructionSite;
    private selectedPosition: Partial<PlaceTileOption>;
    private selectedTile: Tile;
    private selectedTileHexIndex: number;
    private rotation: number = 0;
    private playersTables: PlayerTable[] = [];
    private stonesCounters: Counter[] = [];
    private hexesCounters: Counter[][] = [];
    private starsCounters: Counter[][] = [];
    private colorPointsCounters: Counter[][] = [];
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    constructor() {
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

    public setup(gamedatas: AkropolisGamedatas) {
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        // Setup camera controls reminder
        var reminderHtml = `<div id="controls-reminder">
        <img src="${g_gamethemeurl}img/mouse-right.svg"></img>
        ${_('Adjust camera with below controls or right-drag and scroll wheel')}
        </div>`;
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

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        switch (stateName) {
            case 'placeTile':
                this.onEnteringPlaceTile(args.args);
                break;
        }
    }
    
    private onEnteringPlaceTile(args: EnteringPlaceTileArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.selectedPosition = null;
            this.selectedTile = null;
            this.selectedTileHexIndex = null;
            this.setRotation(0);
            this.getCurrentPlayerTable().setPlaceTileOptions(args.options, this.rotation);
            this.constructionSite.setDisabledTiles(this.stonesCounters[this.getPlayerId()].getValue());
        }
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'placeTile':
                this.onLeavingPlaceTile();
                break;
        }
    }

    private onLeavingPlaceTile() {
        this.getCurrentPlayerTable()?.setPlaceTileOptions([], this.rotation);
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                 case 'placeTile':
                    (this as any).addActionButton(`decRotation_button`, `⤹`, () => this.decRotation());
                    (this as any).addActionButton(`incRotation_button`, `⤸`, () => this.incRotation());
                    (this as any).addActionButton(`placeTile_button`, _('Confirm'), () => this.placeTile());
                    (this as any).addActionButton(`cancelPlaceTile_button`, _('Cancel'), () => this.cancelPlaceTile(), null, null, 'gray');
                    [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.add('disabled'));
                    break;
            }
        }
    }

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        (this as any).addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    private getPlayer(playerId: number): AkropolisPlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    private getCurrentPlayerTable(): PlayerTable | null {
        return this.playersTables.find(playerTable => playerTable.playerId === this.getPlayerId());
    }

    private setupPreferences() {
        // Extract the ID and value from the UI control
        const onchange = (e) => {
          var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
          if (!match) {
            return;
          }
          var prefId = +match[1];
          var prefValue = +e.target.value;
          (this as any).prefs[prefId].value = prefValue;
          this.onPreferenceChange(prefId, prefValue);
        }
        
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        
        // Call onPreferenceChange() now
        dojo.forEach(
          dojo.query("#ingame_menu_content .preference_control"),
          el => onchange({ target: el })
        );
    }
      
    private onPreferenceChange(prefId: number, prefValue: number) {
        switch (prefId) {
            /* example case 201: 
                (document.getElementsByTagName('html')[0] as HTMLHtmlElement).dataset.fillingPattern = (prefValue == 2).toString();
                break;*/
        }
    }

    private getOrderedPlayers(gamedatas: AkropolisGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.no - b.no);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: AkropolisGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);   

            // Stones counter
            dojo.place(`<div class="counters">
                <div id="stones-counter-wrapper-${player.id}" class="stones-counter">
                    <div class="stone score-icon"></div> 
                    <span id="stones-counter-${player.id}"></span>
                </div>
                <div id="first-player-token-wrapper-${player.id}" class="first-player-token-wrapper"></div>
            </div>`, `player_board_${player.id}`);
            if (gamedatas.firstPlayerId == playerId) {
                dojo.place(`<div id="first-player-token" class="first-player-token"></div>`, `first-player-token-wrapper-${player.id}`);
            }

            const stonesCounter = new ebg.counter();
            stonesCounter.create(`stones-counter-${playerId}`);
            stonesCounter.setValue(player.money);
            this.stonesCounters[playerId] = stonesCounter;

            this.hexesCounters[playerId] = [];
            this.starsCounters[playerId] = [];
            this.colorPointsCounters[playerId] = [];
            for (let i = 1; i <= 5; i++) {

                dojo.place(`<div class="counters">
                    <div id="color-points-${i}-counter-wrapper-${player.id}" class="color-points-counter">
                        <div class="score-icon star" data-type="${i}"></div> 
                        <span id="stars-${i}-counter-${player.id}"></span>
                        <span class="multiplier">×</span>
                        <div class="score-icon" data-type="${i}"></div> 
                        <span id="hexes-${i}-counter-${player.id}"></span>
                        <span class="multiplier">=</span>
                        <span id="color-points-${i}-counter-${player.id}"></span>
                    </div>
                </div>`, `player_board_${player.id}`);
    
                const hexCounter: Counter = new ebg.counter();
                hexCounter.create(`hexes-${i}-counter-${playerId}`);
                hexCounter.setValue(0); // TODO
                this.hexesCounters[playerId][i] = hexCounter;
    
                const starCounter: Counter = new ebg.counter();
                starCounter.create(`stars-${i}-counter-${playerId}`);
                starCounter.setValue(0); // TODO
                this.starsCounters[playerId][i] = starCounter;
    
                const colorPointsCounter: Counter = new ebg.counter();
                colorPointsCounter.create(`color-points-${i}-counter-${playerId}`);
                colorPointsCounter.setValue(hexCounter.getValue() * starCounter.getValue());
                this.colorPointsCounters[playerId][i] = colorPointsCounter;
            }
        });

        this.setTooltipToClass('stones-counter', _('Number of stones'));
        this.setTooltipToClass('color-points-counter', _('Score for this color (number of valid districts multiplied by matching stars)'));
    }

    private createPlayerTables(gamedatas: AkropolisGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: AkropolisGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    }

    private addHelp() {
        dojo.place(`
            <button id="akropolis-help-button">?</button>
        `, 'left-side');
        document.getElementById('akropolis-help-button').addEventListener('click', () => this.showHelp());
    }

    private showHelp() {
        const helpDialog = new ebg.popindialog();
        helpDialog.create('akropolisHelpDialog');
        helpDialog.setTitle(_("Card details").toUpperCase());

        
        let html = `
        <div id="help-popin">
            TODO
        </div>
        `;
        
        // Show the dialog
        helpDialog.setContent(html);

        helpDialog.show();
    }
    
    public constructionSiteHexClicked(tile: Tile, hexIndex: number, hex: HTMLDivElement): void {
        if (hex.classList.contains('selected')) {
            this.incRotation();
            return;
        }

        this.selectedTile = tile;
        this.selectedTileHexIndex = hexIndex;
        this.constructionSite.setSelectedHex(tile.id, hex);

        if (this.selectedPosition) {
            const tileCoordinates = TILE_COORDINATES[hexIndex];
            this.getCurrentPlayerTable().placeTile({
                ...this.selectedTile,
                x: this.selectedPosition.x - tileCoordinates[0],
                y: this.selectedPosition.y - tileCoordinates[1],
                z: this.selectedPosition.z,
                r: this.rotation,
            }, true, this.selectedTileHexIndex);
        }
    }

    private findClosestRotation(rotations: number[]) {
        let minDistance = 999;
        let minIndex = 0;

        rotations.forEach((r, index) => {
            const distance = Math.min(Math.abs(this.rotation - r), Math.abs(this.rotation + 6 - r));
            if (distance < minDistance) {
                minDistance = distance;
                minIndex = index;
            }
        });

        return rotations[minIndex];
    }

    private getSelectedPositionOption() {
        return (this.gamedatas.gamestate.args as EnteringPlaceTileArgs).options.find(o => 
            o.x == this.selectedPosition.x && o.y == this.selectedPosition.y && o.z == this.selectedPosition.z
        );
    }
    
    public possiblePositionClicked(x: number, y: number, z: number): void {
        if (!this.selectedTile) {
            return;
        }

        this.getCurrentPlayerTable().setPlaceTileOptions([], this.rotation);
        this.selectedPosition = {x, y, z};
        const option = this.getSelectedPositionOption();
        if (!option.r.includes(this.rotation)) {
            this.setRotation(this.findClosestRotation(option.r));
        }
        const tileCoordinates = TILE_COORDINATES[this.selectedTileHexIndex];
        this.getCurrentPlayerTable().placeTile({
            ...this.selectedTile,
            x: this.selectedPosition.x - tileCoordinates[0],
            y: this.selectedPosition.y - tileCoordinates[1],
            z: this.selectedPosition.z,
            r: this.rotation,
        }, true, this.selectedTileHexIndex);
        [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.remove('disabled'));
    }

    public decRotation(): void {
        if (this.selectedPosition) {
            const option = this.getSelectedPositionOption();
            const index = option.r.findIndex(r => r == this.rotation);
            if (index !== -1 && option.r.length > 1) {
                this.setRotation(option.r[index == 0 ? option.r.length - 1 : index - 1]);
            }
        } else {
            this.setRotation(this.rotation == 0 ? 5 : this.rotation - 1);
        }
    }

    public incRotation(): void {
        if (this.selectedPosition) {
            const option = this.getSelectedPositionOption();
            const index = option.r.findIndex(r => r == this.rotation);
            if (index !== -1 && option.r.length > 1) {
                this.setRotation(option.r[index == option.r.length - 1 ? 0 : index + 1]);
            }
        } else {
            this.setRotation(this.rotation == 5 ? 0 : this.rotation + 1);
        }
    }

    private setRotation(rotation: number): void {
        this.rotation = rotation;
        document.getElementById('market').style.setProperty('--r', `${rotation}`);
        if (!this.selectedPosition) {
            this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
        }
        this.getCurrentPlayerTable().rotateTempTile(this.rotation);
        // temp
        document.getElementById('r').innerHTML = `r = ${rotation}`;
    }

    public cancelPlaceTile() {
        [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.add('disabled'));
        this.selectedPosition = null;
        this.getCurrentPlayerTable().removeTempTile();
        this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
    }

    public placeTile(): void {
        if(!(this as any).checkAction('actPlaceTile')) {
            return;
        }

        this.takeAction('actPlaceTile', {
            x: this.selectedPosition.x,
            y: this.selectedPosition.y,
            z: this.selectedPosition.z,
            r: this.rotation,
            tileId: this.selectedTile.id,
        });
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/akropolis/akropolis/${action}.html`, data, this, () => {});
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        const notifs = [
            ['placedTile', 1],
            ['pay', 1],
            ['refillDock', 1],
            ['newFirstPlayer', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_placedTile(notif: Notif<NotifPlacedTileArgs>) {
        this.getPlayerTable(notif.args.tile.pId).placeTile(notif.args.tile);
        this.constructionSite.removeTile(notif.args.tile);
    }

    notif_pay(notif: Notif<NotifPayArgs>) {
        this.stonesCounters[notif.args.player_id].incValue(-notif.args.cost);
    }

    notif_refillDock(notif: Notif<NotifDockRefillArgs>) {
        this.constructionSite.refill(notif.args.dock, notif.args.deck / (Object.keys(this.gamedatas.players).length + 1));
    }

    notif_newFirstPlayer(notif: Notif<NotifNewFirstPlayerArgs>) {
        const firstPlayerToken = document.getElementById('first-player-token');
        const destinationId = `first-player-token-wrapper-${notif.args.playerId}`;
        const originId = firstPlayerToken.parentElement.id;
        if (destinationId !== originId) {
            this.animationManager.attachWithSlideAnimation(
                firstPlayerToken,
                document.getElementById(destinationId),
                { zoom: 1 },
            );
        }
    }

    /* @Override */
    public change3d(incXAxis: number, xpos: number, ypos: number, xAxis: number, incScale: number, is3Dactive: boolean, reset: boolean) {
        this.viewManager.change3d(incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset);
        /*(this as any).control3dscale = Math.min(ZOOM_MAX, (this as any).control3dscale);
        if (arguments[4] > 0 && (this as any).control3dscale >= ZOOM_MAX) {
            arguments[4] = 0;
        }
        return (this as any).inherited(arguments);*/
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                // TODO
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}