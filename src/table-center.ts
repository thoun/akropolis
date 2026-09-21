import { Game } from "./Game";

export abstract class TableCenter {
    protected stock: HTMLDivElement;
    protected tiles: Tile[];
    protected selectionActivated: boolean = false;

    constructor(protected game: Game) {
    }

    public abstract addTile(tile: Tile, index: number);

    public setSelectedHex(tileId: number, hex: HTMLDivElement) {
        Array.from(this.stock.querySelectorAll('.selected')).forEach(option => option.classList.remove('selected'));
        document.getElementById(`table-center-tile-${tileId}`)?.classList.add('selected');
        if (!this.game.usePivotRotation()) {
            hex?.classList.add('selected');
        }
    }

    public setDisabledTiles(playerMoney: number | null) {}
    
    public abstract refill(tiles: Tile[], remainingStacks: number);

    public async animateTileTo(tile: Tile, to: HTMLDivElement): Promise<any> {
        const marketTileDiv = document.getElementById(`table-center-tile-${tile.id}`).querySelector('.tile') as HTMLElement;
        const animatedTileDiv = marketTileDiv.cloneNode(true) as HTMLElement;
        animatedTileDiv.classList.add('animated-table-center-tile');
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
        this.stock.classList.toggle('selectable', selectable);
    }

    protected setTiles(tiles: Tile[]): void {
        this.tiles = tiles;
        Array.from(this.stock.querySelectorAll('.tile-with-cost')).forEach(option => option.remove());
        this.tiles.forEach((tile, index) => this.addTile(tile, index));
    }

    protected createTableCenterTile(tile: Tile): HTMLDivElement {
        const tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
            hexDiv.addEventListener('click', () => {
                if (this.selectionActivated) {
                    this.game.tableCenterHexClicked(tile, this.game.usePivotRotation() ? 0 : index, hexDiv, Number(tileDiv.style.getPropertyValue('--r')));
                }
            });
        });
        return tileDiv;
    }

    // temp ? remove if sorted by state ASC on back-end side
    protected orderTiles(tiles: Tile[]) {
        tiles.sort((a, b) => a.state - b.state);
        return tiles;
    }
    
    public setRotation(rotation: number, tile: Tile) {        
        const tileDiv = document.getElementById(`table-center-tile-${tile.id}`).getElementsByClassName('tile')[0] as HTMLDivElement;

        const SHIFT_LEFT = [0, 20, -16, 0, -20, 16];
        const SHIFT_TOP = [0, 12, 16, 8, -4, -8];

        tileDiv.style.setProperty('--r', `${rotation}`);
        tileDiv.style.setProperty('--shift-left', `${SHIFT_LEFT[(rotation + 600) % 6]}px`);
        tileDiv.style.setProperty('--shift-top', `${SHIFT_TOP[(rotation + 600) % 6]}px`);
    }
}
