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

function formatTextIcons(text: string): string {
    if (typeof text !== 'string') { // TODO TEMP
        return '';
    }
    console.log(text);

    // TODO format icons
   return text
       .replace(/<STONE>/g, `<div class="stone score-icon"></div>`);

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

        return `<div id="construction-card-${card.id}" class="construction-card" style="background-position: ${col * 100 / 8}% ${row * 100}%; --background: ${CARDS[card.id]};">
            <div class="name-wrapper"><div class="name">${_(card.name)}</div></div>
            <div class="desc">${formatTextIcons(_(card.desc))}</div>
        </div>`;
    }

    public getCardTooltip(card: ConstructionCard): string {
        return `<strong>${_(card.name)}</strong>
        <br><br>
        ${_(card.desc)}`;
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
                if (this.selectionActivated) {
                    this.game.constructionSiteHexClicked(tile, this.game.usePivotRotation() ? 0 : index, hexDiv, Number(tileDiv.style.getPropertyValue('--r')));
                }
            });
        });
        return tileDiv;
    }
    
    public setRotation(rotation: number, tile: Tile) {        
        const tileDiv = document.getElementById(`market-tile-${tile.id}`).getElementsByClassName('tile')[0] as HTMLDivElement;

        tileDiv.style.setProperty('--r', `${rotation}`);
    }

    public setSelectable(selectable: number[]) {
        this.selectionActivated = selectable.length > 0;
        [1,2,3,4].forEach(space => {
            document.getElementById(`athena-tiles-${space}`).classList.toggle('selectable', selectable.includes(space));
        });
    }
}