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
    
    public createTileHex(x: number, y: number, z: number, types: string, withSides: boolean = true): HTMLDivElement {
        const hex = this.createHex(x, y, z, ['temp']);

        if (withSides) {
            for (let i = 0; i < 6; i++) {
                const side = document.createElement('div');
                side.classList.add('side');
                side.style.setProperty('--side', `${i}`);
                hex.appendChild(side);
            }
        }

        const face = hex.getElementsByClassName('face')[0] as HTMLDivElement;
        const typeArray = types.split('-');
        const type = typeArray[0];
        const plaza = typeArray[1] === 'plaza';
        face.dataset.type = type;
        face.dataset.plaza = (plaza ?? false).toString();
        // temp
        face.innerHTML = `${type}${plaza ? `<br>(plaza)` : ''}<br>${x}, ${y}, ${z}`;
        return hex;
    }
    
    public createPossibleHex(x: number, y: number, z: number): HTMLDivElement {
        return this.createHex(x, y, z, ['possible']);
    }

    public createMarketTile(hexes: string[]): HTMLDivElement {
        const XY = [
            [0, 0],
            [1, 1],
            [0, 2],
        ]
        const tile = document.createElement('div');
        tile.classList.add('tile');
        hexes.forEach((hex, index) => tile.appendChild(this.createTileHex(XY[index][0], XY[index][1], 0, hex, false)));
        return tile;
    }
}