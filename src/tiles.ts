const TILE_COORDINATES = [
    [0, 0],
    [1, 1],
    [0, 2],
];

class TilesManager {
    constructor(public game: AkropolisGame) {}

    public hexFromString(types: string) {
        const typeArray = types.split('-');
        const type = typeArray[0];
        const plaza = typeArray[1] === 'plaza';
        return { type, plaza };
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
        const { type, plaza } = this.hexFromString(types);
        face.dataset.type = type;
        face.dataset.plaza = (plaza ?? false).toString();
        return hex;
    }
    
    public createPossibleHex(x: number, y: number, z: number): HTMLDivElement {
        return this.createHex(x, y, z, ['possible']);
    }

    public createTile(tile: Tile, withSides: boolean = true, classes: string[] = []): HTMLDivElement {
        const tileDiv = document.createElement('div');
        tileDiv.classList.add('tile', ...classes);
        let firstHex = null; // temp
        tile.hexes.forEach((hex, index) => {
            const hexDiv = this.createTileHex(TILE_COORDINATES[index][0], TILE_COORDINATES[index][1], 0, hex, withSides);
            hexDiv.dataset.index = `${index}`;
            if (index == 0) { firstHex = hexDiv; } // temp
            tileDiv.appendChild(hexDiv);
        });
        return tileDiv;
    }

    public getHexTooltip(type: string, plaza: boolean) {
        if (plaza) {
            return _("Plazas will multiply the points that you gain for Districts of the same type at the end of the game. The multipliers are represented by the stars. If you have several matching Plazas, their stars are cumulative.") + `<br><br>` + _("A Plaza does not need to border Districts of the same type.");
        } else if (type === 'quarry') {
            return _("Quarries do not score any points at the end of the game, but they allow you to gain Stones. When an Architect covers a Quarry with another tile, they take 1 Stone from the reserve.");
        } else {
            let title = null;
            let firstLine = null;
            let secondLine = null;


            switch (type) {
                case 'house':
                    title = _('Houses');
                    firstLine = _("The citizens of your city like to live together in one large neighborhood.");
                    secondLine = _("You only earn points for Houses that are part of your largest group of adjacent Houses.");
                    break;
                case 'market':
                    title = _('Markets');
                    firstLine = _("Merchants don’t like competition, so want to be kept separate from other markets.");
                    secondLine = _("A Market must not be adjacent to any other Market.");
                    break;
                case 'barrack':
                    title = _('Barracks');
                    firstLine = _("Soldiers keep watch over your city’s borders.");
                    secondLine = _("Barracks must be placed on the edge of your city.");
                    break;
                case 'temple':
                    title = _('Temples');
                    firstLine = _("Priests attract followers from the surrounding area.");
                    secondLine = _("Temples must be completely surrounded.");
                    break;
                case 'garden':
                    title = _('Gardens');
                    firstLine = _("Parks always enhance your city.");
                    secondLine = _("There are no placement conditions on Gardens.");
                    break;
            }

            return `${_("A District can be constructed freely but to gain points, each one must meet the placement condition for its type and have least one Plaza of that color.")}
                    <br><br>
                    <strong>${title}</strong>
                    <br><br>
                    <i>${firstLine}</i><br>
                    ${secondLine}
                    <br><br>
                    ${_("A District constructed on a higher level of your City can earn you more points. The value of a District is defined by its construction height: a District built on the 1st level would be worth 1 point, on the 2nd level 2 points, on the 3rd level 3 points, etc.")}`; 
        }
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