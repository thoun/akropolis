const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;

    private currentPlayer: boolean;

    private tempTile: HTMLDivElement | null;

    constructor(private game: AkropolisGame, player: AkropolisPlayer) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId(); 

        let html = `
        <div id="player-table-${this.playerId}" class="player-table">
            <div class="name-wrapper">
                <span class="name" style="color: #${player.color};">${player.name}</span>
            </div>
            <div id="player-table-${this.playerId}-city" class="city"></div>
        </div>
        `;
        dojo.place(html, document.getElementById('tables'));

        this.createGrid(player.board.grid);
    }
    
    public setPlaceTileOptions(options: PlaceTileOption[], rotation: number) {
        // clean previous
        Array.from(document.getElementById(`player-table-${this.playerId}-city`).querySelectorAll('.possible')).forEach((option: HTMLElement) => option.parentElement.remove());

        options/*.filter(option => option.r.some(r => r == rotation))*/.forEach(option => {
            const hex = this.createPossibleHex(option.x, option.y, option.z);
            const face = hex.getElementsByClassName('face')[0] as HTMLDivElement;
            face.addEventListener('click', () => {
                this.game.possiblePositionClicked(option.x, option.y, option.z);
            });
        });
    }

    public placeTile(tile: Tile, temp: boolean, selectedHexIndex: number = null) {
        const tileDiv = this.game.tilesManager.createTile(tile, true, temp ? ['temp'] : []);
        tileDiv.style.setProperty('--x', `${tile.x}`);
        tileDiv.style.setProperty('--y', `${tile.y}`);
        tileDiv.style.setProperty('--z', `${tile.z}`);
        tileDiv.style.setProperty('--r', `${tile.r}`);
        tileDiv.dataset.selectedHexIndex = `${selectedHexIndex}`;
        document.getElementById(`player-table-${this.playerId}-city`).appendChild(tileDiv);

        if (temp) {
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

            this.removeTempTile();
            this.tempTile = tileDiv;
        }
    }

    public rotateTempTile(r: number) {
        this.tempTile?.style.setProperty('--r', `${r}`);
    }
    
    public removeTempTile() {
        this.tempTile?.remove();
        this.tempTile = null;
    }

    private createGrid(grid: PlayerGrid) {
        Object.keys(grid).forEach(x => Object.keys(grid[x]).forEach(y => Object.keys(grid[x][y]).forEach(z => {
            this.createTileHex(Number(x), Number(y), Number(z), grid[x][y][z]);
        })));
    }
    
    private createTileHex(x: number, y: number, z: number, types: string) {
        const hex = this.game.tilesManager.createTileHex(x, y, z, types);
        hex.id = `player-${this.playerId}-hex-${x}-${y}-${z}`;
        document.getElementById(`player-table-${this.playerId}-city`).appendChild(hex);
        
        const { type, plaza } = this.game.tilesManager.hexFromString(types);
        this.game.setTooltip(hex.id, this.game.tilesManager.getHexTooltip(type, plaza));
    }
    
    private createPossibleHex(x: number, y: number, z: number) {
        const hex = this.game.tilesManager.createPossibleHex(x, y, z);
        document.getElementById(`player-table-${this.playerId}-city`).appendChild(hex);
        return hex;
    }

}