interface ConstructionCard {
    id: string;
    location: string;
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
            const tiles = dockTiles.filter(tile => tile.location === `athena-${space}`);
            tiles.forEach(tile => this.addTile(tile, space));
        });
    }

    private generateCardHTML(card: ConstructionCard): string {
        return `<div id="construction-card-${card.id}" class="construction-card">
            <strong>${card.id}</strong>
        </div>`;
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