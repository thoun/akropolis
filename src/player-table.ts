const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

const TILE_SHIFT_BY_ROTATION = [
    { minX: 0, maxX: 1, minY: 0, maxY: 2, },
    { minX: -1, maxX: 0, minY: 0, maxY: 2, },
    { minX: -1, maxX: 0, minY: -1, maxY: 1, },
    { minX: -1, maxX: 0, minY: -2, maxY: 0, },
    { minX: 0, maxX: 1, minY: -2, maxY: 0, },
    { minX: 0, maxX: 1, minY: 1, maxY: 1, },
];

class PlayerTable {
    public playerId: number;

    private currentPlayer: boolean;
    private city: HTMLDivElement;
    private grid: HTMLDivElement;
    private previewTile: HTMLDivElement | null;

    private minX = -1;
    private maxX = 1;
    private minY = -2;
    private maxY = 1;

    constructor(private game: AkropolisGame, player: AkropolisPlayer) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId(); 

        let html = `
        <div id="player-table-${this.playerId}" class="player-table">
            <div class="name-wrapper">
                <span class="name" style="color: #${player.color};">${player.name}</span>
            </div>
            <div class="frame">
                <div id="player-table-${this.playerId}-city" class="city">
                    <!--<div class="flag" style="--flag-color: red; top: 50%; left: 50%;"></div>-->
                    <div id="player-table-${this.playerId}-grid" class="grid">
                        <!--<div class="flag" style="--flag-color: blue;"></div>-->
                    </div>
                </div>
            </div>
        </div>
        `;
        dojo.place(html, document.getElementById('tables'));
        this.city = document.getElementById(`player-table-${this.playerId}-city`) as HTMLDivElement;
        this.grid = document.getElementById(`player-table-${this.playerId}-grid`) as HTMLDivElement;

        this.createGrid(player.board);

        this.city.style.transform = "rotatex(" + (game as any).control3dxaxis + "deg) translate(" + (game as any).control3dypos + "px," + (game as any).control3dxpos + "px) rotateZ(" + (game as any).control3dzaxis + "deg) scale3d(" + (game as any).control3dscale + "," + (game as any).control3dscale + "," + (game as any).control3dscale + ")";
        this.game.viewManager.draggableElement3d(this.city);
    }
    
    public setPlaceTileOptions(options: PlaceTileOption[], rotation: number) {
        // clean previous
        Array.from(this.grid.querySelectorAll('.possible')).forEach((option: HTMLElement) => option.parentElement.remove());

        options/*.filter(option => option.r.some(r => r == rotation))*/.forEach(option => {
            const hex = this.createPossibleHex(option.x, option.y, option.z);
            const face = hex.getElementsByClassName('face')[0] as HTMLDivElement;
            face.addEventListener('click', () => {
                this.game.possiblePositionClicked(option.x, option.y, option.z);
            });
        });
    }

    public placeTile(tile: Tile, preview: boolean = false, selectedHexIndex: number = null) {
        const tileDiv = this.game.tilesManager.createTile(tile, true, preview ? ['preview'] : []);
        tileDiv.style.setProperty('--x', `${tile.x}`);
        tileDiv.style.setProperty('--y', `${tile.y}`);
        tileDiv.style.setProperty('--z', `${tile.z}`);
        tileDiv.style.setProperty('--r', `${tile.r}`);
        tileDiv.dataset.selectedHexIndex = `${selectedHexIndex}`;
        this.grid.appendChild(tileDiv);
        this.removePreviewTile();

        if (preview) {
            tile.hexes.forEach((hex, index) => {
                const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`);
                if (index == selectedHexIndex) {
                    hexDiv.classList.add('selected');
                    hexDiv.addEventListener('click', () => this.game.incRotation());
                } 
                hexDiv.id = `player-${this.playerId}-tile-${tile.id}-hex-${index}`;
                const { type, plaza } = this.game.tilesManager.hexFromString(hex);
                this.game.setTooltip(hexDiv.id, this.game.tilesManager.getHexTooltip(type, plaza));
            });

            this.previewTile = tileDiv;
        } else {
            this.minX = Math.min(this.minX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].minX);
            this.minY = Math.min(this.minY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].minY);
            this.maxX = Math.max(this.maxX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].maxX);
            this.maxY = Math.max(this.maxY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].maxY);

            const middleX = (this.maxX + this.minX) / 2;
            const middleY = (this.maxY + this.minY) / 2;

            this.grid.style.setProperty('--x-shift', ''+middleX);
            this.grid.style.setProperty('--y-shift', ''+middleY);
        }
    }

    public rotatePreviewTile(r: number) {
        this.previewTile?.style.setProperty('--r', `${r}`);
    }
    
    public removePreviewTile() {
        this.previewTile?.remove();
        this.previewTile = null;
    }

    private createStartTile() {
        this.createTileHex(0, 0, 0, 'house-plaza');
        this.createTileHex(0, -2, 0, 'quarry');
        this.createTileHex(1, 1, 0, 'quarry');
        this.createTileHex(-1, 1, 0, 'quarry');
    }

    private createGrid(board: PlayerBoard) {
        this.createStartTile();
        board.tiles.forEach(tile => this.placeTile(tile));
    }
    
    private createTileHex(x: number, y: number, z: number, types: string) {
        const hex = this.game.tilesManager.createTileHex(x, y, z, types, true);
        hex.id = `player-${this.playerId}-hex-${x}-${y}-${z}`;
        this.grid.appendChild(hex);
        
        const { type, plaza } = this.game.tilesManager.hexFromString(types);
        this.game.setTooltip(hex.id, this.game.tilesManager.getHexTooltip(type, plaza));
    }
    
    private createPossibleHex(x: number, y: number, z: number) {
        const hex = this.game.tilesManager.createPossibleHex(x, y, z);
        hex.id = `player-${this.playerId}-possible-hex-${x}-${y}-${z}`;
        this.grid.appendChild(hex);
        return hex;
    }
}