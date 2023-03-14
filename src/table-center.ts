class TableCenter {
    constructor(private game: AkropolisGame, tiles: Tile[]) {
        tiles.forEach((tile, index) => this.addTile(tile.hexes, index));
    }

    public addTile(hexes: string[], index: number) {
        const tileWithCost = document.createElement('div');
        tileWithCost.id = `market-tile-${index}`;
        tileWithCost.classList.add('tile-with-cost');
        if (index > 0) {
            tileWithCost.classList.add('disabled');
        }
        tileWithCost.appendChild(this.game.tilesManager.createMarketTile(hexes));
        const cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = `
            <span>${index}</span>
            <div class="stone score-icon"></div> 
        `;
        tileWithCost.appendChild(cost);
        tileWithCost.addEventListener('click', () => this.game.chooseMarketTile(index));
        document.getElementById('market').appendChild(tileWithCost);
    }
}