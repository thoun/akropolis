class ConstructionSite {
    constructor(private game: AkropolisGame, tiles: Tile[]) {
        tiles.forEach((tile, index) => this.addTile(tile, index));
    }

    public addTile(tile: Tile, index: number) {
        const tileWithCost = document.createElement('div');
        tileWithCost.id = `market-tile-${tile.id}`;
        tileWithCost.classList.add('tile-with-cost');
        tileWithCost.dataset.cost = `${index}`;
        /* TODO if (index > 0) {
            tileWithCost.classList.add('disabled');
        }*/
        tileWithCost.appendChild(this.game.tilesManager.createMarketTile(tile));
        const cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = `
            <span>${index}</span>
            <div class="stone score-icon"></div> 
        `;
        tileWithCost.appendChild(cost);
        /*tileWithCost.addEventListener('click', () => {
            if (!tileWithCost.classList.contains('disabled')) {
                this.setSelectedTileId(tile.id);
            }
        });*/
        document.getElementById('market').appendChild(tileWithCost);
    }

    public setSelectedHex(tileId: number, tile: HTMLDivElement, hex: HTMLDivElement) {
        Array.from(document.getElementById('market').querySelectorAll('.selected')).forEach(option => option.classList.remove('selected'));
        document.getElementById(`market-tile-${tileId}`).classList.add('selected');
        hex.classList.add('selected');
        this.game.setSelectedTileId(tileId);
    }

    public setDisabledTiles(playerMoney: number | null) {
        Array.from(document.getElementById('market').querySelectorAll('.disabled')).forEach(option => option.classList.remove('disabled'));

        if (playerMoney !== null) {
            Array.from(document.getElementById('market').querySelectorAll('.tile-with-cost')).forEach((option: HTMLDivElement) => option.classList.toggle('disabled', Number(option.dataset.cost) > playerMoney));
        }
    }
}