const [BgaJumpTo] = await globalThis.importDojoLibs([
    g_gamethemeurl + 'modules/js/bga-jump-to.js',
]);
const BgaAnimations = await globalThis.importEsmLib('bga-animations', '1.x');

class ViewManager {
    constructor(game) {
        this.game = game;
        this.elements = [];
        this.setDefaultView();
        document.querySelectorAll('.control3d_command').forEach(button => button.addEventListener('click', () => {
            document.getElementById("pagesection_gameview").classList.toggle("view-changed", true);
        }));
    }
    setDefaultView() {
        this.game.bga.display3D.init3d({
            elements: this.elements,
            view: ViewManager.DEFAULT_VIEW,
            draggable: true,
            zoomByWheel: true,
        });
    }
    resetView() {
        this.change3d(0, 0, 0, 0, 0, true, true);
        this.fitCitiesToView();
    }
    fitCitiesToView() {
        let maxSpan = 0;
        this.elements.forEach(element => {
            const tiles = Array.from(element.querySelectorAll('.tile:not(.preview)'));
            let minX = null;
            let maxX = null;
            tiles.forEach(tile => {
                const rect = tile.getBoundingClientRect();
                if (minX == null || rect.x < minX) {
                    minX = rect.x;
                }
                if (maxX == null || (rect.x + rect.width) > maxX) {
                    maxX = rect.x + rect.width;
                }
            });
            if ((maxX - minX) > maxSpan) {
                maxSpan = maxX - minX;
            }
        });
        if (!maxSpan) {
            return;
        }
        const expectedWidth = maxSpan + 50;
        const width = this.elements[0].clientWidth;
        const display3D = this.game.bga.display3D;
        const targetScale = Math.min(width / expectedWidth, 1);
        display3D.setZoom(targetScale);
    }
    draggableElement3d(element) {
        this.elements.push(element);
        this.game.bga.display3D.addElements([element]);
    }
    // override of framework function to apply 3D on each player city instead of the whole view
    change3d(incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset) {
        if (is3Dactive != false) {
            const display3D = this.game.bga.display3D;
            reset ? this.setDefaultView() : display3D.change3d(incXAxis, xpos, ypos, xAxis, incScale);
            document.getElementById("pagesection_gameview").classList.toggle("view-changed", !reset);
        }
    }
}
ViewManager.DEFAULT_VIEW = {
    xAxis: 40,
    zAxis: 0,
    xPos: -100,
    yPos: -50,
    zoom: 1,
    maxZoom: 3,
};

