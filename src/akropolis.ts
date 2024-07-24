declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

const TYPES = {
    0: 'quarry',
    1: 'house',
    2: 'market',
    3: 'barrack',
    4: 'temple',
    5: 'garden',
};

const HEX_QUANTITIES = {
    2: [[5,18], [4,12], [4,10], [4,8], [3,6]],
    3: [[6,27], [5,16], [5,13], [5,10], [4,7]],
    4: [[7,36], [6,20], [6,16], [6,12], [5,8]],
};

const PIVOT_ROTATIONS = [
    [+1, +1],
    [0, +2],
    [-1, +1],
    [-1, -1],
    [0, -2],
    [+1, -1],
];

const PIVOT_ROTATIONS_REVERSE = [
    [0, +2],
    [-1, +1],
    [-1, -1],
    [0, -2],
    [+1, -1],
    [+1, +1],
];

const AKROPOLIS_FOLDED_HELP = 'Akropolis-FoldedHelp';
const LOCAL_STORAGE_JUMP_KEY = 'Akropolis-jump-to-folded';

class Akropolis implements AkropolisGame {
    public tilesManager: TilesManager;
    public viewManager: ViewManager;
    public animationManager: AnimationManager;

    private gamedatas: AkropolisGamedatas;
    private constructionSite: ConstructionSite;
    private athenaConstructionSite?: AthenaConstructionSite;
    private selectedPosition: Partial<PlaceTileOption>;
    private selectedTile: Tile;
    private selectedTileHexIndex: number;
    private rotation: number = 0;
    private playersTables: PlayerTable[] = [];
    public stonesCounters: Counter[] = [];
    private hexesCounters: Counter[][] = [];
    private starsCounters: Counter[][] = [];
    private colorPointsCounters: Counter[][] = [];

    private pivotRotation = false;
    
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
        
        this.pivotRotation = window.location.href.indexOf('pivot') !== -1;
        this.gamedatas = gamedatas;

        // Setup camera controls reminder
        var reminderHtml = document.getElementsByTagName('body')[0].classList.contains('touch-device') ?
        `<div id="controls-reminder">
        ${_('You can drag this block')}
        </div>`
        : `<div id="controls-reminder">
        <img src="${g_gamethemeurl}img/mouse-right.svg"></img>
        ${_('Adjust camera with below controls or right-drag, middle-drag and scroll wheel')}
        </div>`;
        dojo.place(reminderHtml, 'controls3d_wrap', 'first');

        log('gamedatas', gamedatas);

