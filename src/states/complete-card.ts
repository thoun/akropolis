interface EnteringCompleteCardArgs {
    options: PlaceTileOption[];
    cardIds: string[];
    automaPicks: { [cardId: string]: number[] }; // ids of tiles the automa can pick, for each enabled card
}

class CompleteCardState extends StateHandler<EnteringCompleteCardArgs> {
    public get stateName(): string { return `completeCard`; }

    private selectedCard: string | null = null;
    private tileForAutomata: Tile | null = null;

    public override onEnteringState(args: EnteringCompleteCardArgs, isCurrentPlayerActive: boolean) {
        args.cardIds.forEach(id => document.getElementById(`contruction-space-${id}`)?.classList.add('active'));

        this.selectedCard = null;
        this.tileForAutomata = null;

        if (isCurrentPlayerActive) {
            this.game.selectedPosition = null;
            this.game.selectedTile = null;
            this.game.selectedTileHexIndex = null;
            this.game.setRotation(0);
            /*this.getCurrentPlayerTable().setPlaceTileOptions(args.options[0], this.rotation);
            this.constructionSite.setDisabledTiles(this.stonesCounters[this.getPlayerId()].getValue());*/
        }
    }

    public override onLeavingState(args: EnteringCompleteCardArgs, isCurrentPlayerActive: boolean) {
        if (isCurrentPlayerActive) {
            document.querySelectorAll('.athena-contruction-space.active').forEach(elem => elem.classList.remove('active'));
            this.game.getCurrentPlayerTable().setPlaceTileOptions([], this.game.rotation);
            this.game.athenaConstructionSite.setSelectable([]);
        }

        this.removeForAutomataClass();
        this.removeUnselectableClass();
        this.selectedCard = null;
        this.tileForAutomata = null;
    }

    public override onUpdateActionButtons(args: EnteringCompleteCardArgs, isCurrentPlayerActive: boolean) {
        if (isCurrentPlayerActive) {
            if (Object.keys(args.automaPicks).length && !this.tileForAutomata) {
                this.onUpdateActionButtonsForAutomata(args);
            } else {
                this.onUpdateActionButtonsForPlayer(args);
            }
        }
    }

    private onUpdateActionButtonsForAutomata(args: EnteringCompleteCardArgs) {
        this.setGamestateDescription(_('${you} may give a tile to the Automata to complete a fulfilled construction card'));
        document.getElementById('generalactions').innerHTML = '';

        (this.game as any).addActionButton(`skip_button`, _('Skip'), () => (this.game as any).bgaPerformAction('actSkipCompleteCard'), null, null, 'gray');

        const spaces = args.cardIds.map(id => Number(this.game.gamedatas.cards.find(card => card.id === id).location.split('-')[1]));
        const selectableTilesIds = Object.values(args.automaPicks).flat();

        const tilesOfCards = this.game.gamedatas.dock.filter(tile => tile.location.startsWith('athena') && spaces.includes(Number(tile.location.split('-')[1])));
        this.game.athenaConstructionSite.setSelectable(spaces, tilesOfCards.filter(tile => !selectableTilesIds.includes(tile.id)));
    }

    private onUpdateActionButtonsForPlayer(args: EnteringCompleteCardArgs) {
        this.setGamestateDescription(_('${you} may complete a fulfilled construction card'));
        document.getElementById('generalactions').innerHTML = '';

        if (this.game.usePivotRotation()) {
            (this.game as any).addActionButton(`decRotationPivot_button`, `⭯`, () => this.game.decRotationPivot());
            (this.game as any).addActionButton(`incRotationPivot_button`, `⭮`, () => this.game.incRotationPivot());
        } else {
            (this.game as any).addActionButton(`decRotation_button`, `⤹`, () => this.game.decRotation());
            (this.game as any).addActionButton(`incRotation_button`, `⤸`, () => this.game.incRotation());
        }
        (this.game as any).addActionButton(`placeTile_button`, _('Confirm'), () => this.game.placeTile(this.tileForAutomata));
        (this.game as any).addActionButton(`cancelPlaceTile_button`, _('Cancel'), () => this.game.cancelPlaceTile(), null, null, 'gray');
        [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id)?.classList.toggle('disabled', id !== `cancelPlaceTile_button` || !this.tileForAutomata));
        this.game.updateRotationButtonState();

        (this.game as any).addActionButton(`skip_button`, _('Skip'), () => (this.game as any).bgaPerformAction('actSkipCompleteCard'), null, null, 'gray');

        const cardsIds = this.selectedCard ? [this.selectedCard] : args.cardIds;
        const spaces = cardsIds.map(id => Number(this.game.gamedatas.cards.find(card => card.id === id).location.split('-')[1]));
        this.game.athenaConstructionSite.setSelectable(spaces, null);
    }

    private removeUnselectableClass() {
        document.querySelectorAll('.unselectable').forEach(elem => elem.classList.remove('unselectable'));
    }

    private removeForAutomataClass() {
        document.querySelectorAll('.for-automata').forEach(elem => elem.classList.remove('for-automata'));
    }
    
    public singleTileClickedForAutomata(tile: Tile) {
        this.tileForAutomata = tile;
        this.selectedCard = this.game.gamedatas.cards.find(card => card.location === tile.location).id;
        this.removeUnselectableClass();
        document.getElementById(`market-tile-${tile.id}`).classList.add('for-automata');

        this.onUpdateActionButtonsForPlayer(this.args);
    }
    
    private onCancel() {
        const args = this.args;
        if (Object.keys(args.automaPicks).length) {
            this.selectedCard = null;
            this.tileForAutomata = null;
            this.removeForAutomataClass();
            this.onUpdateActionButtonsForAutomata(args);
        }

    }
}