const TILE_COORDINATES = [
    [0, 0],
    [1, 1],
    [0, 2],
];
class TilesManager {
    constructor(game) {
        this.game = game;
    }
    hexFromString(types) {
        if (Array.isArray(types)) { // double tiles
            return {
                type: types.map(type => type.split('-')[0]).join('-'),
                plaza: false,
            };
        }
        const typeArray = types.split('-');
        const type = typeArray[0];
        const plaza = typeArray[1] === 'plaza';
        return { type, plaza };
    }
    createTileHex(x, y, z, types, withSides = true) {
        const hex = this.createHex(x, y, z);
        if (withSides) {
            for (let i = 0; i < 6; i++) {
                const side = document.createElement('div');
                side.classList.add('side');
                side.style.setProperty('--side', `${i}`);
                hex.appendChild(side);
            }
        }
        const face = hex.getElementsByClassName('face')[0];
        const { type, plaza } = this.hexFromString(types);
        face.dataset.type = type;
        face.dataset.plaza = (plaza ?? false).toString();
        return hex;
    }
    createPossibleHex(x, y, z) {
        return this.createHex(x, y, z, ['possible']);
    }
    createTile(tile, withSides = true, classes = []) {
        const tileDiv = document.createElement('div');
        if (tile.hexes.length === 1) {
            classes.push('single-tile');
        }
        tileDiv.classList.add('tile', ...classes);
        tile.hexes.forEach((hex, index) => {
            const hexDiv = this.createTileHex(TILE_COORDINATES[index][0], TILE_COORDINATES[index][1], 0, hex, withSides);
            hexDiv.dataset.index = `${index}`;
            tileDiv.appendChild(hexDiv);
        });
        return tileDiv;
    }
    getTypeTitle(type) {
        switch (type) {
            case 'house': return _('Houses');
            case 'market': return _('Markets');
            case 'barrack': return _('Barracks');
            case 'temple': return _('Temples');
            case 'garden': return _('Gardens');
        }
    }
    getScoreCondition(type) {
        switch (type) {
            case 'house': return _("You only earn points for Houses that are part of your largest group of adjacent Houses.");
            case 'market': return _("A Market must not be adjacent to any other Market.");
            case 'barrack': return _("Barracks must be placed on the edge of your city.");
            case 'temple': return _("Temples must be completely surrounded.");
            case 'garden': return _("There are no placement conditions on Gardens.");
        }
    }
    getHexTooltip(type, plaza) {
        if (plaza) {
            return `<strong>${_('Plazas')}</strong>
            <br><br>
            ${_("Plazas will multiply the points that you gain for Districts of the same type at the end of the game. The multipliers are represented by the stars. If you have several matching Plazas, their stars are cumulative.") + `<br><br>` + _("A Plaza does not need to border Districts of the same type.")}`;
        }
        else if (type === 'quarry') {
            return `<strong>${_('Quarries')}</strong>
            <br><br>
            ${_("Quarries do not score any points at the end of the game, but they allow you to gain Stones. When an Architect covers a Quarry with another tile, they take 1 Stone from the reserve.")}`;
        }
        else {
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
    getVariantTooltip(type) {
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
    createHex(x, y, z, faceClasses = []) {
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

class ConstructionSite {
    constructor(game, tiles, remainingStacks) {
        this.game = game;
        this.selectionActivated = false;
        this.market = document.getElementById('market');
        this.remainingstacksDiv = document.getElementById('remaining-stacks');
        this.setTiles(this.orderTiles(tiles.filter(tile => tile.location === 'dock')));
        document.getElementById('remaining-stacks-counter').insertAdjacentText('beforebegin', _('Remaining stacks'));
        this.remainingStacksCounter = new ebg.counter();
        this.remainingStacksCounter.create(`remaining-stacks-counter`);
        this.remainingStacksCounter.setValue(remainingStacks);
    }
    addTile(tile, index) {
        const tileWithCost = document.createElement('div');
        tileWithCost.id = `market-tile-${tile.id}`;
        tileWithCost.classList.add('tile-with-cost');
        tileWithCost.dataset.cost = `${index}`;
        const tileDiv = this.createMarketTile(tile);
        tileWithCost.appendChild(tileDiv);
        const cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = `
            <span>${index}</span>
            <div class="stone score-icon"></div> 
        `;
        tileWithCost.appendChild(cost);
        this.market.appendChild(tileWithCost);
        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`);
            hexDiv.id = `market-tile-${tile.id}-hex-${index}`;
            const { type, plaza } = this.game.tilesManager.hexFromString(hex);
            this.game.setTooltip(hexDiv.id, this.game.tilesManager.getHexTooltip(type, plaza));
        });
    }
    setSelectedHex(tileId, hex) {
        Array.from(this.market.querySelectorAll('.selected')).forEach(option => option.classList.remove('selected'));
        document.getElementById(`market-tile-${tileId}`)?.classList.add('selected');
        if (!this.game.usePivotRotation()) {
            hex?.classList.add('selected');
        }
    }
    setDisabledTiles(playerMoney) {
        Array.from(this.market.querySelectorAll('.disabled')).forEach(option => option.classList.remove('disabled'));
        if (playerMoney !== null) {
            Array.from(this.market.querySelectorAll('.tile-with-cost')).forEach((option) => option.classList.toggle('disabled', Number(option.dataset.cost) > playerMoney));
        }
    }
    async refill(tiles, remainingStacks) {
        const orderedTiles = this.orderTiles(tiles);
        this.setTiles(orderedTiles);
        await Promise.all(orderedTiles.map(tile => {
            const tileWithCost = document.getElementById(`market-tile-${tile.id}`);
            tileWithCost.classList.add('animated-market-tile-with-cost');
            return this.game.animationManager.slideIn(tileWithCost, this.remainingstacksDiv)
                .finally(() => tileWithCost.classList.remove('animated-market-tile-with-cost'));
        }));
        this.remainingStacksCounter.setValue(remainingStacks);
    }
    async animateTileTo(tile, to) {
        const marketTileDiv = document.getElementById(`market-tile-${tile.id}`).querySelector('.tile');
        const animatedTileDiv = marketTileDiv.cloneNode(true);
        animatedTileDiv.classList.add('animated-market-tile');
        await this.game.animationManager.slideFloatingElement(animatedTileDiv, marketTileDiv, to, { scale: 1 });
    }
    removeTile(tile) {
        const index = this.tiles.findIndex(t => t.id == tile.id);
        if (index !== -1) {
            this.tiles.splice(index, 1);
            this.setTiles(this.tiles);
        }
    }
    setSelectable(selectable) {
        this.selectionActivated = selectable;
        this.market.classList.toggle('selectable', selectable);
    }
    setTiles(tiles) {
        this.tiles = tiles;
        Array.from(this.market.querySelectorAll('.tile-with-cost')).forEach(option => option.remove());
        this.tiles.forEach((tile, index) => this.addTile(tile, index));
        if (this.game.bga.players.isCurrentPlayerActive() && this.game.stonesCounters[this.game.getCurrentPlayerId()]) {
            this.setDisabledTiles(this.game.stonesCounters[this.game.getCurrentPlayerId()].getValue());
        }
    }
    createMarketTile(tile) {
        const tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`);
            hexDiv.addEventListener('click', () => {
                if (this.selectionActivated) {
                    this.game.constructionSiteHexClicked(tile, this.game.usePivotRotation() ? 0 : index, hexDiv, Number(tileDiv.style.getPropertyValue('--r')));
                }
            });
        });
        return tileDiv;
    }
    // temp ? remove if sorted by state ASC on back-end side
    orderTiles(tiles) {
        tiles.sort((a, b) => a.state - b.state);
        return tiles;
    }
    setRotation(rotation, tile) {
        const tileDiv = document.getElementById(`market-tile-${tile.id}`).getElementsByClassName('tile')[0];
        const SHIFT_LEFT = [0, 20, -16, 0, -20, 16];
        const SHIFT_TOP = [0, 12, 16, 8, -4, -8];
        tileDiv.style.setProperty('--r', `${rotation}`);
        tileDiv.style.setProperty('--shift-left', `${SHIFT_LEFT[(rotation + 600) % 6]}px`);
        tileDiv.style.setProperty('--shift-top', `${SHIFT_TOP[(rotation + 600) % 6]}px`);
    }
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
const COLORED_DISCTRICT_ICON = (color) => `<svg width="100%" height="100%" viewBox="0 0 9 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M8.531,7.388l0,-4.925l-4.265,-2.463l-4.266,2.463l0,4.925l4.266,2.463l4.265,-2.463Z" style="fill:${color};fill-rule:nonzero;"/></svg>`;
const COLORED_PLAZA_ICON = (color) => `<svg width="100%" height="100%" viewBox="0 0 11 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M10.71,3.997l-2.142,2.322c-0.153,0.166 -0.225,0.392 -0.197,0.617l0.402,3.133c0.013,0.1 -0.089,0.175 -0.18,0.133l-2.87,-1.32c-0.206,-0.094 -0.443,-0.093 -0.648,0.004l-2.856,1.35c-0.091,0.043 -0.193,-0.031 -0.182,-0.13l0.368,-3.138c0.027,-0.225 -0.048,-0.45 -0.203,-0.615l-2.167,-2.298c-0.069,-0.073 -0.03,-0.194 0.068,-0.214l3.098,-0.619c0.222,-0.045 0.413,-0.185 0.521,-0.384l1.517,-2.771c0.048,-0.088 0.175,-0.089 0.224,-0.001l1.547,2.754c0.111,0.198 0.303,0.336 0.526,0.378l3.104,0.586c0.098,0.019 0.138,0.139 0.07,0.213" style="fill:${color};fill-rule:nonzero;"/></svg>`;
const WHITE_DISCTRICT_ICON = `<svg width="100%" height="100%" viewBox="0 0 10 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M0.141,7.797l0,-5.089l4.407,-2.545l4.407,2.545l0,5.089l-4.407,2.544l-4.407,-2.544Z" style="fill:#fff;fill-rule:nonzero;"/><path d="M4.549,0l-0.142,0.082l-4.265,2.462l-0.142,0.082l-0,5.253l0.142,0.082l4.265,2.462l0.142,0.082l0.142,-0.082l4.265,-2.462l0.142,-0.082l-0,-5.253l-0.142,-0.082l-4.265,-2.462l-0.142,-0.082Zm-0,0.327l4.265,2.463l-0,4.925l-4.265,2.463l-4.265,-2.463l-0,-4.925l4.265,-2.463Z" style="fill:#231f20;fill-rule:nonzero;"/></svg>`;
const WHITE_PLAZA_ICON = `<svg width="100%" height="100%" viewBox="0 0 12 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M2.448,10.673c-0.077,0 -0.15,-0.033 -0.202,-0.091c-0.051,-0.057 -0.074,-0.134 -0.066,-0.21l0.369,-3.138c0.021,-0.183 -0.039,-0.366 -0.167,-0.501l-2.167,-2.298c-0.067,-0.072 -0.09,-0.175 -0.06,-0.268c0.029,-0.093 0.107,-0.163 0.203,-0.182l3.099,-0.62c0.181,-0.036 0.336,-0.15 0.425,-0.312l1.516,-2.771c0.048,-0.087 0.139,-0.141 0.237,-0.141c0.098,0 0.186,0.052 0.235,0.138l1.547,2.755c0.091,0.161 0.247,0.273 0.428,0.307l3.105,0.587c0.096,0.018 0.175,0.086 0.205,0.179c0.031,0.093 0.01,0.196 -0.057,0.268l-2.142,2.323c-0.126,0.136 -0.185,0.319 -0.16,0.502l0.401,3.134c0.011,0.075 -0.013,0.153 -0.063,0.211c-0.052,0.059 -0.126,0.093 -0.204,0.093l-0.031,0l-0.082,-0.025l-2.871,-1.319c-0.082,-0.038 -0.169,-0.057 -0.26,-0.057c-0.092,0 -0.184,0.02 -0.267,0.06l-2.884,1.363l-0.087,0.013Z" style="fill:#fff;fill-rule:nonzero;"/><path d="M5.635,-0c-0.15,-0 -0.289,0.082 -0.361,0.214l-1.517,2.771c-0.068,0.125 -0.188,0.213 -0.328,0.242l-3.098,0.619c-0.147,0.03 -0.266,0.136 -0.311,0.279c-0.046,0.142 -0.01,0.298 0.092,0.407l2.167,2.299c0.098,0.104 0.145,0.245 0.128,0.387l-0.368,3.137c-0.013,0.117 0.023,0.234 0.101,0.322c0.079,0.088 0.191,0.138 0.308,0.138c0.061,-0 0.12,-0.013 0.176,-0.04l2.856,-1.35c0.064,-0.03 0.135,-0.046 0.206,-0.046c0.07,-0 0.138,0.015 0.202,0.044l2.87,1.319c0.054,0.025 0.112,0.038 0.172,0.038c0.118,-0 0.231,-0.051 0.309,-0.14c0.078,-0.089 0.114,-0.207 0.099,-0.324l-0.402,-3.133c-0.018,-0.142 0.027,-0.284 0.124,-0.389l2.142,-2.322c0.101,-0.11 0.135,-0.266 0.088,-0.408c-0.047,-0.142 -0.167,-0.248 -0.314,-0.275l-3.104,-0.587c-0.141,-0.026 -0.262,-0.113 -0.332,-0.238l-1.546,-2.754c-0.073,-0.13 -0.21,-0.21 -0.359,-0.21m-0,0.283c0.044,-0 0.087,0.022 0.112,0.066l1.546,2.754c0.111,0.198 0.304,0.336 0.526,0.378l3.104,0.586c0.099,0.019 0.139,0.139 0.071,0.213l-2.142,2.322c-0.154,0.166 -0.226,0.392 -0.197,0.617l0.402,3.133c0.01,0.08 -0.054,0.145 -0.127,0.145c-0.018,-0 -0.036,-0.004 -0.054,-0.012l-2.87,-1.32c-0.101,-0.046 -0.211,-0.07 -0.32,-0.07c-0.112,-0 -0.224,0.025 -0.327,0.074l-2.856,1.35c-0.018,0.009 -0.037,0.013 -0.055,0.013c-0.073,-0 -0.136,-0.064 -0.127,-0.144l0.368,-3.137c0.026,-0.225 -0.048,-0.45 -0.204,-0.615l-2.166,-2.298c-0.069,-0.074 -0.031,-0.194 0.068,-0.214l3.097,-0.62c0.222,-0.044 0.413,-0.184 0.522,-0.383l1.517,-2.771c0.024,-0.044 0.068,-0.067 0.112,-0.067" style="fill:#231f20;fill-rule:nonzero;"/></svg>`;
function formatDescIcons(text, color) {
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
    constructor(game, cards, cardStatuses, dockTiles, players) {
        this.game = game;
        this.selectionActivatedForAutomata = false;
        this.selectionActivated = false;
        this.cards = []; // 0 indexed!
        let html = `
            <div id="athena-contruction-spaces">`;
        [1, 2, 3, 4].forEach(space => {
            const card = cards.find(card => card.location === `athena-${space}`);
            this.cards.push(card);
            html += `
            <div id="contruction-space-${card.id}" class="athena-contruction-space">
                <div class="construction-card-holder">${this.generateCardHTML(card)}</div>
                <div class="statue-parts-holder">${players.map(player => {
                const statuePartDone = (cardStatuses[player.id] ?? []).includes(card.id);
                return `<div id="player-statue-part-${player.id}-${space}" class="player-statue-part" style="outline: 1px solid #${player.color}; background-color: #${player.color}20;">
                        <!--<div class="player-name" style="color: #${player.color}">${player.name}</div>-->
                        ${statuePartDone ? '' : `<div class="statue-part" data-part="${space}"></div>`}
                    </div>`;
            }).join('')}</div>
                <div id="athena-tiles-${space}" class="athena-tiles-space"></div>
            </div>
            `;
        });
        html += `</div>`;
        document.getElementById('market').insertAdjacentHTML('beforebegin', html);
        [1, 2, 3, 4].forEach(space => {
            const card = this.cards[space - 1];
            this.game.setTooltip(`construction-card-${card.id}`, this.getCardTooltip(card));
            const tiles = dockTiles.filter(tile => tile.location === `athena-${space}`);
            tiles.forEach(tile => this.addTile(tile, space));
        });
    }
    generateCardHTML(card) {
        const cardIndex = Object.keys(CARDS).indexOf(card.id);
        const row = Math.floor(cardIndex / 9);
        const col = cardIndex % 9;
        const color = CARDS[card.id];
        return `<div id="construction-card-${card.id}" class="construction-card" style="background-position: ${col * 100 / 8}% ${row * 100}%; --background: ${color};">
            <div class="name-wrapper"><div class="name">${_(card.name)}</div></div>
            <div class="desc">${formatDescIcons(_(card.desc), color)}</div>
        </div>`;
    }
    getCardTooltip(card) {
        const color = CARDS[card.id];
        return `<strong>${_(card.name)}</strong>
        <br><br>
        ${formatDescIcons(_(card.desc), color)}`;
    }
    addTile(tile, space) {
        const tileWithWrapper = document.createElement('div');
        tileWithWrapper.id = `market-tile-${tile.id}`;
        const tileDiv = this.createSingleTile(tile);
        tileWithWrapper.appendChild(tileDiv);
        document.getElementById(`athena-tiles-${space}`).appendChild(tileWithWrapper);
        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`);
            hexDiv.id = `market-tile-${tile.id}-hex-${index}`;
            const { type, plaza } = this.game.tilesManager.hexFromString(hex);
            const tooltip = type.split('-').map(t => this.game.tilesManager.getHexTooltip(t, plaza)).join('<hr>');
            this.game.setTooltip(hexDiv.id, tooltip);
        });
    }
    createSingleTile(tile) {
        const tileDiv = this.game.tilesManager.createTile(tile, false);
        tile.hexes.forEach((hex, index) => {
            const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`);
            hexDiv.addEventListener('click', () => {
                if (this.selectionActivated && hexDiv.closest('.athena-tiles-space.selectable') && !hexDiv.closest('.for-automata')) {
                    this.game.constructionSiteHexClicked(tile, this.game.usePivotRotation() ? 0 : index, hexDiv, Number(tileDiv.style.getPropertyValue('--r')));
                }
                if (this.selectionActivatedForAutomata && hexDiv.closest('.athena-tiles-space.selectable')) {
                    this.game.singleTileClickedForAutomata(tile);
                }
            });
        });
        return tileDiv;
    }
    setRotation(rotation, tile) {
        const tileDiv = document.getElementById(`market-tile-${tile.id}`).getElementsByClassName('tile')[0];
        const SHIFT_LEFT = [0, -6, -6, 0, 6, 6];
        const SHIFT_TOP = [0, -3, -10, -13, -10, -3];
        tileDiv.style.setProperty('--r', `${rotation}`);
        tileDiv.style.setProperty('--shift-left', `${SHIFT_LEFT[(rotation + 600) % 6]}px`);
        tileDiv.style.setProperty('--shift-top', `${SHIFT_TOP[(rotation + 600) % 6]}px`);
    }
    setSelectable(selectable, unselectableTiles) {
        this.selectionActivatedForAutomata = unselectableTiles && selectable.length > 0;
        this.selectionActivated = !unselectableTiles && selectable.length > 0;
        [1, 2, 3, 4].forEach(space => {
            document.getElementById(`athena-tiles-${space}`).classList.toggle('selectable', selectable.includes(space));
        });
        unselectableTiles?.forEach(tile => document.getElementById(`market-tile-${tile.id}`).classList.add('unselectable'));
    }
    removeTile(tile) {
        document.getElementById(`market-tile-${tile.id}`)?.remove();
    }
    setSelectedHex(tileId, hex) {
        Array.from(document.getElementById('athena-contruction-spaces').querySelectorAll('.selected')).forEach(option => option.classList.remove('selected'));
        document.getElementById(`market-tile-${tileId}`)?.classList.add('selected');
        if (!this.game.usePivotRotation()) {
            hex?.classList.add('selected');
        }
    }
    async completeCard(playerId, cardId) {
        const space = this.cards.findIndex(card => card.id === cardId) + 1;
        await this.game.animationManager.slideAndAttach(document.querySelector(`#player-statue-part-${playerId}-${space} .statue-part`), document.getElementById(`statue-${playerId}-${space}`));
    }
}

