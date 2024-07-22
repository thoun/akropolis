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

    private city: HTMLDivElement;
    private grid: HTMLDivElement;
    private previewTile: HTMLDivElement | null;
    private invisibleTile: HTMLDivElement | null;

    private minX = -1;
    private maxX = 1;
    private minY = -2;
    private maxY = 1;

    constructor(private game: AkropolisGame, player: AkropolisPlayer, lastMove: Tile | undefined) {
        this.playerId = Number(player.id); 

        let html = `
        <div id="player-table-${this.playerId}" class="player-table">
            <div class="name-wrapper" style="color: #${player.color};">
                <div class="pattern left"></div>
                <span class="name">${this.playerId == 0 ? _(player.name) : player.name}</span>
                ${this.playerId == 0 ? `<span class="difficulty">(${this.getSoloDifficulty(player.lvl + 1)})</span>` : ''}
                <div class="pattern right"></div>
            </div>
            <div id="player-table-${this.playerId}-frame" class="frame">
                <div id="player-table-${this.playerId}-city" class="city">
                    <!--<div class="flag" style="--flag-color: red; top: 50%; left: 50%;"></div>-->
                    <div id="player-table-${this.playerId}-grid" class="grid">
                        <!--<div class="flag" style="--flag-color: blue;"></div>-->
                    </div>
                </div>
                <button type="button" id="reset-view-${this.playerId}" class="bgabutton bgabutton_gray reset-view-button">${_('Reset view')}</button>
            </div>
        </div>
        `;
        document.getElementById('tables').insertAdjacentHTML('beforeend', html);
        if (this.playerId == 0) {
            document.getElementById(`player-table-${this.playerId}-frame`).insertAdjacentHTML('beforebegin', `
            <div class="solo-text">${this.getSoloText(player.lvl + 1)}</div>
            `);
        }
        this.city = document.getElementById(`player-table-${this.playerId}-city`) as HTMLDivElement;
        this.grid = document.getElementById(`player-table-${this.playerId}-grid`) as HTMLDivElement;
        document.getElementById(`reset-view-${this.playerId}`).addEventListener('click', () => this.game.viewManager.resetView());

        this.createGrid(player.board, lastMove);

        this.city.style.transform = "rotatex(" + (game as any).control3dxaxis + "deg) translate(" + (game as any).control3dypos + "px," + (game as any).control3dxpos + "px) rotateZ(" + (game as any).control3dzaxis + "deg) scale3d(" + (game as any).control3dscale + "," + (game as any).control3dscale + "," + (game as any).control3dscale + ")";
        this.game.viewManager.draggableElement3d(this.city);
    }    

    public cleanPossibleHex() {
        Array.from(this.grid.querySelectorAll('.possible')).forEach((option: HTMLElement) => option.parentElement.remove());
    }
    
    public setPlaceTileOptions(options: PlaceTileOption[], rotation: number) {
        this.cleanPossibleHex();
        const pivot = this.game.usePivotRotation();

        options/*.filter(option => option.r.some(r => r == rotation))*/.forEach(option => {
            if (pivot) {
                if (option.r && option.r.includes(0)) {
                    const pivot = this.createPossiblePivot(option.x, option.y, option.z);
                    pivot.addEventListener('click', () => {
                        this.game.possiblePositionClicked(option.x, option.y, option.z);
                    });
                }
            } else {
                const hex = this.createPossibleHex(option.x, option.y, option.z);
                const face = hex.getElementsByClassName('face')[0] as HTMLDivElement;
                face.addEventListener('click', () => {
                    this.game.possiblePositionClicked(option.x, option.y, option.z);
                });
            }
        });
    }

    public placeTile(tile: Tile, lastMove: boolean, type: 'final' | 'preview' | 'invisible', selectedHexIndex: number = null): HTMLDivElement {
        if (this.playerId == 0) {
            const placedTiles = this.city.querySelectorAll('.tile:not(.invisible)').length;
            const x = placedTiles % 5;
            const y = Math.floor(placedTiles / 5);

            tile.x = x * 2.5 - 5;
            tile.y = 3.5 + y * 4.5;
            tile.z = 0;
            tile.r = 0;
        }

        const tileDiv = this.game.tilesManager.createTile(tile, true, [type]);
        tileDiv.style.setProperty('--x', `${tile.x}`);
        tileDiv.style.setProperty('--y', `${tile.y}`);
        tileDiv.style.setProperty('--z', `${tile.z}`);
        tileDiv.style.setProperty('--r', `${tile.r}`);
        tileDiv.dataset.z = `${tile.z % 4}`;
        tileDiv.dataset.selectedHexIndex = `${selectedHexIndex}`;
        this.grid.appendChild(tileDiv);
        this.removePreviewTile();

        if (type === 'preview') {
            tile.hexes.forEach((hex, index) => {
                const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`);
                if (index == selectedHexIndex && !this.game.usePivotRotation()) {
                    hexDiv.classList.add('selected');
                    hexDiv.addEventListener('click', () => this.game.incRotation());
                }
            });

            this.previewTile = tileDiv;
        } else {
            this.removeInvisibleTile();
            if (type === 'invisible') {
                this.invisibleTile = tileDiv;
            }

            this.minX = Math.min(this.minX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].minX);
            this.minY = Math.min(this.minY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].minY);
            this.maxX = Math.max(this.maxX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].maxX);
            this.maxY = Math.max(this.maxY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].maxY);

            const middleX = (this.maxX + this.minX) / 2;
            const middleY = (this.maxY + this.minY) / 2;

            this.grid.style.setProperty('--x-shift', ''+middleX);
            this.grid.style.setProperty('--y-shift', ''+middleY);
        }

        if (lastMove) {
            Array.from(this.grid.getElementsByClassName('last-move')).forEach(elem => elem.classList.remove('last-move'));
            tileDiv.classList.add('last-move');
        }

        return tileDiv;
    }

    public rotatePreviewTile(r: number) {
        this.previewTile?.style.setProperty('--r', `${r}`);
    }
    
    public removePreviewTile() {
        this.previewTile?.remove();
        this.previewTile = null;
    }
    
    private removeInvisibleTile() {
        this.previewTile?.remove();
        this.previewTile = null;
    }

    private createStartTile() {
        this.createTileHex(0, 0, 0, 'house-plaza');
        this.createTileHex(0, -2, 0, 'quarry');
        this.createTileHex(1, 1, 0, 'quarry');
        this.createTileHex(-1, 1, 0, 'quarry');
    }

    private createGrid(board: PlayerBoard, lastMove: Tile | undefined) {
        this.createStartTile();
        board.tiles.forEach(tile => this.placeTile(tile, tile.id == lastMove?.id, 'final'));
    }
    
    private createTileHex(x: number, y: number, z: number, types: string) {
        const hex = this.game.tilesManager.createTileHex(x, y, z, types, true);
        //hex.id = `player-${this.playerId}-hex-${x}-${y}-${z}`;
        this.grid.appendChild(hex);
        
        //const { type, plaza } = this.game.tilesManager.hexFromString(types);
        //this.game.setTooltip(hex.id, this.game.tilesManager.getHexTooltip(type, plaza));
    }
    
    private createPossibleHex(x: number, y: number, z: number) {
        const hex = this.game.tilesManager.createPossibleHex(x, y, z);
        //hex.id = `player-${this.playerId}-possible-hex-${x}-${y}-${z}`;
        this.grid.appendChild(hex);
        return hex;
    }

    private createPossiblePivot(x: number, y: number, z: number) {
        const pivot = document.createElement('div');
        pivot.style.setProperty('--x', `${x}`);
        pivot.style.setProperty('--y', `${y}`);
        pivot.style.setProperty('--z', `${z}`);
        pivot.classList.add('pivot');
        this.grid.appendChild(pivot);
        return pivot;
    }

    private getSoloDifficulty(level: number) {
        switch (level) {
            case 1: return _('Easy level');
            case 2: return _('Medium level');
            case 3: return _('Hard level');
        }
    }

    private getSoloText(level: number) {
        switch (level) {
            case 1: return _('All the Districts of Hippodamos are considered to be at the 1st level.');
            case 2: return _('All the Districts of Metagenes are considered to be at the 1st level. Metagenes earns 2 additional points for each Quarry he owns.');
            case 3: return _('All Callicrates Districts are considered to be at the 2nd level.');
        }
    }
}