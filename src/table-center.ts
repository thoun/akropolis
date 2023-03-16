class ConstructionSite {
    private tiles: Tile[];
    private remainingStacksCounter: Counter;

    constructor(private game: AkropolisGame, tiles: Tile[], remainingStacks: number) {
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
        document.getElementById('market').appendChild(tileWithCost);

        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
            hexDiv.id = `market-tile-${tile.id}-hex-${index}`;
            const { type, plaza } = this.game.tilesManager.hexFromString(hex);
            this.game.setTooltip(hexDiv.id, this.game.tilesManager.getHexTooltip(type, plaza));
        });
    }

    public setSelectedHex(tileId: number, hex: HTMLDivElement) {
        Array.from(document.getElementById('market').querySelectorAll('.selected')).forEach(option => option.classList.remove('selected'));
        document.getElementById(`market-tile-${tileId}`)?.classList.add('selected');
        hex?.classList.add('selected');
    }

    public setDisabledTiles(playerMoney: number | null) {
        Array.from(document.getElementById('market').querySelectorAll('.disabled')).forEach(option => option.classList.remove('disabled'));

        if (playerMoney !== null) {
            Array.from(document.getElementById('market').querySelectorAll('.tile-with-cost')).forEach((option: HTMLDivElement) => option.classList.toggle('disabled', Number(option.dataset.cost) > playerMoney));
        }
    }
    
    public refill(tiles: Tile[], remainingStacks: number) {
        this.setTiles(this.orderTiles(tiles));

        this.remainingStacksCounter.setValue(remainingStacks);
    }

    public removeTile(tile: Tile) {
        const index = this.tiles.findIndex(t => t.id == tile.id);
        if (index !== -1) {
            this.tiles.splice(index, 1);
            this.setTiles(this.tiles);
        }
    }

    private setTiles(tiles: Tile[]) {
        this.tiles = tiles;
        Array.from(document.getElementById('market').querySelectorAll('.tile-with-cost')).forEach(option => option.remove());
        console.log(this.tiles);
        this.tiles.forEach((tile, index) => this.addTile(tile, index));
    }

    private createMarketTile(tile: Tile): HTMLDivElement {
        const tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
            hexDiv.addEventListener('click', () => this.game.constructionSiteHexClicked(tile, index, hexDiv));
        });
        return tileDiv;
    }

    // temp
    private orderTiles(tiles: Tile[]) {
        tiles.sort((a, b) => Number(a.state) - Number(b.state));
        return tiles;
    }
}