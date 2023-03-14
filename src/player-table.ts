const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;

    private currentPlayer: boolean;

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
        Array.from(document.getElementById(`player-table-${this.playerId}-city`).querySelectorAll('.possible')).forEach(option => option.remove());

        options.filter(option => option.r.some(r => r == rotation)).forEach(option => {
            const hex = this.createPossibleHex(option.x, option.y, option.z);
            const face = hex.getElementsByClassName('face')[0] as HTMLDivElement;
            face.addEventListener('click', () => this.game.placeTile(option.x, option.y, option.z/*, r*/));
        });
    }

    private createGrid(grid: PlayerGrid) {
        Object.keys(grid).forEach(x => Object.keys(grid[x]).forEach(y => Object.keys(grid[x][y]).forEach(z => {
            this.createTileHex(Number(x), Number(y), Number(z), grid[x][y][z]);
        })));
    }
    
    private createTileHex(x: number, y: number, z: number, type: string) {
        const hex = this.game.tilesManager.createTileHex(x, y, z, type);
        document.getElementById(`player-table-${this.playerId}-city`).appendChild(hex);
    }
    
    private createPossibleHex(x: number, y: number, z: number) {
        const hex = this.game.tilesManager.createPossibleHex(x, y, z);
        document.getElementById(`player-table-${this.playerId}-city`).appendChild(hex);
        return hex;
    }

}