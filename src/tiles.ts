class TilesManager {
    constructor(public game: AkropolisGame) {}
    
    public createHex(x: number, y: number, z: number, faceClasses: string[] = []): HTMLDivElement {
        const hex = document.createElement('div');
        hex.classList.add('hex');
        hex.style.setProperty('--x', `${x}`);
        hex.style.setProperty('--y', `${y}`);
        hex.style.setProperty('--z', `${z}`);

        const face = document.createElement('div');
        face.classList.add('face', ...faceClasses);
        hex.appendChild(face);
        return hex;
    }
    
    public createTileHex(x: number, y: number, z: number, type: string, plaza: boolean, withSides: boolean = true): HTMLDivElement {
        const hex = this.createHex(x, y, z, ['temp']);

        if (withSides) {
            for (let i = 0; i < 6; i++) {
                const side = document.createElement('div');
                side.classList.add('side');
                side.style.setProperty('--side', `${i}`);
                hex.appendChild(side);
            }
        }

        // temp
        const face = hex.getElementsByClassName('face')[0] as HTMLDivElement;
        face.dataset.type = type;
        face.dataset.plaza = (plaza ?? false).toString();
        face.innerHTML = `${type}${plaza ? `<br>(plaza)` : ''}<br>${x}, ${y}, ${z}`;
        return hex;
    }
    
    public createPossibleHex(x: number, y: number, z: number): HTMLDivElement {
        return this.createHex(x, y, z, ['possible']);
    }

    public createMarketTile(hexes: any[]): HTMLDivElement {
        const XY = [
            [0, 0],
            [1, 1],
            [0, 2],
        ]
        const tile = document.createElement('div');
        tile.classList.add('tile');
        hexes.forEach((hex, index) => tile.appendChild(this.createTileHex(XY[index][0], XY[index][1], 0, hex.type, hex.plaza, false)));
        return tile;
    }
}