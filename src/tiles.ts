class TilesManager {
    constructor(public game: AkropolisGame) {
        // TODO
    }

    public createTile() {
        const tile = document.createElement('div');
        tile.id = `tile_11`;
        tile.classList.add(`tile`, `rotate60`, `level1`);
        tile.style.left = `-77px`;
        tile.style.top = `7px`;
        
        tile.innerHTML = `
        <div id="tile_11" class="tile rotate60 level1" style="left: -77px; top: -70px;">
            <div id="hex_11_0" class="subface0 face face-6" title="Volcan, niveau 1"></div>
            <div id="hex_11_1" class="subface1 face face-1" title="Forêt, niveau 1">
                <div class="facelabel">1</div>
            </div>
            <div id="hex_11_2" class="subface2 face face-2" title="Prairie, niveau 1">
                <div class="facelabel">1</div>
            </div>
            <div class="sides">
                <div class="side side1"></div>
                <div class="side side2"></div>
                <div class="side side3"></div>
                <div class="side side4"></div>
                <div class="side side5"></div>
                <div class="side side6"></div>
            </div>
        </div>
        `;

        return tile;
    }
    
    public createHex(x: number, y: number, z: number, classes: string[] = []): HTMLDivElement {
        const hex = document.createElement('div');
        hex.classList.add(...classes);
        hex.style.setProperty('--x', `${x}`);
        hex.style.setProperty('--y', `${y}`);
        hex.style.setProperty('--z', `${z}`);
        return hex;
    }
    
    public createTileHex(x: number, y: number, z: number, type: string, plaza: boolean): HTMLDivElement {
        const hex = this.createHex(x, y, z, ['temp', 'hex']);
        hex.dataset.type = type;
        hex.dataset.plaza = plaza.toString();
        hex.innerHTML = `${type}${plaza ? `<br>(plaza)` : ''}<br>${x}, ${y}, ${z}`;
        return hex;
    }
    
    public createPossibleHex(x: number, y: number, z: number): HTMLDivElement {
        return this.createHex(x, y, z, ['possible', 'hex']);
    }

    public testTile() {
        document.getElementById('test').appendChild(this.createTile());
    }
}