const TILE_SHIFT_BY_ROTATION = [
    { minX: 0, maxX: 1, minY: 0, maxY: 2, },
    { minX: -1, maxX: 0, minY: 0, maxY: 2, },
    { minX: -1, maxX: 0, minY: -1, maxY: 1, },
    { minX: -1, maxX: 0, minY: -2, maxY: 0, },
    { minX: 0, maxX: 1, minY: -2, maxY: 0, },
    { minX: 0, maxX: 1, minY: 1, maxY: 1, },
];
class PlayerTable {
    constructor(game, player, lastMove) {
        this.game = game;
        this.minX = -1;
        this.maxX = 1;
        this.minY = -2;
        this.maxY = 1;
        this.playerId = Number(player.id);
        let html = `
        <div id="player-table-${this.playerId}" class="player-table">
            <div class="name-wrapper" style="color: #${player.color};">
                <div class="pattern left"></div>
                <span class="name">${this.playerId == 0 ? _(player.name) : player.name}</span>
                ${this.playerId == 0 ? `<span class="difficulty">(${this.getSoloDifficulty(player.lvl + 1)})</span>` : ''}
                <div class="pattern right"></div>
            </div>
            <div id="player-table-${this.playerId}-frame" class="frame">
                <div id="player-table-${this.playerId}-city" class="city">
                    <!--<div class="flag" style="--flag-color: red; top: 50%; left: 50%;"></div>-->
                    <div id="player-table-${this.playerId}-grid" class="grid">
                        <!--<div class="flag" style="--flag-color: blue;"></div>-->
                    </div>
                </div>
                <button type="button" id="reset-view-${this.playerId}" class="bgabutton bgabutton_gray reset-view-button">${_('Reset view')}</button>
            </div>
        </div>
        `;
        document.getElementById('tables').insertAdjacentHTML('beforeend', html);
        if (this.playerId == 0) {
            document.getElementById(`player-table-${this.playerId}-frame`).insertAdjacentHTML('beforebegin', `
            <div class="solo-text">${this.getSoloText(player.lvl + 1)}</div>
            `);
        }
        this.city = document.getElementById(`player-table-${this.playerId}-city`);
        this.grid = document.getElementById(`player-table-${this.playerId}-grid`);
        document.getElementById(`reset-view-${this.playerId}`).addEventListener('click', () => this.game.viewManager.resetView());
        this.createGrid(player.board, lastMove);
        this.game.viewManager.draggableElement3d(this.city);
    }
    cleanPossibleHex() {
        Array.from(this.grid.querySelectorAll('.possible')).forEach((option) => option.parentElement.remove());
    }
    setPlaceTileOptions(options, rotation) {
        this.cleanPossibleHex();
        const pivot = this.game.usePivotRotation();
        options /*.filter(option => option.r.some(r => r == rotation))*/.forEach(option => {
            if (pivot) {
                if (option.r && option.r.includes(0)) {
                    const pivot = this.createPossiblePivot(option.x, option.y, option.z);
                    pivot.addEventListener('click', () => {
                        this.game.possiblePositionClicked(option.x, option.y, option.z);
                    });
                }
            }
            else {
                const hex = this.createPossibleHex(option.x, option.y, option.z);
                const face = hex.getElementsByClassName('face')[0];
                face.addEventListener('click', () => {
                    this.game.possiblePositionClicked(option.x, option.y, option.z);
                });
            }
        });
    }
    placeTile(tile, lastMove, type, selectedHexIndex = null) {
        if (this.playerId == 0) {
            const placedTiles = this.city.querySelectorAll('.tile:not(.invisible)').length;
            const x = placedTiles % 5;
            const y = Math.floor(placedTiles / 5);
            tile.x = x * 2.5 - 5;
            tile.y = 3.5 + y * 4.5;
            tile.z = 0;
            tile.r = 0;
        }
        const tileDiv = this.game.tilesManager.createTile(tile, true, [type]);
        tileDiv.style.setProperty('--x', `${tile.x}`);
        tileDiv.style.setProperty('--y', `${tile.y}`);
        tileDiv.style.setProperty('--z', `${tile.z}`);
        tileDiv.style.setProperty('--r', `${tile.r}`);
        tileDiv.dataset.z = `${tile.z % 4}`;
        tileDiv.dataset.selectedHexIndex = `${selectedHexIndex}`;
        this.grid.appendChild(tileDiv);
        this.removePreviewTile();
        if (type === 'preview') {
            tile.hexes.forEach((hex, index) => {
                const hexDiv = tileDiv.querySelector(`[data-index="${index}"]`);
                if (index == selectedHexIndex && !this.game.usePivotRotation()) {
                    hexDiv.classList.add('selected');
                    hexDiv.addEventListener('click', () => this.game.incRotation());
                }
            });
            this.previewTile = tileDiv;
        }
        else {
            this.removeInvisibleTile();
            if (type === 'invisible') {
                this.invisibleTile = tileDiv;
            }
            this.minX = Math.min(this.minX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].minX);
            this.minY = Math.min(this.minY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].minY);
            this.maxX = Math.max(this.maxX, tile.x + TILE_SHIFT_BY_ROTATION[tile.r].maxX);
            this.maxY = Math.max(this.maxY, tile.y + TILE_SHIFT_BY_ROTATION[tile.r].maxY);
            const middleX = (this.maxX + this.minX) / 2;
            const middleY = (this.maxY + this.minY) / 2;
            this.grid.style.setProperty('--x-shift', '' + middleX);
            this.grid.style.setProperty('--y-shift', '' + middleY);
        }
        if (lastMove) {
            Array.from(this.grid.getElementsByClassName('last-move')).forEach(elem => elem.classList.remove('last-move'));
            tileDiv.classList.add('last-move');
        }
        return tileDiv;
    }
    rotatePreviewTile(r) {
        this.previewTile?.style.setProperty('--r', `${r}`);
    }
    removePreviewTile() {
        this.previewTile?.remove();
        this.previewTile = null;
    }
    removeInvisibleTile() {
        this.previewTile?.remove();
        this.previewTile = null;
    }
    createStartTile() {
        this.createTileHex(0, 0, 0, 'house-plaza');
        this.createTileHex(0, -2, 0, 'quarry');
        this.createTileHex(1, 1, 0, 'quarry');
        this.createTileHex(-1, 1, 0, 'quarry');
    }
    createGrid(board, lastMove) {
        this.createStartTile();
        board.tiles.forEach(tile => this.placeTile(tile, tile.id == lastMove?.id, 'final'));
    }
    createTileHex(x, y, z, types) {
        const hex = this.game.tilesManager.createTileHex(x, y, z, types, true);
        //hex.id = `player-${this.playerId}-hex-${x}-${y}-${z}`;
        this.grid.appendChild(hex);
        //const { type, plaza } = this.game.tilesManager.hexFromString(types);
        //this.game.setTooltip(hex.id, this.game.tilesManager.getHexTooltip(type, plaza));
    }
    createPossibleHex(x, y, z) {
        const hex = this.game.tilesManager.createPossibleHex(x, y, z);
        //hex.id = `player-${this.playerId}-possible-hex-${x}-${y}-${z}`;
        this.grid.appendChild(hex);
        return hex;
    }
    createPossiblePivot(x, y, z) {
        const pivot = document.createElement('div');
        pivot.style.setProperty('--x', `${x}`);
        pivot.style.setProperty('--y', `${y}`);
        pivot.style.setProperty('--z', `${z}`);
        pivot.classList.add('pivot');
        this.grid.appendChild(pivot);
        return pivot;
    }
    getSoloDifficulty(level) {
        switch (level) {
            case 1: return _('Easy level');
            case 2: return _('Medium level');
            case 3: return _('Hard level');
        }
    }
    getSoloText(level) {
        switch (level) {
            case 1: return _('All the Districts of Hippodamos are considered to be at the 1st level.');
            case 2: return _('All the Districts of Metagenes are considered to be at the 1st level. Metagenes earns 2 additional points for each Quarry he owns.');
            case 3: return _('All Callicrates Districts are considered to be at the 2nd level.');
        }
    }
}

