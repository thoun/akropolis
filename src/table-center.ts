import { Game } from "./Game";

export class ConstructionSite {
    private market: HTMLDivElement;
    private tiles: Tile[];
    private remainingstacksDiv: HTMLDivElement;
    private remainingStacksCounter: Counter;
    private selectionActivated: boolean = false;

    constructor(private game: Game, tiles: Tile[], remainingStacks: number) {
        this.market = document.getElementById('market') as HTMLDivElement;
        this.remainingstacksDiv = document.getElementById('remaining-stacks') as HTMLDivElement;
        this.setTiles(this.orderTiles(tiles.filter(tile => tile.location === 'dock')));

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
    
    public async refill(tiles: Tile[], remainingStacks: number) {
        const orderedTiles = this.orderTiles(tiles);
        this.setTiles(orderedTiles);
        await Promise.all(orderedTiles.map(tile => {
            const tileWithCost = document.getElementById(`market-tile-${tile.id}`) as HTMLElement;
            tileWithCost.classList.add('animated-market-tile-with-cost');

            return this.game.animationManager.slideIn(tileWithCost, this.remainingstacksDiv)
                .finally(() => tileWithCost.classList.remove('animated-market-tile-with-cost'));
        }));

        this.remainingStacksCounter.setValue(remainingStacks);
    }

    public async animateTileTo(tile: Tile, to: HTMLDivElement): Promise<any> {
        const marketTileDiv = document.getElementById(`market-tile-${tile.id}`).querySelector('.tile') as HTMLElement;
        const animatedTileDiv = marketTileDiv.cloneNode(true) as HTMLElement;
        animatedTileDiv.classList.add('animated-market-tile');
        await this.game.animationManager.slideFloatingElement(animatedTileDiv, marketTileDiv, to, { scale: 1 });
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

        if (this.game.bga.players.isCurrentPlayerActive() && this.game.stonesCounters[this.game.getCurrentPlayerId()]) {
            this.setDisabledTiles(this.game.stonesCounters[this.game.getCurrentPlayerId()].getValue());
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
