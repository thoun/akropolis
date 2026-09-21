import { Game } from "./Game";
import { TableCenter } from "./table-center";

export class ConstructionSite extends TableCenter {
    private remainingstacksDiv: HTMLDivElement;
    private remainingStacksCounter: Counter;

    constructor(protected game: Game, tiles: Tile[], remainingStacks: number) {
        super(game);
        document.getElementById('tables').insertAdjacentHTML('beforebegin', `            
            <div id="market" class="left-to-right">
                <div id="remaining-stacks"><div id="remaining-stacks-counter"></div></div>
            </div>
        `);

        this.stock = document.getElementById('market') as HTMLDivElement;
        this.remainingstacksDiv = document.getElementById('remaining-stacks') as HTMLDivElement;
        this.setTiles(this.orderTiles(tiles.filter(tile => tile.location === 'dock')));

        document.getElementById('remaining-stacks-counter').insertAdjacentText('beforebegin', _('Remaining stacks'));
        this.remainingStacksCounter = new ebg.counter();
        this.remainingStacksCounter.create(`remaining-stacks-counter`);
        this.remainingStacksCounter.setValue(remainingStacks);
    }

    public addTile(tile: Tile, index: number) {
        const tileWithCost = document.createElement('div');
        tileWithCost.id = `table-center-tile-${tile.id}`;
        tileWithCost.classList.add('tile-with-cost');
        tileWithCost.dataset.cost = `${index}`;
        const tileDiv = this.createTableCenterTile(tile);
        tileWithCost.appendChild(tileDiv);
        const cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = `
            <span>${index}</span>
            <div class="stone score-icon"></div> 
        `;
        tileWithCost.appendChild(cost);
        this.stock.appendChild(tileWithCost);

        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
            hexDiv.id = `table-center-tile-${tile.id}-hex-${index}`;
            const { type, plaza } = this.game.tilesManager.hexFromString(hex);
            this.game.setTooltip(hexDiv.id, this.game.tilesManager.getHexTooltip(type, plaza));
        });
    }

    public setDisabledTiles(playerMoney: number | null) {
        Array.from(this.stock.querySelectorAll('.disabled')).forEach(option => option.classList.remove('disabled'));

        if (playerMoney !== null) {
            Array.from(this.stock.querySelectorAll('.tile-with-cost')).forEach((option: HTMLDivElement) => option.classList.toggle('disabled', Number(option.dataset.cost) > playerMoney));
        }
    }
    
    public async refill(tiles: Tile[], remainingStacks: number) {
        const orderedTiles = this.orderTiles(tiles);
        this.setTiles(orderedTiles);
        await Promise.all(orderedTiles.map(tile => {
            const tileWithCost = document.getElementById(`table-center-tile-${tile.id}`) as HTMLElement;
            tileWithCost.classList.add('animated-table-center-tile-with-cost');

            return this.game.animationManager.slideIn(tileWithCost, this.remainingstacksDiv)
                .finally(() => tileWithCost.classList.remove('animated-table-center-tile-with-cost'));
        }));

        this.remainingStacksCounter.setValue(remainingStacks);
    }

    protected setTiles(tiles: Tile[]): void {
        super.setTiles(tiles);

        if (this.game.bga.players.isCurrentPlayerActive() && this.game.stonesCounters[this.game.getCurrentPlayerId()]) {
            this.setDisabledTiles(this.game.stonesCounters[this.game.getCurrentPlayerId()].getValue());
        }
    }
}