class StateHandler {
    constructor(game) {
        this.game = game;
    }
    onEnteringState(args, isCurrentPlayerActive) { }
    onLeavingState(args, isCurrentPlayerActive) { }
    onUpdateActionButtons(args, isCurrentPlayerActive) { }
    get args() {
        return this.game.gamedatas.gamestate.private_state?.args ?? this.game.gamedatas.gamestate.args;
    }
}

class CompleteCardState extends StateHandler {
    constructor() {
        super(...arguments);
        this.selectedCard = null;
        this.tileForAutomata = null;
    }
    get stateName() { return `completeCard`; }
    onEnteringState(args, isCurrentPlayerActive) {
        args.cardIds.forEach(id => document.getElementById(`contruction-space-${id}`)?.classList.add('active'));
        this.selectedCard = null;
        this.tileForAutomata = null;
        if (isCurrentPlayerActive) {
            this.game.selectedPosition = null;
            this.game.selectedTile = null;
            this.game.selectedTileHexIndex = null;
            this.game.setRotation(0);
            /*this.getCurrentPlayerTable().setPlaceTileOptions(args.options[0], this.rotation);
            this.constructionSite.setDisabledTiles(this.stonesCounters[this.getPlayerId()].getValue());*/
        }
    }
    onLeavingState(args, isCurrentPlayerActive) {
        if (isCurrentPlayerActive) {
            document.querySelectorAll('.athena-contruction-space.active').forEach(elem => elem.classList.remove('active'));
            this.game.getCurrentPlayerTable().setPlaceTileOptions([], this.game.rotation);
            this.game.athenaConstructionSite.setSelectable([], []);
        }
        this.removeForAutomataClass();
        this.removeUnselectableClass();
        this.selectedCard = null;
        this.tileForAutomata = null;
    }
    onUpdateActionButtons(args, isCurrentPlayerActive) {
        if (isCurrentPlayerActive) {
            if (Object.keys(args.automaPicks).length && !this.tileForAutomata) {
                this.onUpdateActionButtonsForAutomata(args);
            }
            else {
                this.onUpdateActionButtonsForPlayer(args);
            }
        }
    }
    onUpdateActionButtonsForAutomata(args) {
        this.game.bga.statusBar.setTitle(_('${you} may give a tile to the Automata to complete a fulfilled construction card'));
        document.getElementById('generalactions').innerHTML = '';
        this.game.bga.gameui.addActionButton(`skip_button`, _('Skip'), () => this.game.bga.actions.performAction('actSkipCompleteCard'), null, null, 'gray');
        const spaces = args.cardIds.map(id => Number(this.game.gamedatas.cards.find(card => card.id === id).location.split('-')[1]));
        const selectableTilesIds = Object.values(args.automaPicks).flat();
        const tilesOfCards = this.game.gamedatas.dock.filter(tile => tile.location.startsWith('athena') && spaces.includes(Number(tile.location.split('-')[1])));
        this.game.athenaConstructionSite.setSelectable(spaces, tilesOfCards.filter(tile => !selectableTilesIds.includes(tile.id)));
    }
    onUpdateActionButtonsForPlayer(args) {
        this.game.bga.statusBar.setTitle(_('${you} may complete a fulfilled construction card'));
        document.getElementById('generalactions').innerHTML = '';
        if (this.game.usePivotRotation()) {
            this.game.bga.gameui.addActionButton(`decRotationPivot_button`, `⭯`, () => this.game.decRotationPivot());
            this.game.bga.gameui.addActionButton(`incRotationPivot_button`, `⭮`, () => this.game.incRotationPivot());
        }
        else {
            this.game.bga.gameui.addActionButton(`decRotation_button`, `⤹`, () => this.game.decRotation());
            this.game.bga.gameui.addActionButton(`incRotation_button`, `⤸`, () => this.game.incRotation());
        }
        this.game.bga.gameui.addActionButton(`placeTile_button`, _('Confirm'), () => this.game.placeTile(this.tileForAutomata));
        this.game.bga.gameui.addActionButton(`cancelPlaceTile_button`, _('Cancel'), () => this.game.cancelPlaceTile(), null, null, 'gray');
        [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id)?.classList.toggle('disabled', id !== `cancelPlaceTile_button` || !this.tileForAutomata));
        this.game.updateRotationButtonState();
        this.game.bga.gameui.addActionButton(`skip_button`, _('Skip'), () => this.game.bga.actions.performAction('actSkipCompleteCard'), null, null, 'gray');
        const cardsIds = this.selectedCard ? [this.selectedCard] : args.cardIds;
        const spaces = cardsIds.map(id => Number(this.game.gamedatas.cards.find(card => card.id === id).location.split('-')[1]));
        this.game.athenaConstructionSite.setSelectable(spaces, null);
    }
    removeUnselectableClass() {
        document.querySelectorAll('.unselectable').forEach(elem => elem.classList.remove('unselectable'));
    }
    removeForAutomataClass() {
        document.querySelectorAll('.for-automata').forEach(elem => elem.classList.remove('for-automata'));
        document.querySelectorAll('.given-to-automata').forEach(elem => elem?.remove());
    }
    singleTileClickedForAutomata(tile) {
        this.tileForAutomata = tile;
        this.selectedCard = this.game.gamedatas.cards.find(card => card.location === tile.location).id;
        this.removeUnselectableClass();
        document.getElementById(`market-tile-${tile.id}`).classList.add('for-automata');
        document.getElementById(`market-tile-${tile.id}`).insertAdjacentHTML('beforeend', `
            <div class="given-to-automata">${_('Given to automata')}</div>    
        `);
        this.onUpdateActionButtonsForPlayer(this.args);
    }
    onCancel() {
        const args = this.args;
        if (Object.keys(args.automaPicks).length) {
            this.selectedCard = null;
            this.tileForAutomata = null;
            this.removeForAutomataClass();
            this.onUpdateActionButtonsForAutomata(args);
        }
    }
}