        this.animationManager = new AnimationManager(this);
        this.viewManager = new ViewManager(this);
        this.tilesManager = new TilesManager(this);
        this.constructionSite = new ConstructionSite(this, gamedatas.dock, gamedatas.deck / (Math.max(2, Object.keys(gamedatas.players).length) + 1));
        if (gamedatas.isAthena) {
            this.athenaConstructionSite = new AthenaConstructionSite(this, gamedatas.cards, gamedatas.cardStatuses, gamedatas.dock, Object.values(gamedatas.players));
        }
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);

        const topEntries = [];
        if (gamedatas.isAthena) {
            topEntries.push(new JumpToEntry(_("Athena"), 'athena-contruction-spaces', { 'color': '#1fa7d9' }));
        }
        topEntries.push(new JumpToEntry(_("Construction Site"), 'market', { 'color': '#7e7978' }));

        const bottomEntries = [];
        if (gamedatas.soloPlayer) {
            bottomEntries.push(new JumpToEntry(_(gamedatas.soloPlayer.name), 'player-table-0', { 'color': `#${gamedatas.soloPlayer.color}` }));
        }

        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_KEY,
            topEntries,
            bottomEntries,
            entryClasses: 'hexa-point',
            defaultFolded: false,
        });

        document.getElementsByTagName('body')[0].addEventListener('keydown', e => this.onKeyPress(e));

        this.setupNotifications();
        this.setupPreferences();
        this.addHelp(gamedatas.allTiles ? 4 : Math.max(2, Object.keys(gamedatas.players).length));

        window.addEventListener('resize', () => this.viewManager.fitCitiesToView());

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
            case 'completeCard':
                this.onEnteringCompleteCard(args.args);
                break;
        }
    }
    
    private onEnteringPlaceTile(args: EnteringPlaceTileArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.selectedPosition = null;
            this.selectedTile = null;
            this.selectedTileHexIndex = null;
            this.setRotation(0);
            this.constructionSite.setSelectable(true);
            this.getCurrentPlayerTable().setPlaceTileOptions(args.options[0], this.rotation);
            this.constructionSite.setDisabledTiles(this.stonesCounters[this.getPlayerId()].getValue());
        }
    }
    
    private onEnteringCompleteCard(args: EnteringCompleteCardArgs) {
        args.cardIds.forEach(id => document.getElementById(`contruction-space-${id}`).classList.add('active'));
        
        if ((this as any).isCurrentPlayerActive()) {
            this.selectedPosition = null;
            this.selectedTile = null;
            this.selectedTileHexIndex = null;
            this.setRotation(0);
            const spaces = args.cardIds.map(id => Number(this.gamedatas.cards.find(card => card.id === id).location.split('-')[1]));
            this.athenaConstructionSite.setSelectable(spaces);
            /*this.getCurrentPlayerTable().setPlaceTileOptions(args.options[0], this.rotation);
            this.constructionSite.setDisabledTiles(this.stonesCounters[this.getPlayerId()].getValue());*/
        }
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'placeTile':
                this.onLeavingPlaceTile();
                break;
            case 'completeCard':
                this.onLeavingCompleteCard();
                break;
        }
    }

    private onLeavingPlaceTile() {
        this.getCurrentPlayerTable()?.setPlaceTileOptions([], this.rotation);
        this.constructionSite.setSelectable(false);
    }

    private onLeavingCompleteCard() {
        document.querySelectorAll('.athena-contruction-space.active').forEach(elem => elem.classList.remove('active'));
        this.getCurrentPlayerTable()?.setPlaceTileOptions([], this.rotation);
        this.athenaConstructionSite.setSelectable([]);
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeTile':
                    if (this.usePivotRotation()) {
                        (this as any).addActionButton(`decRotationPivot_button`, `⭯`, () => this.decRotationPivot());
                        (this as any).addActionButton(`incRotationPivot_button`, `⭮`, () => this.incRotationPivot());
                    } else {
                        (this as any).addActionButton(`decRotation_button`, `⤹`, () => this.decRotation());
                        (this as any).addActionButton(`incRotation_button`, `⤸`, () => this.incRotation());
                    }
                    (this as any).addActionButton(`placeTile_button`, _('Confirm'), () => this.placeTile());
                    (this as any).addActionButton(`cancelPlaceTile_button`, _('Cancel'), () => this.cancelPlaceTile(), null, null, 'gray');
                    [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.add('disabled'));
                    this.updateRotationButtonState();
                    break;
                case 'completeCard':
                    if (this.usePivotRotation()) {
                        (this as any).addActionButton(`decRotationPivot_button`, `⭯`, () => this.decRotationPivot());
                        (this as any).addActionButton(`incRotationPivot_button`, `⭮`, () => this.incRotationPivot());
                    } else {
                        (this as any).addActionButton(`decRotation_button`, `⤹`, () => this.decRotation());
                        (this as any).addActionButton(`incRotation_button`, `⤸`, () => this.incRotation());
                    }
                    (this as any).addActionButton(`placeTile_button`, _('Confirm'), () => this.placeTile());
                    (this as any).addActionButton(`cancelPlaceTile_button`, _('Cancel'), () => this.cancelPlaceTile(), null, null, 'gray');
                    [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.add('disabled'));
                    this.updateRotationButtonState();

                    (this as any).addActionButton(`skip_button`, _('Skip'), () => (this as any).bgaPerformAction('actSkipCompleteCard'), null, null, 'gray');
                    
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
            case 201: 
                (document.getElementsByTagName('html')[0] as HTMLHtmlElement).classList.toggle('tile-level-colors', prefValue == 2);
                break;
            case 203: 
                document.getElementById(`market`).classList.toggle('left-to-right', prefValue != 2);
                break;
            case 204: 
                (document.getElementsByTagName('html')[0] as HTMLHtmlElement).classList.toggle('animated-opacity', prefValue == 2);
                break;
            case 206: 
                (document.getElementsByTagName('html')[0] as HTMLHtmlElement).dataset.background = prefValue == 2 ? 'dark' : (prefValue == 1 ? 'light' : 'auto');
                break;
                
        }
    }

    public usePivotRotation(): boolean {
        /*const playersIds = Object.keys(this.gamedatas.players).map(val => +val);
        return (playersIds.length == 1 && [
            2343492, // thoun studio
            86175279, // thoun BGA
            2322020, // tisaac studio
            83846198, // tisaac BGA
            84834479, // jules
        ].includes(playersIds[0]));*/
        return this.pivotRotation;
    }

    private getOrderedPlayers(gamedatas: AkropolisGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.no - b.no);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: AkropolisGamedatas) {
        const players = Object.values(gamedatas.players);
        const soloPlayer = gamedatas.soloPlayer;

        if (soloPlayer) {
            dojo.place(`
            <div id="overall_player_board_0" class="player-board current-player-board">					
                <div class="player_board_inner" id="player_board_inner_982fff">
                    
                    <div class="emblemwrap" id="avatar_active_wrap_0">
                        <img src="${g_gamethemeurl}img/gear.png" alt="" class="avatar avatar_active" id="avatar_active_0" />
                    </div>
                                               
                    <div class="player-name" id="player_name_0">
                        ${_(soloPlayer.name)}
                    </div>
                    <div id="player_board_0" class="player_board_content">
                        <div class="player_score">
                            <span id="player_score_0" class="player_score_value">0</span> <i class="fa fa-star" id="icon_point_0"></i>           
                        </div>
                    </div>
                </div>
            </div>`, `overall_player_board_${players[0].id}`, 'after');

            const soloScoreCounter = new ebg.counter();
            soloScoreCounter.create(`player_score_0`);
            soloScoreCounter.setValue(soloPlayer.score);
            (this as any).scoreCtrl[0] = soloScoreCounter;
        }

        (soloPlayer ? [...players, gamedatas.soloPlayer] : players).forEach(player => {
            const playerId = Number(player.id);   

            // Stones counter
            dojo.place(`<div class="counters">
                <div id="stones-counter-wrapper-${player.id}" class="stones-counter">
                    <div id="stones-icon-${player.id}" class="stone score-icon"></div> 
                    <span id="stones-counter-${player.id}"></span>
                </div>
                <div id="first-player-token-wrapper-${player.id}" class="first-player-token-wrapper"></div>
            </div>
            <div class="scores-and-statue">
                <div id="scores-${player.id}"></div> 
                <div id="statue-${player.id}"></div>
            </div>`, `player_board_${player.id}`);
            if (gamedatas.firstPlayerId == playerId) {
                dojo.place(`<div id="first-player-token" class="first-player-token"></div>`, `first-player-token-wrapper-${player.id}`);
            }

            const stonesCounter = new ebg.counter();
            stonesCounter.create(`stones-counter-${playerId}`);
            stonesCounter.setValue(player.money);
            this.stonesCounters[playerId] = stonesCounter;

            const someVariants = gamedatas.activatedVariants.length > 0;
            const showScores = Boolean(player.board.scores);
            this.hexesCounters[playerId] = [];
            this.starsCounters[playerId] = [];
            this.colorPointsCounters[playerId] = [];
            for (let i = (playerId == 0 && player.lvl == 1 ? 0 : 1); i <= 5; i++) {
                let html = `<div class="counters ${!showScores && !someVariants ? 'hide-live-scores' : ''}" id="color-points-${i}-counter-border-${player.id}">
                    <div id="color-points-${i}-counter-wrapper-${player.id}" class="color-points-counter">
                        <span class="${!showScores ? 'hide-live-scores' : ''}">
                        <div class="score-icon star" data-type="${i}"></div> 
                        <span id="stars-${i}-counter-${player.id}"></span>
                        <span class="multiplier">×</span>
                        </span>
                        <div class="score-icon" data-type="${i}"></div> 
                        <span class="${!showScores ? 'hide-live-scores' : ''}">
                        <span id="hexes-${i}-counter-${player.id}"></span>
                        <span class="multiplier">=</span>
                        <span id="color-points-${i}-counter-${player.id}"></span>
                        </span>
                    </div>
                </div>`;

                dojo.place(html, `scores-${player.id}`);
    
                const starKey = showScores ? Object.keys(player.board.scores.stars).find(key => key.startsWith(TYPES[i])) : null;
                const starCounter: Counter = new ebg.counter();
                starCounter.create(`stars-${i}-counter-${playerId}`);
                starCounter.setValue(showScores ? player.board.scores.stars[starKey] : 0);
                this.starsCounters[playerId][i] = starCounter;
    
                const hexKey = showScores ? Object.keys(player.board.scores.districts).find(key => key.startsWith(TYPES[i])) : null;
                const hexCounter: Counter = new ebg.counter();
                hexCounter.create(`hexes-${i}-counter-${playerId}`);
                hexCounter.setValue(showScores ? player.board.scores.districts[hexKey] : 0);
                this.hexesCounters[playerId][i] = hexCounter;
    
                const colorPointsCounter: Counter = new ebg.counter();
                colorPointsCounter.create(`color-points-${i}-counter-${playerId}`);
                colorPointsCounter.setValue(starCounter.getValue() * hexCounter.getValue());
                this.colorPointsCounters[playerId][i] = colorPointsCounter;

                if (showScores) {
                    setTimeout(() => this.setPlayerScore(playerId, player.board.scores.score), 100);
                }

                const activated = gamedatas.activatedVariants.some(variant => variant.startsWith(TYPES[i]));
                if (someVariants) {
                    document.getElementById(`color-points-${i}-counter-border-${player.id}`).style.setProperty('--border-color', activated ? 'darkgreen' : 'darkred');
                }

                let tooltip = `${_('Score for this color (number of valid districts multiplied by matching stars)')}
                <br><br>
                <strong>${this.tilesManager.getTypeTitle(TYPES[i])}</strong><br>
                ${this.tilesManager.getScoreCondition(TYPES[i])}`;

                if (someVariants) {
                    tooltip += `<br><br>
                    <strong>${_('Variant')}</strong><br>
                    ${_('Activated:')} <strong style="color: ${activated ? 'darkgreen' : 'darkred'};">${activated ? _('Yes') : _('No')}</strong><br>
                    ${_(this.tilesManager.getVariantTooltip(TYPES[i]))}`;
                }

                this.setTooltip(`color-points-${i}-counter-border-${player.id}`, tooltip);
                
            }

            if (playerId > 0 && gamedatas.isAthena) {
                for (let space = 1; space <= 4; space++) {
                    const card = gamedatas.cards.find(card => card.location === `athena-${space}`);
                    const statuePartDone: boolean = (gamedatas.cardStatuses[playerId] ?? []).includes(card.id);

                    let html = `
                    <div id="statue-${player.id}-${space}">
                        ${statuePartDone ? `<div class="statue-part" data-part="${space}"></div>` : ''}
                    </div>`;

                    dojo.place(html, `statue-${player.id}`);
                }
            }
        });

        this.setTooltipToClass('stones-counter', _('Number of stones'));   
        this.setTooltipToClass(`player_score_value`, _('The sum of the score for each color, plus 1 point for each stone'));     
    }

    private createPlayerTables(gamedatas: AkropolisGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );

        if (gamedatas.soloPlayer) {
            const table = new PlayerTable(this, gamedatas.soloPlayer, gamedatas.lastMoves[0]);
            this.playersTables.push(table);
        }
    }

    private createPlayerTable(gamedatas: AkropolisGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId], gamedatas.lastMoves[playerId]);
        this.playersTables.push(table);
    }

    private addHelp(playerCount: number) {
        let labels = `<div class="quantities-table plazza">${HEX_QUANTITIES[playerCount].map(quantities => `<div><span>${quantities[0]}</span></div>`).join('')}</div>`;
        labels += `<div class="quantities-table district">${HEX_QUANTITIES[playerCount].map(quantities => `<div><span>${quantities[1]}</span></div>`).join('')}</div>`;
        labels += `<div class="label-table">${[1, 2, 3, 4, 5].map(i => `<div>${this.tilesManager.getScoreCondition(TYPES[i])}</div>`).join('')}</div>`;
        labels += `<div class="fake-close"><div class="fake-close-dash"></div></div>`;
        dojo.place(`
            <button id="quantities-help-button" data-folded="${localStorage.getItem(AKROPOLIS_FOLDED_HELP) ?? 'false'}">${labels}</button>
        `, 'left-side');
        const helpButton = document.getElementById('quantities-help-button');
        helpButton.addEventListener('click', () => {
            helpButton.dataset.folded = helpButton.dataset.folded == 'true' ? 'false' : 'true';
            localStorage.setItem(AKROPOLIS_FOLDED_HELP, helpButton.dataset.folded);
        });
        this.setTooltip('quantities-help-button', _('Plazzas / District quantities'))
    }
    
    private onKeyPress(event: KeyboardEvent): void {
        if (['TEXTAREA', 'INPUT'].includes((event.target as HTMLElement).nodeName) || !(this as any).isCurrentPlayerActive()) {
            return;
        }

        const pivot = this.usePivotRotation();
        const canRotate = pivot ? true : this.selectedTile?.hexes.length === 1 || !(this.selectedPosition && this.getSelectedPositionOption().r.length <= 1);
        const canConfirmCancel = this.selectedPosition;

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
    }
    
    private setPlayerScore(playerId: number, score: number) {
        if ((this as any).scoreCtrl[playerId]) {
            (this as any).scoreCtrl[playerId].toValue(score);
        } else {
            document.getElementById(`player_score_${playerId}`).innerHTML = ''+score;
        }
    }
    
    private updateScores(playerId: number, scores: Scores) {
        Array.from(document.querySelectorAll('.hide-live-scores')).forEach(element => element.classList.remove('hide-live-scores'));

        for (let i = (playerId == 0 && this.gamedatas.soloPlayer.lvl == 1 ? 0 : 1); i <= 5; i++) {
            const type = TYPES[i];
            const starKey = Object.keys(scores.stars).find(key => key.startsWith(type));
            const hexKey = Object.keys(scores.districts).find(key => key.startsWith(type));
            this.starsCounters[playerId][i].toValue(scores.stars[starKey]);
            this.hexesCounters[playerId][i].toValue(scores.districts[hexKey]);
            this.colorPointsCounters[playerId][i].toValue(this.starsCounters[playerId][i].getValue() * this.hexesCounters[playerId][i].getValue());
        };
        this.setPlayerScore(playerId, scores.score);
    }
    
    public constructionSiteHexClicked(tile: Tile, hexIndex: number, hex: HTMLDivElement, rotation: number): void {
        if (hex.classList.contains('selected')) {
            this.incRotation();
            return;
        }

        const pivot = this.usePivotRotation();

        if (pivot && tile == this.selectedTile) {
            return;
        }

        this.selectedTile = tile;
        this.selectedTileHexIndex = hexIndex;
        if (this.gamedatas.gamestate.name === 'completeCard') {
            this.athenaConstructionSite.setSelectedHex(tile.id, hex);
        } else {
            this.constructionSite.setSelectedHex(tile.id, hex);
        }
        this.setRotation(rotation);

        if (this.selectedPosition) {
            const option = this.getSelectedPositionOption();
            if (option.r && !option.r.includes(this.rotation)) {
                this.setRotation(this.findClosestRotation(option.r));
            }
            
            const tileCoordinates = TILE_COORDINATES[hexIndex];
            this.getCurrentPlayerTable().placeTile({
                ...this.selectedTile,
                x: this.selectedPosition.x - tileCoordinates[0],
                y: this.selectedPosition.y - tileCoordinates[1],
                z: this.selectedPosition.z,
                r: this.rotation,
            }, true, 'preview', this.selectedTileHexIndex);
        }
        this.updateRotationButtonState();
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
        if (this.gamedatas.gamestate.name === 'completeCard') {
            return (this.gamedatas.gamestate.args as EnteringCompleteCardArgs).options.find(o => 
                o.x == this.selectedPosition.x && o.y == this.selectedPosition.y && o.z == this.selectedPosition.z
            );
        } else {
            return (this.gamedatas.gamestate.args as EnteringPlaceTileArgs).options[this.selectedTileHexIndex].find(o => 
                o.x == this.selectedPosition.x && o.y == this.selectedPosition.y && o.z == this.selectedPosition.z
            );
        }
    }
    
    public possiblePositionClicked(x: number, y: number, z: number): void {
        if (!this.selectedTile) {
            return;
        }

        const pivot = this.usePivotRotation();
        if (pivot && this.selectedPosition != null) {
            console.log(x, y, z, this.rotation, this.selectedPosition);

            if (this.selectedPosition.x == x && this.selectedPosition.y == y && this.selectedPosition.z == z) {
                this.incRotationPivot();
                console.log('possiblePositionClicked pivot, return');
                return;
            }
        }

        this.selectedPosition = {x, y, z};
        const option = this.getSelectedPositionOption();
        if (option.r && !option.r.includes(this.rotation) && !pivot) {
            this.setRotation(this.findClosestRotation(option.r));
        }
        const tileCoordinates = TILE_COORDINATES[this.selectedTileHexIndex];
        this.getCurrentPlayerTable().placeTile({
            ...this.selectedTile,
            x: this.selectedPosition.x - tileCoordinates[0],
            y: this.selectedPosition.y - tileCoordinates[1],
            z: this.selectedPosition.z,
            r: this.rotation,
        }, true, 'preview', this.selectedTileHexIndex);
        [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.remove('disabled'));
        this.updateRotationButtonState();
    }

    public decRotation(): void {
        if (this.selectedPosition && this.gamedatas.gamestate.name !== 'completeCard') {
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
        if (this.selectedPosition && this.gamedatas.gamestate.name !== 'completeCard') {
            const option = this.getSelectedPositionOption();
            const index = option.r.findIndex(r => r == this.rotation);
            if (index !== -1 && option.r.length > 1) {
                this.setRotation(option.r[index == option.r.length - 1 ? 0 : index + 1]);
            }
        } else {
            this.setRotation(this.rotation == 5 ? 0 : this.rotation + 1);
        }
    }

    public setRotation(rotation: number): void {
        while (rotation < 0) { rotation += 6; }
        rotation %= 6;
        this.rotation = rotation;
        if (this.selectedTile) {
            if (this.gamedatas.gamestate.name === 'completeCard') {
                this.athenaConstructionSite.setRotation(rotation, this.selectedTile);
            } else {
                this.constructionSite.setRotation(rotation, this.selectedTile);
            }
        }
        if (!this.selectedPosition) {
            if (this.gamedatas.gamestate.name === 'completeCard') {
                this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
            } else {
                this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options[0], this.rotation);
            }
        }
        this.getCurrentPlayerTable().rotatePreviewTile(this.rotation);
    }

    public decRotationPivot(): void {
        this.changeRotationPivot(-1);
    }

    public incRotationPivot(): void {
        this.changeRotationPivot(+1);
    }

    public changeRotationPivot(direction: number): void {
        let rotation = this.rotation;
        while (rotation < 0) { rotation += 6; }
        const pivotRotation = (direction == -1 ? PIVOT_ROTATIONS_REVERSE : PIVOT_ROTATIONS)[(rotation + (this.selectedTileHexIndex * 2)) % 6];
        this.possiblePositionClicked(this.selectedPosition.x + pivotRotation[0], this.selectedPosition.y + pivotRotation[1], this.selectedPosition.z);
        this.setRotation(rotation + direction * 2);
    }

    public cancelPlaceTile() {
        [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.add('disabled'));
        this.selectedPosition = null;
        this.getCurrentPlayerTable().removePreviewTile();
        if (this.gamedatas.gamestate.name === 'completeCard') {
            this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
        } else {
            this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options[0], this.rotation);
        }
        this.updateRotationButtonState();
    }

    private updateRotationButtonState() {
        const cannotRotate = this.selectedTile ? (this.selectedTile.hexes.length > 1 && this.selectedPosition && this.getSelectedPositionOption()?.r.length <= 1) : true;
        [`decRotation_button`, `incRotation_button`].forEach(id => document.getElementById(id)?.classList.toggle('disabled', cannotRotate));
    }

    public placeTile(): void {
        if (this.gamedatas.gamestate.name === 'completeCard') {
            if(!(this as any).checkAction('actCompleteCard')) {
                return;
            }
    
            this.getCurrentPlayerTable()?.cleanPossibleHex();
    
            this.takeAction('actCompleteCard', {
                x: this.selectedPosition.x,
                y: this.selectedPosition.y,
                z: this.selectedPosition.z,
                r: this.rotation,
                tileId: this.selectedTile.id,
                cardId: this.gamedatas.cards.find(card => card.location === this.selectedTile.location).id,
            });
        } else {
            if(!(this as any).checkAction('actPlaceTile')) {
                return;
            }

            this.getCurrentPlayerTable()?.cleanPossibleHex();

            this.takeAction('actPlaceTile', {
                x: this.selectedPosition.x,
                y: this.selectedPosition.y,
                z: this.selectedPosition.z,
                r: this.rotation,
                tileId: this.selectedTile.id,
                hex: this.selectedTileHexIndex,
            });
        }
    }

    public takeAction(action: string, data?: any) {
        (this as any).bgaPerformAction(action, data);
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
            ['placedTile', 800],
            ['completeCard', 800],
            ['pay', 1],
            ['gainStones', 1],
            ['refillDock', 1],
            ['updateFirstPlayer', 1],
            ['updateScores', 1],
            ['automataDelay', 2000],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, (notifDetails: Notif<any>) => {
                log('notif', notif[0], notifDetails);
                this[`notif_${notif[0]}`](notifDetails.args);
            });
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_placedTile(args: NotifPlacedTileArgs) {
        const playerTable = this.getPlayerTable(args.tile.pId);
        const tile = args.tile;
        playerTable.removePreviewTile();
        const invisibleTile = playerTable.placeTile(tile, false, 'invisible');
        this.constructionSite.animateTileTo(tile, invisibleTile).then(() => {
            playerTable.placeTile(tile, true, 'final');
            if (tile.hexes.length === 1) {
                this.athenaConstructionSite.removeTile(tile);
            } else {
                this.constructionSite.removeTile(tile);
            }
        });
    }

    async notif_completeCard(args: NotifCompleteCardArgs) {
        const { player_id, card } = args;
        await this.athenaConstructionSite.completeCard(player_id, card.id);
    }

    notif_pay(args: NotifPayArgs) {
        this.stonesCounters[args.player_id].incValue(-args.cost);
    }

    async notif_gainStones(args: NotifGainStonesArgs) {
        const playerId = args.player_id;
        const n = +args.n;
        this.stonesCounters[playerId].incValue(n);

        if (playerId == 0) {
            const origin = document.getElementById(`stones-icon-${this.gamedatas.playerorder[0]}`);
            const animated = document.createElement('div');
            animated.classList.add('stone', 'score-icon', 'animated');
            document.getElementById(`stones-icon-${playerId}`).appendChild(animated);
            await this.animationManager.play(new BgaSlideAnimation({
                element: animated,
                fromElement: origin,
            }))
            animated.remove();
        } else {
            const lastTile = document.getElementById(`player-table-${playerId}-grid`).getElementsByClassName('last-move')[0];
            if (lastTile) {
                const promises = [];
                for (let i = 0; i < n; i++) {
                    const origin = lastTile.getElementsByClassName('hex')[i] as HTMLElement;
                    const animated = document.createElement('div');
                    animated.classList.add('stone', 'score-icon', 'animated');
                    document.getElementById(`stones-icon-${playerId}`).appendChild(animated);
                    promises.push(this.animationManager.play(new BgaSlideAnimation({
                        element: animated,
                        fromElement: origin,
                    })).then(() => animated.remove()));
                    await Promise.all(promises);
                }
            }
        }
    }

    notif_refillDock(args: NotifDockRefillArgs) {
        this.constructionSite.refill(args.dock, args.deck / (Math.max(2, Object.keys(this.gamedatas.players).length) + 1));
    }

    notif_updateFirstPlayer(args: NotifUpdateFirstPlayerArgs) {
        const firstPlayerToken = document.getElementById('first-player-token');
        const destinationId = `first-player-token-wrapper-${args.pId}`;
        const originId = firstPlayerToken.parentElement.id;
        if (destinationId !== originId) {
            this.animationManager.attachWithAnimation(new BgaSlideAnimation({
                element: firstPlayerToken,
                zoom: 1,
            }),
            document.getElementById(destinationId));
        }
    }

    notif_updateScores(args: NotifUpdateScoresArgs) {
        this.updateScores(args.player_id, args.scores);
    }

    notif_automataDelay() {}

    /* @Override */
    public change3d(incXAxis: number, xpos: number, ypos: number, xAxis: number, incScale: number, is3Dactive: boolean, reset: boolean) {
        this.viewManager.change3d(incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset);
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}