declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

class Akropolis implements AkropolisGame {

    private gamedatas: AkropolisGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    
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

        log('gamedatas', gamedatas);

        this.tableCenter = new TableCenter(this, this.gamedatas);
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
            /* example case 'chooseOperation':
                this.onEnteringChooseOperation(args.args);
                break;*/             
        }
    }
    
    /* example private onEnteringChooseOperation(args: EnteringChooseOperationArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.getCurrentPlayerTable()?.setPossibleOperations(args.operations);
        }
    }*/

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            /* example case 'planificationChooseFaces':
                this.onLeavingPlanificationChooseFaces();
                break;*/
        }
    }

    /* example private onLeavingPlanificationChooseFaces() {
        this.selectedPlanificationDice = {};
    }*/

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if ((this as any).isCurrentPlayerActive()) {
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
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: AkropolisGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);   

            // TODO
        });
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

    /* example public useFoulPlay() {
        if(!(this as any).checkAction('useFoulPlay')) {
            return;
        }

        this.takeAction('useFoulPlay');
    }*/

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
            // example ['doubleElimination', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    /* example notif_setRealizedObjective(notif: Notif<NotifSetRealizedObjectiveArgs>) {
        this.markRealizedObjective(notif.args.letter, notif.args.realizedBy);
    }*/

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