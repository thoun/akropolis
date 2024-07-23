interface ConstructionCard {
    id: string;
    location: string;
    name: string;
    desc: string;
}

const CARDS = {
    "Housing": '#55b5e9',
    "Villa": '#55b5e9',
    "DistrictCenter": '#55b5e9',
    "CityMarket": '#fcc812',
    "Storehouses": '#fcc812',
    "LuxuryGoods": '#fcc812',
    "Rampart": '#d11e25',
    "GuardTower": '#d11e25',
    "Fortress": '#d11e25',
    "Sanctuary": '#782f9a',
    "Pantheon": '#782f9a',
    "PilgrimsStairs": '#782f9a',
    "Oasis": '#3cb941',
    "HangingGardens": '#3cb941',
    "Parkland": '#3cb941',
    "MainStreet": '#918f90',
    "QuarryMine": '#918f90',
    "Agora": '#918f90',
};

const COLORED_DISCTRICT_ICON = (color: string) => `<svg width="100%" height="100%" viewBox="0 0 9 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M8.531,7.388l0,-4.925l-4.265,-2.463l-4.266,2.463l0,4.925l4.266,2.463l4.265,-2.463Z" style="fill:${color};fill-rule:nonzero;"/></svg>`;
const COLORED_PLAZA_ICON = (color: string) => `<svg width="100%" height="100%" viewBox="0 0 11 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M10.71,3.997l-2.142,2.322c-0.153,0.166 -0.225,0.392 -0.197,0.617l0.402,3.133c0.013,0.1 -0.089,0.175 -0.18,0.133l-2.87,-1.32c-0.206,-0.094 -0.443,-0.093 -0.648,0.004l-2.856,1.35c-0.091,0.043 -0.193,-0.031 -0.182,-0.13l0.368,-3.138c0.027,-0.225 -0.048,-0.45 -0.203,-0.615l-2.167,-2.298c-0.069,-0.073 -0.03,-0.194 0.068,-0.214l3.098,-0.619c0.222,-0.045 0.413,-0.185 0.521,-0.384l1.517,-2.771c0.048,-0.088 0.175,-0.089 0.224,-0.001l1.547,2.754c0.111,0.198 0.303,0.336 0.526,0.378l3.104,0.586c0.098,0.019 0.138,0.139 0.07,0.213" style="fill:${color};fill-rule:nonzero;"/></svg>`;
const WHITE_DISCTRICT_ICON = `<svg width="100%" height="100%" viewBox="0 0 10 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M0.141,7.797l0,-5.089l4.407,-2.545l4.407,2.545l0,5.089l-4.407,2.544l-4.407,-2.544Z" style="fill:#fff;fill-rule:nonzero;"/><path d="M4.549,0l-0.142,0.082l-4.265,2.462l-0.142,0.082l-0,5.253l0.142,0.082l4.265,2.462l0.142,0.082l0.142,-0.082l4.265,-2.462l0.142,-0.082l-0,-5.253l-0.142,-0.082l-4.265,-2.462l-0.142,-0.082Zm-0,0.327l4.265,2.463l-0,4.925l-4.265,2.463l-4.265,-2.463l-0,-4.925l4.265,-2.463Z" style="fill:#231f20;fill-rule:nonzero;"/></svg>`;
const WHITE_PLAZA_ICON = `<svg width="100%" height="100%" viewBox="0 0 12 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M2.448,10.673c-0.077,0 -0.15,-0.033 -0.202,-0.091c-0.051,-0.057 -0.074,-0.134 -0.066,-0.21l0.369,-3.138c0.021,-0.183 -0.039,-0.366 -0.167,-0.501l-2.167,-2.298c-0.067,-0.072 -0.09,-0.175 -0.06,-0.268c0.029,-0.093 0.107,-0.163 0.203,-0.182l3.099,-0.62c0.181,-0.036 0.336,-0.15 0.425,-0.312l1.516,-2.771c0.048,-0.087 0.139,-0.141 0.237,-0.141c0.098,0 0.186,0.052 0.235,0.138l1.547,2.755c0.091,0.161 0.247,0.273 0.428,0.307l3.105,0.587c0.096,0.018 0.175,0.086 0.205,0.179c0.031,0.093 0.01,0.196 -0.057,0.268l-2.142,2.323c-0.126,0.136 -0.185,0.319 -0.16,0.502l0.401,3.134c0.011,0.075 -0.013,0.153 -0.063,0.211c-0.052,0.059 -0.126,0.093 -0.204,0.093l-0.031,0l-0.082,-0.025l-2.871,-1.319c-0.082,-0.038 -0.169,-0.057 -0.26,-0.057c-0.092,0 -0.184,0.02 -0.267,0.06l-2.884,1.363l-0.087,0.013Z" style="fill:#fff;fill-rule:nonzero;"/><path d="M5.635,-0c-0.15,-0 -0.289,0.082 -0.361,0.214l-1.517,2.771c-0.068,0.125 -0.188,0.213 -0.328,0.242l-3.098,0.619c-0.147,0.03 -0.266,0.136 -0.311,0.279c-0.046,0.142 -0.01,0.298 0.092,0.407l2.167,2.299c0.098,0.104 0.145,0.245 0.128,0.387l-0.368,3.137c-0.013,0.117 0.023,0.234 0.101,0.322c0.079,0.088 0.191,0.138 0.308,0.138c0.061,-0 0.12,-0.013 0.176,-0.04l2.856,-1.35c0.064,-0.03 0.135,-0.046 0.206,-0.046c0.07,-0 0.138,0.015 0.202,0.044l2.87,1.319c0.054,0.025 0.112,0.038 0.172,0.038c0.118,-0 0.231,-0.051 0.309,-0.14c0.078,-0.089 0.114,-0.207 0.099,-0.324l-0.402,-3.133c-0.018,-0.142 0.027,-0.284 0.124,-0.389l2.142,-2.322c0.101,-0.11 0.135,-0.266 0.088,-0.408c-0.047,-0.142 -0.167,-0.248 -0.314,-0.275l-3.104,-0.587c-0.141,-0.026 -0.262,-0.113 -0.332,-0.238l-1.546,-2.754c-0.073,-0.13 -0.21,-0.21 -0.359,-0.21m-0,0.283c0.044,-0 0.087,0.022 0.112,0.066l1.546,2.754c0.111,0.198 0.304,0.336 0.526,0.378l3.104,0.586c0.099,0.019 0.139,0.139 0.071,0.213l-2.142,2.322c-0.154,0.166 -0.226,0.392 -0.197,0.617l0.402,3.133c0.01,0.08 -0.054,0.145 -0.127,0.145c-0.018,-0 -0.036,-0.004 -0.054,-0.012l-2.87,-1.32c-0.101,-0.046 -0.211,-0.07 -0.32,-0.07c-0.112,-0 -0.224,0.025 -0.327,0.074l-2.856,1.35c-0.018,0.009 -0.037,0.013 -0.055,0.013c-0.073,-0 -0.136,-0.064 -0.127,-0.144l0.368,-3.137c0.026,-0.225 -0.048,-0.45 -0.204,-0.615l-2.166,-2.298c-0.069,-0.074 -0.031,-0.194 0.068,-0.214l3.097,-0.62c0.222,-0.044 0.413,-0.184 0.522,-0.383l1.517,-2.771c0.024,-0.044 0.068,-0.067 0.112,-0.067" style="fill:#231f20;fill-rule:nonzero;"/></svg>`;

