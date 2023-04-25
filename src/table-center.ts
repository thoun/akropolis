class ConstructionSite {
    private market: HTMLDivElement;
    private tiles: Tile[];
    private remainingstacksDiv: HTMLDivElement;
    private remainingStacksCounter: Counter;
    private selectionActivated: boolean = false;

    constructor(private game: AkropolisGame, tiles: Tile[], remainingStacks: number) {
        this.market = document.getElementById('market') as HTMLDivElement;
        this.remainingstacksDiv = document.getElementById('remaining-stacks') as HTMLDivElement;
        this.setTiles(this.orderTiles(tiles));

        document.getElementById('remaining-stacks-counter').insertAdjacentText('beforebegin', _('Remaining stacks'));
        this.remainingStacksCounter = new ebg.counter();
        this.remainingStacksCounter.create(`remaining-stacks-counter`);
        this.remainingStacksCounter.setValue(remainingStacks);
    }

    public addTile(tile: Tile, index: number) {
        const tileWithCost = document.createElement('div');
        tileWithCost.id = `market-tile-${tile.id}`;
        tileWithCost.classList.add('tile-with-cost');
        tileWithCost.dataset.cost = `${index}`;
        const tileDiv = this.createMarketTile(tile);
        tileWithCost.appendChild(tileDiv);
        const cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = `
            <span>${index}</span>
            <div class="stone score-icon"></div> 
        `;
        tileWithCost.appendChild(cost);
        this.market.appendChild(tileWithCost);

        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
            hexDiv.id = `market-tile-${tile.id}-hex-${index}`;
            const { type, plaza } = this.game.tilesManager.hexFromString(hex);
            this.game.setTooltip(hexDiv.id, this.game.tilesManager.getHexTooltip(type, plaza));
        });
    }

    public setSelectedHex(tileId: number, hex: HTMLDivElement) {
        Array.from(this.market.querySelectorAll('.selected')).forEach(option => option.classList.remove('selected'));
        document.getElementById(`market-tile-${tileId}`)?.classList.add('selected');
        if (!this.game.usePivotRotation()) {
            hex?.classList.add('selected');
        }
    }

    public setDisabledTiles(playerMoney: number | null) {
        Array.from(this.market.querySelectorAll('.disabled')).forEach(option => option.classList.remove('disabled'));

        if (playerMoney !== null) {
            Array.from(this.market.querySelectorAll('.tile-with-cost')).forEach((option: HTMLDivElement) => option.classList.toggle('disabled', Number(option.dataset.cost) > playerMoney));
        }
    }
    
    public refill(tiles: Tile[], remainingStacks: number) {
        const orderedTiles = this.orderTiles(tiles);
        this.setTiles(orderedTiles);
        orderedTiles.forEach(tile => 
            this.game.animationManager.slideFromElement(
                document.getElementById(`market-tile-${tile.id}`),
                this.remainingstacksDiv,
            )
        ); 

        this.remainingStacksCounter.setValue(remainingStacks);
    }

    public animateTileTo(tile: Tile, to: HTMLDivElement): Promise<any> {
        const marketTileDiv = document.getElementById(`market-tile-${tile.id}`).querySelector('.tile') as HTMLElement;
        const finalTransform = `rotate(${60 * Number(marketTileDiv.style.getPropertyValue('--r'))}deg)`;
        return slideToAnimation(
            marketTileDiv,
            { fromElement: to, scale: 1, finalTransform }
        );
    }

    public removeTile(tile: Tile) {
        const index = this.tiles.findIndex(t => t.id == tile.id);
        if (index !== -1) {
            this.tiles.splice(index, 1);
            this.setTiles(this.tiles);
        }
    }

    public setSelectable(selectable: boolean) {
        this.selectionActivated = selectable;
        this.market.classList.toggle('selectable', selectable);
    }

    private setTiles(tiles: Tile[]) {
        this.tiles = tiles;
        Array.from(this.market.querySelectorAll('.tile-with-cost')).forEach(option => option.remove());
        this.tiles.forEach((tile, index) => this.addTile(tile, index));

        if ((this.game as any).isCurrentPlayerActive() && this.game.stonesCounters[this.game.getPlayerId()]) {
            this.setDisabledTiles(this.game.stonesCounters[this.game.getPlayerId()].getValue());
        }
    }

    private createMarketTile(tile: Tile): HTMLDivElement {
        const tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
            hexDiv.addEventListener('click', () => {
                if (this.selectionActivated) {
                    this.game.constructionSiteHexClicked(tile, this.game.usePivotRotation() ? 0 : index, hexDiv, Number(tileDiv.style.getPropertyValue('--r')));
                }
            });
        });
        return tileDiv;
    }

    // temp ? remove if sorted by state ASC on back-end side
    private orderTiles(tiles: Tile[]) {
        tiles.sort((a, b) => a.state - b.state);
        return tiles;
    }
    
    public setRotation(rotation: number, tile: Tile) {        
        const tileDiv = document.getElementById(`market-tile-${tile.id}`).getElementsByClassName('tile')[0] as HTMLDivElement;

        const SHIFT_LEFT = [0, 20, -16, 0, -20, 16];
        const SHIFT_TOP = [0, 12, 16, 8, -4, -8];

        tileDiv.style.setProperty('--r', `${rotation}`);
        tileDiv.style.setProperty('--shift-left', `${SHIFT_LEFT[(rotation + 600) % 6]}px`);
        tileDiv.style.setProperty('--shift-top', `${SHIFT_TOP[(rotation + 600) % 6]}px`);
    }
}