/// <reference path="../bga-framework.d.ts" />
/// <reference path="./types.d.ts" />
const MIN_NOTIFICATION_MS = 1200;
const TYPES = {
    0: 'quarry',
    1: 'house',
    2: 'market',
    3: 'barrack',
    4: 'temple',
    5: 'garden',
};
const HEX_QUANTITIES = {
    2: [[5, 18], [4, 12], [4, 10], [4, 8], [3, 6]],
    3: [[6, 27], [5, 16], [5, 13], [5, 10], [4, 7]],
    4: [[7, 36], [6, 20], [6, 16], [6, 12], [5, 8]],
};
const PIVOT_ROTATIONS = [
    [+1, +1],
    [0, +2],
    [-1, +1],
    [-1, -1],
    [0, -2],
    [+1, -1],
];
const PIVOT_ROTATIONS_REVERSE = [
    [0, +2],
    [-1, +1],
    [-1, -1],
    [0, -2],
    [+1, -1],
    [+1, +1],
];
const AKROPOLIS_FOLDED_HELP = 'Akropolis-FoldedHelp';
const LOCAL_STORAGE_JUMP_KEY = 'Akropolis-jump-to-folded';
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
class Game {
    constructor(bga) {
        this.rotation = 0;
        this.playersTables = [];
        this.stonesCounters = [];
        this.hexesCounters = [];
        this.starsCounters = [];
        this.colorPointsCounters = [];
        this.pivotRotation = false;
        this.states = [];
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
        this.bga = bga;
        this.completeCardState = new CompleteCardState(this);
        this.states.push(this.completeCardState);
        /* @Override */
        this.bga.gameui.change3d = (incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset) => this.viewManager.change3d(incXAxis, xpos, ypos, xAxis, incScale, is3Dactive, reset);
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    setup(gamedatas) {
        console.log("Starting game setup");
        this.bga.gameArea.getElement().insertAdjacentHTML('beforeend', `
            <div id="full-table">
                <div id="market" class="left-to-right">
                    <div id="remaining-stacks"><div id="remaining-stacks-counter"></div></div>
                </div>
                <div id="tables"></div>
            </div>
        `);
        this.pivotRotation = window.location.href.indexOf('pivot') !== -1;
        this.gamedatas = gamedatas;
        // Setup camera controls reminder
        const reminderHtml = document.getElementsByTagName('body')[0].classList.contains('touch-device') ?
            `<div id="controls-reminder">
        ${_('You can drag this block')}
        </div>`
            : `<div id="controls-reminder">
        <img src="${g_gamethemeurl}img/mouse-right.svg"></img>
        ${_('Adjust camera with below controls or right-drag, middle-drag and scroll wheel')}
        </div>`;
        dojo.place(reminderHtml, 'controls3d_wrap', 'first');
        console.log('gamedatas', gamedatas);
        this.animationManager = new BgaAnimations.Manager({
            animationsActive: () => this.bga.gameui.bgaAnimationsActive(),
        });
        this.viewManager = new ViewManager(this);
        this.tilesManager = new TilesManager(this);
        this.constructionSite = new ConstructionSite(this, gamedatas.dock, gamedatas.deck / (Math.max(2, Object.keys(gamedatas.players).length) + 1));
        if (gamedatas.isAthena) {
            const players = Object.values(gamedatas.players);
            if (gamedatas.soloPlayer) {
                players.push(gamedatas.soloPlayer);
            }
            this.athenaConstructionSite = new AthenaConstructionSite(this, gamedatas.cards, gamedatas.cardStatuses, gamedatas.dock, players);
        }
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        const topEntries = [];
        if (gamedatas.isAthena) {
            topEntries.push(new BgaJumpTo.JumpToEntry(_("Athena"), 'athena-contruction-spaces', { 'color': '#1fa7d9' }));
        }
        topEntries.push(new BgaJumpTo.JumpToEntry(_("Construction Site"), 'market', { 'color': '#7e7978' }));
        const bottomEntries = [];
        if (gamedatas.soloPlayer) {
            bottomEntries.push(new BgaJumpTo.JumpToEntry(_(gamedatas.soloPlayer.name), 'player-table-0', { 'color': `#${gamedatas.soloPlayer.color}` }));
        }
        new BgaJumpTo.JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_KEY,
            topEntries,
            bottomEntries,
            entryClasses: 'hexa-point',
            defaultFolded: false,
        });
        document.getElementsByTagName('body')[0].addEventListener('keydown', e => this.onKeyPress(e));
        this.setupNotifications();
        this.bga.userPreferences.onChange = (prefId, prefValue) => this.onPreferenceChange(prefId, prefValue);
        this.addHelp(gamedatas.allTiles ? 4 : Math.max(2, Object.keys(gamedatas.players).length));
        window.addEventListener('resize', () => this.viewManager.fitCitiesToView());
        console.log("Ending game setup");
    }
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState(stateName, args) {
        console.log('Entering state: ' + stateName, args.args);
        if (this.gamedatas.gamestate.type !== 'multipleactiveplayer') {
            this.states.find(state => state.stateName === stateName)?.onEnteringState(args.args, this.bga.players.isCurrentPlayerActive());
        }
        switch (stateName) {
            case 'placeTile':
                this.onEnteringPlaceTile(args.args);
                break;
        }
    }
    onEnteringPlaceTile(args) {
        if (this.bga.players.isCurrentPlayerActive()) {
            this.selectedPosition = null;
            this.selectedTile = null;
            this.selectedTileHexIndex = null;
            this.setRotation(0);
            this.constructionSite.setSelectable(true);
            this.getCurrentPlayerTable().setPlaceTileOptions(args.options[0], this.rotation);
            this.constructionSite.setDisabledTiles(this.stonesCounters[this.bga.players.getCurrentPlayerId()].getValue());
        }
    }
    onLeavingState(stateName) {
        console.log('Leaving state: ' + stateName);
        this.states.find(state => state.stateName === stateName)?.onLeavingState(this.gamedatas.gamestate.args, this.bga.players.isCurrentPlayerActive());
        switch (stateName) {
            case 'placeTile':
                this.onLeavingPlaceTile();
                break;
        }
    }
    onLeavingPlaceTile() {
        this.getCurrentPlayerTable()?.setPlaceTileOptions([], this.rotation);
        this.constructionSite.setSelectable(false);
    }
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons(stateName, args) {
        const state = this.states.find(state => state.stateName === stateName);
        if (state) {
            const isCurrentPlayerActive = this.bga.players.isCurrentPlayerActive();
            if (this.gamedatas.gamestate.type === 'multipleactiveplayer') {
                state.onEnteringState(args, isCurrentPlayerActive);
            }
            state.onUpdateActionButtons(args, isCurrentPlayerActive);
        }
        else if (this.gamedatas.gamestate.type === 'multipleactiveplayer' && this.gamedatas.gamestate.private_state) {
            const leftState = this.states.find(state => state.stateName === this.gamedatas.gamestate.private_state?.name);
            if (leftState) {
                const isCurrentPlayerActive = this.bga.players.isCurrentPlayerActive();
                leftState.onLeavingState(this.gamedatas.gamestate.private_state.args, isCurrentPlayerActive);
            }
        }
        if (this.bga.players.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeTile':
                    if (this.usePivotRotation()) {
                        this.bga.gameui.addActionButton(`decRotationPivot_button`, `⭯`, () => this.decRotationPivot());
                        this.bga.gameui.addActionButton(`incRotationPivot_button`, `⭮`, () => this.incRotationPivot());
                    }
                    else {
                        this.bga.gameui.addActionButton(`decRotation_button`, `⤹`, () => this.decRotation());
                        this.bga.gameui.addActionButton(`incRotation_button`, `⤸`, () => this.incRotation());
                    }
                    this.bga.gameui.addActionButton(`placeTile_button`, _('Confirm'), () => this.placeTile());
                    this.bga.gameui.addActionButton(`cancelPlaceTile_button`, _('Cancel'), () => this.cancelPlaceTile(), null, null, 'gray');
                    [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.add('disabled'));
                    this.updateRotationButtonState();
                    break;
            }
        }
    }
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    setTooltip(id, html) {
        this.bga.gameui.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    setTooltipToClass(className, html) {
        this.bga.gameui.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }
    getCurrentPlayerId() {
        return this.bga.players.getCurrentPlayerId();
    }
    getPlayer(playerId) {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }
    getPlayerTable(playerId) {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }
    getCurrentPlayerTable() {
        return this.playersTables.find(playerTable => playerTable.playerId === this.bga.players.getCurrentPlayerId());
    }
    onPreferenceChange(prefId, prefValue) {
        switch (prefId) {
            case 201:
                document.getElementsByTagName('html')[0].classList.toggle('tile-level-colors', prefValue == 2);
                break;
            case 203:
                document.getElementById(`market`).classList.toggle('left-to-right', prefValue != 2);
                break;
            case 204:
                document.getElementsByTagName('html')[0].classList.toggle('animated-opacity', prefValue == 2);
                break;
            case 206:
                document.getElementsByTagName('html')[0].dataset.background = prefValue == 2 ? 'dark' : (prefValue == 1 ? 'light' : 'auto');
                break;
        }
    }
    usePivotRotation() {
        /*const playersIds = Object.keys(this.gamedatas.players).map(val => +val);
        return (playersIds.length == 1 && [
            2343492, // thoun studio
            86175279, // thoun BGA
            2322020, // tisaac studio
            83846198, // tisaac BGA
            84834479, // jules
        ].includes(playersIds[0]));*/
        return this.pivotRotation;
    }
    getOrderedPlayers(gamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.no - b.no);
        const playerIndex = players.findIndex(player => Number(player.id) === this.bga.players.getCurrentPlayerId());
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }
    createPlayerPanels(gamedatas) {
        const players = Object.values(gamedatas.players);
        const soloPlayer = gamedatas.soloPlayer;
        if (soloPlayer) {
            this.bga.playerPanels.addAutomataPlayerPanel(0, _(soloPlayer.name), {
                iconClass: 'solo-player-icon',
            });
        }
        (soloPlayer ? [...players, gamedatas.soloPlayer] : players).forEach(player => {
            const playerId = Number(player.id);
            // Stones counter
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `<div class="counters">
                <div id="stones-counter-wrapper-${player.id}" class="stones-counter">
                    <div id="stones-icon-${player.id}" class="stone score-icon"></div> 
                    <span id="stones-counter-${player.id}"></span>
                </div>
                <div id="first-player-token-wrapper-${player.id}" class="first-player-token-wrapper"></div>
            </div>
            <div class="scores-and-statue">
                <div id="scores-${player.id}"></div> 
                <div id="statue-${player.id}"></div>
            </div>`);
            if (gamedatas.firstPlayerId == playerId) {
                dojo.place(`<div id="first-player-token" class="first-player-token"></div>`, `first-player-token-wrapper-${player.id}`);
            }
            const stonesCounter = new ebg.counter();
            stonesCounter.create(`stones-counter-${playerId}`);
            stonesCounter.setValue(player.money);
            this.stonesCounters[playerId] = stonesCounter;
            const someVariants = gamedatas.activatedVariants.length > 0;
            const showScores = Boolean(player.board.scores);
            this.hexesCounters[playerId] = [];
            this.starsCounters[playerId] = [];
            this.colorPointsCounters[playerId] = [];
            for (let i = (playerId == 0 && player.lvl == 1 ? 0 : 1); i <= 5; i++) {
                let html = `<div class="counters ${!showScores && !someVariants ? 'hide-live-scores' : ''}" id="color-points-${i}-counter-border-${player.id}">
                    <div id="color-points-${i}-counter-wrapper-${player.id}" class="color-points-counter">
                        <span class="${!showScores ? 'hide-live-scores' : ''}">
                        <div class="score-icon star" data-type="${i}"></div> 
                        <span id="stars-${i}-counter-${player.id}"></span>
                        <span class="multiplier">×</span>
                        </span>
                        <div class="score-icon" data-type="${i}"></div> 
                        <span class="${!showScores ? 'hide-live-scores' : ''}">
                        <span id="hexes-${i}-counter-${player.id}"></span>
                        <span class="multiplier">=</span>
                        <span id="color-points-${i}-counter-${player.id}"></span>
                        </span>
                    </div>
                </div>`;
                dojo.place(html, `scores-${player.id}`);
                const starKey = showScores ? Object.keys(player.board.scores.stars).find(key => key.startsWith(TYPES[i])) : null;
                const starCounter = new ebg.counter();
                starCounter.create(`stars-${i}-counter-${playerId}`);
                starCounter.setValue(showScores ? player.board.scores.stars[starKey] : 0);
                this.starsCounters[playerId][i] = starCounter;
                const hexKey = showScores ? Object.keys(player.board.scores.districts).find(key => key.startsWith(TYPES[i])) : null;
                const hexCounter = new ebg.counter();
                hexCounter.create(`hexes-${i}-counter-${playerId}`);
                hexCounter.setValue(showScores ? player.board.scores.districts[hexKey] : 0);
                this.hexesCounters[playerId][i] = hexCounter;
                const colorPointsCounter = new ebg.counter();
                colorPointsCounter.create(`color-points-${i}-counter-${playerId}`);
                colorPointsCounter.setValue(starCounter.getValue() * hexCounter.getValue());
                this.colorPointsCounters[playerId][i] = colorPointsCounter;
                if (showScores) {
                    setTimeout(() => this.setPlayerScore(playerId, player.board.scores.score), 100);
                }
                const activated = gamedatas.activatedVariants.some(variant => variant.startsWith(TYPES[i]));
                if (someVariants) {
                    document.getElementById(`color-points-${i}-counter-border-${player.id}`).style.setProperty('--border-color', activated ? 'darkgreen' : 'darkred');
                }
                let tooltip = `${_('Score for this color (number of valid districts multiplied by matching stars)')}
                <br><br>
                <strong>${this.tilesManager.getTypeTitle(TYPES[i])}</strong><br>
                ${this.tilesManager.getScoreCondition(TYPES[i])}`;
                if (someVariants) {
                    tooltip += `<br><br>
                    <strong>${_('Variant')}</strong><br>
                    ${_('Activated:')} <strong style="color: ${activated ? 'darkgreen' : 'darkred'};">${activated ? _('Yes') : _('No')}</strong><br>
                    ${_(this.tilesManager.getVariantTooltip(TYPES[i]))}`;
                }
                this.setTooltip(`color-points-${i}-counter-border-${player.id}`, tooltip);
            }
            if (gamedatas.isAthena) {
                for (let space = 1; space <= 4; space++) {
                    const card = gamedatas.cards.find(card => card.location === `athena-${space}`);
                    const statuePartDone = (gamedatas.cardStatuses[playerId] ?? []).includes(card.id);
                    let html = `
                    <div id="statue-${player.id}-${space}">
                        ${statuePartDone ? `<div class="statue-part" data-part="${space}"></div>` : ''}
                    </div>`;
                    dojo.place(html, `statue-${player.id}`);
                }
            }
        });
        this.setTooltipToClass('stones-counter', _('Number of stones'));
        this.setTooltipToClass(`player_score_value`, _('The sum of the score for each color, plus 1 point for each stone'));
    }
    createPlayerTables(gamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(player => this.createPlayerTable(gamedatas, Number(player.id)));
        if (gamedatas.soloPlayer) {
            const table = new PlayerTable(this, gamedatas.soloPlayer, gamedatas.lastMoves[0]);
            this.playersTables.push(table);
        }
    }
    createPlayerTable(gamedatas, playerId) {
        const table = new PlayerTable(this, gamedatas.players[playerId], gamedatas.lastMoves[playerId]);
        this.playersTables.push(table);
    }
    addHelp(playerCount) {
        let labels = `<div class="quantities-table plazza">${HEX_QUANTITIES[playerCount].map(quantities => `<div><span>${quantities[0]}</span></div>`).join('')}</div>`;
        labels += `<div class="quantities-table district">${HEX_QUANTITIES[playerCount].map(quantities => `<div><span>${quantities[1]}</span></div>`).join('')}</div>`;
        labels += `<div class="label-table">${[1, 2, 3, 4, 5].map(i => `<div>${this.tilesManager.getScoreCondition(TYPES[i])}</div>`).join('')}</div>`;
        labels += `<div class="fake-close"><div class="fake-close-dash"></div></div>`;
        dojo.place(`
            <button id="quantities-help-button" data-folded="${localStorage.getItem(AKROPOLIS_FOLDED_HELP) ?? 'false'}">${labels}</button>
        `, 'left-side');
        const helpButton = document.getElementById('quantities-help-button');
        helpButton.addEventListener('click', () => {
            helpButton.dataset.folded = helpButton.dataset.folded == 'true' ? 'false' : 'true';
            localStorage.setItem(AKROPOLIS_FOLDED_HELP, helpButton.dataset.folded);
        });
        this.setTooltip('quantities-help-button', _('Plazzas / District quantities'));
    }
    onKeyPress(event) {
        if (['TEXTAREA', 'INPUT'].includes(event.target.nodeName) || !this.bga.players.isCurrentPlayerActive()) {
            return;
        }
        const pivot = this.usePivotRotation();
        const canRotate = pivot ? true : this.selectedTile?.hexes.length === 1 || !(this.selectedPosition && this.getSelectedPositionOption().r.length <= 1);
        const canConfirmCancel = this.selectedPosition;
        switch (event.key) { // event.keyCode
            case ' ': // 32
            case 'Space': // 32
            case 'Tab': // 9
            case 'Shift': // 16
            case 'Control': // 17
            case 'ArrowRight': // 39
            case 'ArrowDown': // 40
                if (canRotate) {
                    pivot ? this.incRotationPivot() : this.incRotation();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                break;
            case 'Alt': // 18            
            case 'ArrowUp': // 38
            case 'ArrowLeft': // 37
                if (canRotate) {
                    pivot ? this.decRotationPivot() : this.decRotation();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                break;
            case 'Enter': // 13
                if (canConfirmCancel) {
                    this.placeTile();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                break;
            case 'Escape': // 27
                if (canConfirmCancel) {
                    this.cancelPlaceTile();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                break;
        }
    }
    setPlayerScore(playerId, score) {
        const scoreCounter = this.bga.playerPanels.getScoreCounter(playerId);
        if (scoreCounter) {
            scoreCounter.toValue(score);
        }
        else {
            document.getElementById(`player_score_${playerId}`).innerHTML = '' + score;
        }
    }
    updateScores(playerId, scores) {
        Array.from(document.querySelectorAll('.hide-live-scores')).forEach(element => element.classList.remove('hide-live-scores'));
        for (let i = (playerId == 0 && this.gamedatas.soloPlayer.lvl == 1 ? 0 : 1); i <= 5; i++) {
            const type = TYPES[i];
            const starKey = Object.keys(scores.stars).find(key => key.startsWith(type));
            const hexKey = Object.keys(scores.districts).find(key => key.startsWith(type));
            this.starsCounters[playerId][i].toValue(scores.stars[starKey]);
            this.hexesCounters[playerId][i].toValue(scores.districts[hexKey]);
            this.colorPointsCounters[playerId][i].toValue(this.starsCounters[playerId][i].getValue() * this.hexesCounters[playerId][i].getValue());
        }
        ;
        this.setPlayerScore(playerId, scores.score);
    }
    constructionSiteHexClicked(tile, hexIndex, hex, rotation) {
        if (hex.classList.contains('selected')) {
            this.incRotation();
            return;
        }
        const pivot = this.usePivotRotation();
        if (pivot && tile == this.selectedTile) {
            return;
        }
        this.selectedTile = tile;
        this.selectedTileHexIndex = hexIndex;
        if (this.gamedatas.gamestate.name === 'completeCard') {
            this.athenaConstructionSite.setSelectedHex(tile.id, hex);
        }
        else {
            this.constructionSite.setSelectedHex(tile.id, hex);
        }
        this.setRotation(rotation);
        if (this.selectedPosition) {
            const option = this.getSelectedPositionOption();
            if (option.r && !option.r.includes(this.rotation)) {
                this.setRotation(this.findClosestRotation(option.r));
            }
            const tileCoordinates = TILE_COORDINATES[hexIndex];
            this.getCurrentPlayerTable().placeTile({
                ...this.selectedTile,
                x: this.selectedPosition.x - tileCoordinates[0],
                y: this.selectedPosition.y - tileCoordinates[1],
                z: this.selectedPosition.z,
                r: this.rotation,
            }, true, 'preview', this.selectedTileHexIndex);
        }
        this.updateRotationButtonState();
    }
    findClosestRotation(rotations) {
        let minDistance = 999;
        let minIndex = 0;
        rotations.forEach((r, index) => {
            const distance = Math.min(Math.abs(this.rotation - r), Math.abs(this.rotation + 6 - r));
            if (distance < minDistance) {
                minDistance = distance;
                minIndex = index;
            }
        });
        return rotations[minIndex];
    }
    getSelectedPositionOption() {
        if (this.gamedatas.gamestate.name === 'completeCard') {
            return this.gamedatas.gamestate.args.options.find(o => o.x == this.selectedPosition.x && o.y == this.selectedPosition.y && o.z == this.selectedPosition.z);
        }
        else {
            return this.gamedatas.gamestate.args.options[this.selectedTileHexIndex].find(o => o.x == this.selectedPosition.x && o.y == this.selectedPosition.y && o.z == this.selectedPosition.z);
        }
    }
    possiblePositionClicked(x, y, z) {
        if (!this.selectedTile) {
            return;
        }
        const pivot = this.usePivotRotation();
        if (pivot && this.selectedPosition != null) {
            console.log(x, y, z, this.rotation, this.selectedPosition);
            if (this.selectedPosition.x == x && this.selectedPosition.y == y && this.selectedPosition.z == z) {
                this.incRotationPivot();
                console.log('possiblePositionClicked pivot, return');
                return;
            }
        }
        this.selectedPosition = { x, y, z };
        const option = this.getSelectedPositionOption();
        if (option.r && !option.r.includes(this.rotation) && !pivot) {
            this.setRotation(this.findClosestRotation(option.r));
        }
        const tileCoordinates = TILE_COORDINATES[this.selectedTileHexIndex];
        this.getCurrentPlayerTable().placeTile({
            ...this.selectedTile,
            x: this.selectedPosition.x - tileCoordinates[0],
            y: this.selectedPosition.y - tileCoordinates[1],
            z: this.selectedPosition.z,
            r: this.rotation,
        }, true, 'preview', this.selectedTileHexIndex);
        [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.remove('disabled'));
        this.updateRotationButtonState();
    }
    decRotation() {
        if (this.selectedPosition && this.gamedatas.gamestate.name !== 'completeCard') {
            const option = this.getSelectedPositionOption();
            const index = option.r.findIndex(r => r == this.rotation);
            if (index !== -1 && option.r.length > 1) {
                this.setRotation(option.r[index == 0 ? option.r.length - 1 : index - 1]);
            }
        }
        else {
            this.setRotation(this.rotation == 0 ? 5 : this.rotation - 1);
        }
    }
    incRotation() {
        if (this.selectedPosition && this.gamedatas.gamestate.name !== 'completeCard') {
            const option = this.getSelectedPositionOption();
            const index = option.r.findIndex(r => r == this.rotation);
            if (index !== -1 && option.r.length > 1) {
                this.setRotation(option.r[index == option.r.length - 1 ? 0 : index + 1]);
            }
        }
        else {
            this.setRotation(this.rotation == 5 ? 0 : this.rotation + 1);
        }
    }
    setRotation(rotation) {
        while (rotation < 0) {
            rotation += 6;
        }
        rotation %= 6;
        this.rotation = rotation;
        if (this.selectedTile) {
            if (this.gamedatas.gamestate.name === 'completeCard') {
                this.athenaConstructionSite.setRotation(rotation, this.selectedTile);
            }
            else {
                this.constructionSite.setRotation(rotation, this.selectedTile);
            }
        }
        if (!this.selectedPosition) {
            if (this.gamedatas.gamestate.name === 'completeCard') {
                this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
            }
            else {
                this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options[0], this.rotation);
            }
        }
        this.getCurrentPlayerTable().rotatePreviewTile(this.rotation);
    }
    decRotationPivot() {
        this.changeRotationPivot(-1);
    }
    incRotationPivot() {
        this.changeRotationPivot(+1);
    }
    changeRotationPivot(direction) {
        let rotation = this.rotation;
        while (rotation < 0) {
            rotation += 6;
        }
        const pivotRotation = (direction == -1 ? PIVOT_ROTATIONS_REVERSE : PIVOT_ROTATIONS)[(rotation + (this.selectedTileHexIndex * 2)) % 6];
        this.possiblePositionClicked(this.selectedPosition.x + pivotRotation[0], this.selectedPosition.y + pivotRotation[1], this.selectedPosition.z);
        this.setRotation(rotation + direction * 2);
    }
    cancelPlaceTile() {
        [`placeTile_button`, `cancelPlaceTile_button`].forEach(id => document.getElementById(id).classList.add('disabled'));
        this.selectedPosition = null;
        this.getCurrentPlayerTable().removePreviewTile();
        if (this.gamedatas.gamestate.name === 'completeCard') {
            this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options, this.rotation);
            this.completeCardState.onCancel();
        }
        else {
            this.getCurrentPlayerTable().setPlaceTileOptions(this.gamedatas.gamestate.args.options[0], this.rotation);
        }
        this.updateRotationButtonState();
    }
    updateRotationButtonState() {
        const cannotRotate = this.selectedTile ? (this.selectedTile.hexes.length > 1 && this.selectedPosition && this.getSelectedPositionOption()?.r.length <= 1) : true;
        [`decRotation_button`, `incRotation_button`].forEach(id => document.getElementById(id)?.classList.toggle('disabled', cannotRotate));
    }
    placeTile(tileForAutomata) {
        if (this.gamedatas.gamestate.name === 'completeCard') {
            this.getCurrentPlayerTable()?.cleanPossibleHex();
            this.bga.actions.performAction('actCompleteCard', {
                tileIdForAutomata: tileForAutomata?.id,
                x: this.selectedPosition.x,
                y: this.selectedPosition.y,
                z: this.selectedPosition.z,
                r: this.rotation,
                tileId: this.selectedTile.id,
                cardId: this.gamedatas.cards.find(card => card.location === this.selectedTile.location).id,
            });
        }
        else {
            this.getCurrentPlayerTable()?.cleanPossibleHex();
            this.bga.actions.performAction('actPlaceTile', {
                x: this.selectedPosition.x,
                y: this.selectedPosition.y,
                z: this.selectedPosition.z,
                r: this.rotation,
                tileId: this.selectedTile.id,
                hex: this.selectedTileHexIndex,
            });
        }
    }
    singleTileClickedForAutomata(tile) {
        this.completeCardState.singleTileClickedForAutomata(tile);
    }
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );
        const notifs = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name.startsWith('notif_')).map(name => name.slice(6));
        notifs.forEach((notifName) => {
            dojo.subscribe(notifName, this, (notifDetails) => {
                console.log(`notif_${notifName}`, notifDetails.args);
                const promise = this[`notif_${notifName}`](notifDetails.args);
                const promises = promise ? [promise] : [];
                let minDuration = 1;
                let msg = this.bga.gameui.format_string_recursive(notifDetails.log, notifDetails.args);
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;
                    $('generalactions').innerHTML = '';
                    // If there is some text, we let the message some time, to be read 
                    minDuration = MIN_NOTIFICATION_MS;
                }
                // tell the UI notification ends, if the function returned a promise. 
                if (this.animationManager.animationsActive()) {
                    Promise.all([...promises, sleep(minDuration)]).then(() => this.bga.gameui.notifqueue.onSynchronousNotificationEnd());
                }
                else {
                    this.bga.gameui.notifqueue.setSynchronousDuration(0);
                }
            });
            this.bga.gameui.notifqueue.setSynchronous(notifName, undefined);
        });
    }
    async notif_placedTile(args) {
        const playerTable = this.getPlayerTable(args.tile.pId);
        const tile = args.tile;
        playerTable.removePreviewTile();
        const invisibleTile = playerTable.placeTile(tile, false, 'invisible');
        await this.constructionSite.animateTileTo(tile, invisibleTile).then(() => {
            playerTable.placeTile(tile, true, 'final');
            if (tile.hexes.length === 1) {
                this.athenaConstructionSite.removeTile(tile);
            }
            else {
                this.constructionSite.removeTile(tile);
            }
        });
    }
    async notif_completeCard(args) {
        const { player_id, card } = args;
        await this.athenaConstructionSite.completeCard(player_id, card.id);
    }
    notif_pay(args) {
        this.stonesCounters[args.player_id].incValue(-args.cost);
    }
    async notif_gainStones(args) {
        const playerId = args.player_id;
        const n = +args.n;
        this.stonesCounters[playerId].incValue(n);
        if (playerId == 0) {
            const origin = document.getElementById(`stones-icon-${this.gamedatas.playerorder[0]}`);
            const animated = document.createElement('div');
            animated.classList.add('stone', 'score-icon', 'animated');
            document.getElementById(`stones-icon-${playerId}`).appendChild(animated);
            await this.animationManager.slideIn(animated, origin);
            animated.remove();
        }
        else {
            const lastTile = document.getElementById(`player-table-${playerId}-grid`).getElementsByClassName('last-move')[0];
            if (lastTile) {
                const promises = [];
                for (let i = 0; i < n; i++) {
                    const origin = lastTile.getElementsByClassName('hex')[i];
                    const animated = document.createElement('div');
                    animated.classList.add('stone', 'score-icon', 'animated');
                    document.getElementById(`stones-icon-${playerId}`).appendChild(animated);
                    promises.push(this.animationManager.slideIn(animated, origin).then(() => animated.remove()));
                    await Promise.all(promises);
                }
            }
        }
    }
    async notif_refillDock(args) {
        await this.constructionSite.refill(args.dock, args.deck / (Math.max(2, Object.keys(this.gamedatas.players).length) + 1));
    }
    async notif_updateFirstPlayer(args) {
        const firstPlayerToken = document.getElementById('first-player-token');
        const destinationId = `first-player-token-wrapper-${args.pId}`;
        const originId = firstPlayerToken.parentElement.id;
        if (destinationId !== originId) {
            await this.animationManager.slideAndAttach(firstPlayerToken, document.getElementById(destinationId));
        }
    }
    notif_updateScores(args) {
        this.updateScores(args.player_id, args.scores);
    }
    async notif_automataDelay() {
        await sleep(2000);
    }
}

export { Game };