function formatDescIcons(text: string, color: string): string {
    if (typeof text !== 'string') { // TODO TEMP
        return '';
    }
    
    return text
       .replace(/<STONE>/g, `<div class="stone score-icon"></div>`)
       .replace(/<PLAZA>/g, WHITE_PLAZA_ICON)
       .replace(/<DISTRICT>/g, WHITE_DISCTRICT_ICON)
       .replace(/<(\w+)_PLAZA>/g, COLORED_PLAZA_ICON(color))
       .replace(/<(\w+)>/g, COLORED_DISCTRICT_ICON(color)); // last, because not suffixed by _DISTRICT

}

class AthenaConstructionSite {
    private selectionActivated: boolean = false;

    constructor(private game: AkropolisGame, cards: ConstructionCard[], dockTiles: Tile[]) {
        let html = `
            <div id="athena-contruction-space">`;

        [1,2,3,4].forEach(space => {
            const card = cards.find(card => card.location === `athena-${space}`);
            html += `<div>${this.generateCardHTML(card)}</div>`;
        });
        [1,2,3,4].forEach(space => {
            html += `<div id="athena-tiles-${space}" class="athena-tiles-space"></div>`;
        });
        html += `</div>`;
        document.getElementById('market').insertAdjacentHTML('beforebegin', html);

        [1,2,3,4].forEach(space => {
            const card = cards.find(card => card.location === `athena-${space}`);
            this.game.setTooltip(`construction-card-${card.id}`, this.getCardTooltip(card));

            const tiles = dockTiles.filter(tile => tile.location === `athena-${space}`);
            tiles.forEach(tile => this.addTile(tile, space));
        });
    }

