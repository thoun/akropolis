import { Game } from "./Game";
import { TableCenter } from "./table-center";

export class PlayerHand extends TableCenter {

    constructor(game: Game, private currentPlayerId: number, gamedatas: AkropolisGamedatas) {
        super(game);
        if (!gamedatas.players[currentPlayerId]) {
            return; // player is spectator
        }

        document.getElementById('tables').insertAdjacentHTML('beforebegin', `            
            <div id="hand">
            </div>
        `);
        this.tiles = Object.values(gamedatas.players[currentPlayerId].tiles);

        this.stock = document.getElementById('hand') as HTMLDivElement;
        this.setTiles(this.orderTiles(this.tiles));
    }

    public addTile(tile: Tile, index: number) {
        const tileWithCost = document.createElement('div');
        tileWithCost.id = `table-center-tile-${tile.id}`;
        tileWithCost.classList.add('tile-with-cost');
        tileWithCost.dataset.cost = `${index}`;
        const tileDiv = this.createTableCenterTile(tile);
        tileWithCost.appendChild(tileDiv);
        this.stock.appendChild(tileWithCost);

        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
            hexDiv.id = `table-center-tile-${tile.id}-hex-${index}`;
            const { type, plaza } = this.game.tilesManager.hexFromString(hex);
            this.game.setTooltip(hexDiv.id, this.game.tilesManager.getHexTooltip(type, plaza));
        });
    }
    
    public async refill(tiles: Tile[], remainingStacks: number) {
        const orderedTiles = this.orderTiles(tiles);
        this.setTiles(orderedTiles);
        await Promise.all(orderedTiles.map(tile => {
            const tileWithCost = document.getElementById(`table-center-tile-${tile.id}`) as HTMLElement;
            tileWithCost.classList.add('animated-table-center-tile-with-cost');

            return this.game.animationManager.slideIn(tileWithCost, this.game.bga.playerPanels.getElement(this.currentPlayerId))
                .finally(() => tileWithCost.classList.remove('animated-table-center-tile-with-cost'));
        }));
    }
}
