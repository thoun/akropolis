class TilesManager {
    constructor(public game: AkropolisGame) {}
    
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
        return hex;
    }
    
    public createPossibleHex(x: number, y: number, z: number): HTMLDivElement {
        return this.createHex(x, y, z, ['possible']);
    }

    public createMarketTile(tile: Tile): HTMLDivElement {
        const XY = [
            [0, 0],
            [1, 1],
            [0, 2],
        ]
        const tileDiv = document.createElement('div');
        tileDiv.classList.add('tile');
        let firstHex = null; // temp
        tile.hexes.forEach((hex, index) => {
            const hexDiv = this.createTileHex(XY[index][0], XY[index][1], 0, hex, false);
            if (index == 0) { firstHex = hexDiv; } // temp
            hexDiv.addEventListener('click', () => this.game.constructionSiteHexClicked(tile.id, tileDiv, firstHex/* temp hexDiv*/));
            tileDiv.appendChild(hexDiv);
        });
        return tileDiv;
    }
    
    private createHex(x: number, y: number, z: number, faceClasses: string[] = []): HTMLDivElement {
        const hex = document.createElement('div');
        hex.classList.add('hex');
        hex.style.setProperty('--x', `${x}`);
        hex.style.setProperty('--y', `${y}`);
        hex.style.setProperty('--z', `${z}`);

        const face = document.createElement('div');
        face.classList.add('face', ...faceClasses);
        // temp
        face.innerHTML = `${x}, ${y}, ${z}`;
        hex.appendChild(face);
        return hex;
    }
}