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

    private createGrid(grid: PlayerGrid) {
        Object.keys(grid).forEach(x => Object.keys(grid[x]).forEach(y => Object.keys(grid[x][y]).forEach(z => {
            this.createHex(Number(x), Number(y), Number(z), grid[x][y]);
        })));
    }
    
    private createHex(x: number, y: number, z: number, types: string[]) {
        const typeArray = types[0].split('-');
        const type = typeArray[0];
        const plaza = typeArray[1] === 'plaza';

        dojo.place(`<div class="temp-hex" style="--x: ${x}; --y: ${y}; --z: ${z};" data-type="${type}" data-plaza="${plaza}">${type}${plaza ? `<br>(${typeArray[1] ?? ''})` : ''}<br>${x}, ${y}, ${z}</div>`, document.getElementById(`player-table-${this.playerId}-city`));
    }

}