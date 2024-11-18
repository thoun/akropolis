interface EnteringCompleteCardArgs {
    options: PlaceTileOption[];
    cardIds: string[];
    automaPicks: { [cardId: string]: number[] }; // ids of tiles the automa can pick, for each enabled card
}

class CompleteCardState extends StateHandler<EnteringCompleteCardArgs> {
    public get stateName(): string { return `completeCard`; }

    public override onEnteringState(args: EnteringCompleteCardArgs, isCurrentPlayerActive: boolean) {
        args.cardIds.forEach(id => document.getElementById(`contruction-space-${id}`)?.classList.add('active'));

        if (isCurrentPlayerActive) {
            this.game.selectedPosition = null;
            this.game.selectedTile = null;
            this.game.selectedTileHexIndex = null;
            this.game.setRotation(0);
            const spaces = args.cardIds.map(id => Number(this.game.gamedatas.cards.find(card => card.id === id).location.split('-')[1]));
            this.game.athenaConstructionSite.setSelectable(spaces);
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
    }

    public override onUpdateActionButtons(args: EnteringCompleteCardArgs, isCurrentPlayerActive: boolean) {
        if (isCurrentPlayerActive) {
            if (this.game.usePivotRotation()) {
                (this.game as any).addActionButton(`decRotationPivot_button`, `⭯`, () => this.game.decRotationPivot());
                (this.game as any).addActionButton(`incRotationPivot_button`, `⭮`, () => this.game.incRotationPivot());
            } else {
                (this.game as any).addActionButton(`decRotation_button`, `⤹`, () => this.game.decRotation());
                (this.game as any).addActionButton(`incRotation_button`, `⤸`, () => this.game.incRotation());
            }
            (this.game as any).addActionButton(`placeTile_button`, _('Confirm'), () => this.game.placeTile());
            (this.game as any).addActionButton(`cancelPlaceTile_button`, _('Cancel'), () => this.game.cancelPlaceTile(), null, null, 'gray');
            [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id)?.classList.add('disabled'));
            this.game.updateRotationButtonState();

            (this.game as any).addActionButton(`skip_button`, _('Skip'), () => (this.game as any).bgaPerformAction('actSkipCompleteCard'), null, null, 'gray');
        }
    }
}