import { Game } from './Game';

// Artwork order in the 5-column, 4-row sprite.
const CHALLENGE_IDS = [
    'Bastion', 'LookoutTower', 'Uprising', 'Garrison', 'GodsPromenade',
    'SacredGrove', 'Orchard', 'PatricianVilla', 'ResidentialArea', 'Suburb',
    'PopulationExpansion', 'Neighborhood', 'ReligiousFervor', 'GrandTemple', 'Ritual',
    'Oracle', 'BustlingTrade', 'MarketStall', 'RareCommodities', 'ForeignTrade',
];

const DISTRICT_ICONS = {
    HOUSE: 1,
    MARKET: 2,
    BARRACK: 3,
    TEMPLE: 4,
    GARDEN: 5,
};

const COLORS = ['#d11e25', '#3cb941', '#55b5e9', '#782f9a', '#d5a000'];

export class PantheonChallenges {
    private element: HTMLDivElement;
    private challenges: PantheonChallenge[];

    constructor(private game: Game, board: AkropolisGamedatas['challenges']['board']) {
        this.element = document.createElement('div');
        this.element.id = 'pantheon-challenges';
        this.element.setAttribute('aria-label', _('Architectural challenges'));
        const anchor = document.getElementById('hand') ?? document.getElementById('tables');
        anchor.before(this.element);
        this.challenges = Object.values(board);
        this.render();
    }

    public update(args: NotifPantheonChallengeArgs) {
        const index = this.challenges.findIndex(challenge => challenge.id === args.challengeId);
        if (index !== -1) {
            this.challenges.splice(index, 1, ...(args.newChallenge ? [args.newChallenge] : []));
        } else if (args.newChallenge && !this.challenges.some(challenge => challenge.id === args.newChallenge.id)) {
            this.challenges.push(args.newChallenge);
        }
        this.game.gamedatas.challenges.board = this.challenges;
        this.render();
    }

    private render() {
        const districtNames = {
            HOUSE: _('House district'),
            MARKET: _('Market district'),
            BARRACK: _('Barrack district'),
            TEMPLE: _('Temple district'),
            GARDEN: _('Garden district'),
        };
        this.element.replaceChildren();
        this.challenges.forEach(challenge => {
            const index = CHALLENGE_IDS.indexOf(challenge.id);
            if (index === -1) {
                return;
            }
            const card = document.createElement('div');
            card.id = `pantheon-challenge-${challenge.id}`;
            card.className = 'pantheon-challenge';
            card.dataset.challengeId = challenge.id;
            card.style.backgroundPosition = `${(index % 5) * 25}% ${Math.floor(index / 5) * 100 / 3}%`;
            const colorIndex = index < 4 ? 0 : index < 7 ? 1 : index < 12 ? 2 : index < 16 ? 3 : 4;
            card.style.setProperty('--challenge-color', COLORS[colorIndex]);

            const name = document.createElement('div');
            name.className = 'challenge-name';
            name.textContent = _(challenge.name);
            card.append(name);

            const description = document.createElement('div');
            description.className = 'challenge-description';
            const descriptionText = document.createElement('div');
            // Translate the full sentence first, then replace its district placeholders.
            _(challenge.description).split(/(<(?:HOUSE|MARKET|BARRACK|TEMPLE|GARDEN)>)/g).forEach(part => {
                const type = DISTRICT_ICONS[part.slice(1, -1)];
                if (type && part.startsWith('<')) {
                    const icon = document.createElement('span');
                    icon.className = 'score-icon';
                    icon.dataset.type = String(type);
                    icon.setAttribute('role', 'img');
                    icon.setAttribute('aria-label', districtNames[part.slice(1, -1)]);
                    descriptionText.append(icon);
                } else {
                    descriptionText.append(document.createTextNode(part));
                }
            });
            description.append(descriptionText);
            card.append(description);
            this.element.append(card);
        });
    }
}
