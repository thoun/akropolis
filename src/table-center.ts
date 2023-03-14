class TableCenter {
    constructor(private game: AkropolisGame, tiles: Tile[]) {
        tiles.forEach((tile, index) => this.addTile(tile, index));
    }

    public addTile(tile: Tile, index: number) {
        const tileWithCost = document.createElement('div');
        tileWithCost.id = `market-tile-${tile.id}`;
        tileWithCost.classList.add('tile-with-cost');
        /* TODO if (index > 0) {
            tileWithCost.classList.add('disabled');
        }*/
        tileWithCost.appendChild(this.game.tilesManager.createMarketTile(tile.hexes));
        const cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = `
            <span>${index}</span>
            <div class="stone score-icon"></div> 
        `;
        tileWithCost.appendChild(cost);
        tileWithCost.addEventListener('click', () => this.setSelectedTileId(tile.id));
        document.getElementById('market').appendChild(tileWithCost);
    }

    public setSelectedTileId(tileId: number) {
        Array.from(document.getElementById('market').querySelectorAll('.selected')).forEach(option => option.classList.remove('selected'));
        document.getElementById(`market-tile-${tileId}`).classList.add('selected');
        this.game.setSelectedTileId(tileId);
    }
}