interface ConstructionCard {
    id: string;
    location: string;
}

class AthenaConstructionSpace {
    private selectionActivated: boolean = false;

    constructor(private game: AkropolisGame, cards: ConstructionCard[], dockTiles: Tile[]) {
        let html = `
            <div id="athena-contruction-space">`;

        [1,2,3,4].forEach(space => {
            html += `<div>${this.generateCardHTML(cards.find(card => card.location === `athena-${space}`))}</div>`;
        });
        [1,2,3,4].forEach(space => {
            html += `<div id="athena-tiles-${space}" class="athena-tiles-space"></div>`;
        });
        html += `</div>`;
        document.getElementById('market').insertAdjacentHTML('beforebegin', html);

        [1,2,3,4].forEach(space => {
            const tiles = dockTiles.filter(tile => tile.location === `athena-${space}`);
            tiles.forEach(tile => document.getElementById(`athena-tiles-${space}`).appendChild(this.createSingleMarketTile(tile)));
        });
    }

    private generateCardHTML(card: ConstructionCard): string {
        return `<div class="construction-card">
            <strong>${card.id}</strong>
        </div>`;
    }

    private createSingleMarketTile(tile: Tile): HTMLDivElement {
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
}