    private generateCardHTML(card: ConstructionCard): string {
        const cardIndex = Object.keys(CARDS).indexOf(card.id);
        const row = Math.floor(cardIndex / 9);
        const col = cardIndex % 9;
        const color = CARDS[card.id];

        return `<div id="construction-card-${card.id}" class="construction-card" style="background-position: ${col * 100 / 8}% ${row * 100}%; --background: ${color};">
            <div class="name-wrapper"><div class="name">${_(card.name)}</div></div>
            <div class="desc">${formatDescIcons(_(card.desc), color)}</div>
        </div>`;
    }

    public getCardTooltip(card: ConstructionCard): string {
        const color = CARDS[card.id];

        return `<strong>${_(card.name)}</strong>
        <br><br>
        ${formatDescIcons(_(card.desc), color)}`;
    }

    public addTile(tile: Tile, space: number) {
        const tileWithWrapper = document.createElement('div');
        tileWithWrapper.id = `market-tile-${tile.id}`;
        const tileDiv = this.createSingleTile(tile);
        tileWithWrapper.appendChild(tileDiv);
        document.getElementById(`athena-tiles-${space}`).appendChild(tileWithWrapper);

        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
            hexDiv.id = `market-tile-${tile.id}-hex-${index}`;
            const { type, plaza } = this.game.tilesManager.hexFromString(hex);
            const tooltip = type.split('-').map(t => this.game.tilesManager.getHexTooltip(t, plaza)).join('<hr>');
            this.game.setTooltip(hexDiv.id, tooltip);
        });
    }

    private createSingleTile(tile: Tile): HTMLDivElement {
        const tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
            hexDiv.addEventListener('click', () => {
                if (this.selectionActivated && hexDiv.closest('.athena-tiles-space.selectable')) {
                    this.game.constructionSiteHexClicked(tile, this.game.usePivotRotation() ? 0 : index, hexDiv, Number(tileDiv.style.getPropertyValue('--r')));
                }
            });
        });
        return tileDiv;
    }
    
    public setRotation(rotation: number, tile: Tile) {        
        const tileDiv = document.getElementById(`market-tile-${tile.id}`).getElementsByClassName('tile')[0] as HTMLDivElement;

        const SHIFT_LEFT = [0, -6, -6, 0, 6, 6];
        const SHIFT_TOP = [0, -3, -10, -13, -10, -3];

        tileDiv.style.setProperty('--r', `${rotation}`);
        tileDiv.style.setProperty('--shift-left', `${SHIFT_LEFT[(rotation + 600) % 6]}px`);
        tileDiv.style.setProperty('--shift-top', `${SHIFT_TOP[(rotation + 600) % 6]}px`);
    }

    public setSelectable(selectable: number[]) {
        this.selectionActivated = selectable.length > 0;
        [1,2,3,4].forEach(space => {
            document.getElementById(`athena-tiles-${space}`).classList.toggle('selectable', selectable.includes(space));
        });
    }

    public removeTile(tile: Tile) {
        document.getElementById(`market-tile-${tile.id}`)?.remove();
    }

    public setSelectedHex(tileId: number, hex: HTMLDivElement) {
        Array.from(document.getElementById('athena-contruction-space').querySelectorAll('.selected')).forEach(option => option.classList.remove('selected'));
        document.getElementById(`market-tile-${tileId}`)?.classList.add('selected');
        if (!this.game.usePivotRotation()) {
            hex?.classList.add('selected');
        }
    }
}