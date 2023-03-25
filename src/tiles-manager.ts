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
        const hex = this.createHex(x, y, z);

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

    public getTypeTitle(type: string) {
        switch (type) {
            case 'house': return _('Houses');
            case 'market': return _('Markets');
            case 'barrack': return _('Barracks');
            case 'temple': return _('Temples');
            case 'garden': return _('Gardens');
        }
    }

    public getScoreCondition(type: string) {
        switch (type) {
            case 'house': return _("You only earn points for Houses that are part of your largest group of adjacent Houses.");
            case 'market': return _("A Market must not be adjacent to any other Market.");
            case 'barrack': return _("Barracks must be placed on the edge of your city.");
            case 'temple': return _("Temples must be completely surrounded.");
            case 'garden': return _("There are no placement conditions on Gardens.");
        }
    }

    public getHexTooltip(type: string, plaza: boolean) {
        if (plaza) {
            return `<strong>${_('Plazas')}</strong>
            <br><br>
            ${_("Plazas will multiply the points that you gain for Districts of the same type at the end of the game. The multipliers are represented by the stars. If you have several matching Plazas, their stars are cumulative.") + `<br><br>` + _("A Plaza does not need to border Districts of the same type.")}`;
        } else if (type === 'quarry') {
            return `<strong>${_('Quarries')}</strong>
            <br><br>
            ${_("Quarries do not score any points at the end of the game, but they allow you to gain Stones. When an Architect covers a Quarry with another tile, they take 1 Stone from the reserve.")}`;
        } else {
            let firstLine = null;

            switch (type) {
                case 'house':
                    firstLine = _("The citizens of your city like to live together in one large neighborhood.");
                    break;
                case 'market':
                    firstLine = _("Merchants don’t like competition, so want to be kept separate from other markets.");
                    break;
                case 'barrack':
                    firstLine = _("Soldiers keep watch over your city’s borders.");
                    break;
                case 'temple':
                    firstLine = _("Priests attract followers from the surrounding area.");
                    break;
                case 'garden':
                    firstLine = _("Parks always enhance your city.");
                    break;
            }

            return `<strong>${this.getTypeTitle(type)}</strong>
                    <br><br>
                    <i>${firstLine}</i><br>
                    <strong>${_('Score condition:')}</strong> ${this.getScoreCondition(type)}
                    <br><br>
                    ${_("A District constructed on a higher level of your City can earn you more points. The value of a District is defined by its construction height: a District built on the 1st level would be worth 1 point, on the 2nd level 2 points, on the 3rd level 3 points, etc.")}`; 
        }
    }

    public getVariantTooltip(type: string) {
        switch (type) {
            case 'house':
                return _("If your group of Houses Districts has a value of 10 or more, its points are doubled.");
            case 'market':
                return _("If your Market District is next to a Market Plaza, its points are doubled.");
            case 'barrack':
                return _("If your Barracks has 3 or 4 empty spaces adjacent to it, its points are doubled.");
            case 'temple':
                return _("If your Temple is built on a higher level, its points are doubled.");
            case 'garden':
                return _("If your Garden is adjacent to a lake (an empty space that is completely surrounded), its points are doubled.");
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

        hex.appendChild(face);
        return hex;
    }
}