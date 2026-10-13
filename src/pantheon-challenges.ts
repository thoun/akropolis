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
const ANYTIME_CHALLENGES = new Set(['Uprising', 'Suburb', 'ReligiousFervor', 'BustlingTrade']);

export class PantheonChallenges {
    private element: HTMLDivElement;
    private challenges: PantheonChallenge[];
    private discardEnabled = false;
    private unlockEnabled = false;
    private completableChallenges: PantheonCommonArgs['completableChallenges'] = {};
    private availableAltarPositions: PantheonCommonArgs['availableAltarPositions'] = {};

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

    public setDiscardEnabled(enabled: boolean) {
        this.discardEnabled = enabled;
        this.element.querySelectorAll<HTMLButtonElement>('.discard-challenge-button').forEach(button => {
            button.disabled = !enabled;
            button.classList.toggle('disabled', !enabled);
        });
    }

    public setCompleteEnabled(commonArgs?: PantheonCommonArgs) {
        this.completableChallenges = commonArgs?.completableChallenges ?? {};
        this.availableAltarPositions = commonArgs?.availableAltarPositions ?? {};
        this.updateCompleteButtons();
    }

    public setUnlockEnabled(enabled: boolean) {
        this.unlockEnabled = enabled;
        const button = this.element.querySelector<HTMLButtonElement>('.unlock-challenge-button');
        if (button) {
            button.disabled = !enabled;
            button.classList.toggle('disabled', !enabled);
        }
    }

    private updateCompleteButtons() {
        this.element.querySelectorAll<HTMLButtonElement>('.complete-challenge-button').forEach(button => {
            const challenge = this.challenges.find(challenge => challenge.id === button.dataset.challengeId);
            const enabled = !!this.completableChallenges[challenge.id]
                && !!this.availableAltarPositions[challenge.color]?.length;
            button.disabled = !enabled;
            button.classList.toggle('disabled', !enabled);
        });
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
            const nameText = document.createElement('span');
            nameText.className = 'challenge-name-text';
            nameText.textContent = _(challenge.name);
            const typeIcon = document.createElement('span');
            typeIcon.className = 'challenge-type';
            typeIcon.dataset.type = ANYTIME_CHALLENGES.has(challenge.id) ? 'anytime' : 'immediate';
            typeIcon.setAttribute('role', 'img');
            typeIcon.title = typeIcon.dataset.type === 'immediate'
                ? _('You must place the tile stated to complete this Architectural Challenge')
                : _('You can complete this Architectural Challenge if you have this layout in your city');
            typeIcon.setAttribute('aria-label', typeIcon.title);
            name.append(nameText, typeIcon);
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

            const completeButton = document.createElement('button');
            completeButton.type = 'button';
            completeButton.className = 'bgabutton bgabutton_gray complete-challenge-button';
            completeButton.dataset.challengeId = challenge.id;
            completeButton.textContent = _('Complete challenge');
            completeButton.addEventListener('click', () => {
                const positions = this.availableAltarPositions[challenge.color] ?? [];
                if (!this.completableChallenges[challenge.id] || !positions.length || !this.game.bga.players.isCurrentPlayerActive()) {
                    return;
                }
                this.game.bga.states.setClientState('clientCompleteChallenge', {
                    descriptionmyturn: _('${you} must select a hex in the Capital to place the Divine Altar'),
                    args: { challengeId: challenge.id, positions },
                });
            });

            const discardButton = document.createElement('button');
            discardButton.type = 'button';
            discardButton.className = 'bgabutton bgabutton_gray discard-challenge-button';
            discardButton.innerHTML = _('Discard challenge') + ' (1 <div class="stone score-icon"></div>)';
            discardButton.addEventListener('click', async () => {
                if (await this.game.bga.dialogs.confirmation(_('Are you sure you want to discard this challenge?'))) {
                    const challengeId = challenge.id;
                    this.game.bga.actions.performAction('actDiscardChallenge', { challengeId });
                }
            });

            const container = document.createElement('div');
            container.className = 'pantheon-challenge-container';
            container.append(card, completeButton, discardButton);
            this.element.append(container);
        });

        const unlockButton = document.createElement('button');
        unlockButton.type = 'button';
        unlockButton.className = 'bgabutton bgabutton_gray unlock-challenge-button';
        unlockButton.innerHTML = _('Unlock challenge slot') + ' (5 <div class="stone score-icon"></div>)';
        unlockButton.addEventListener('click', () => this.game.bga.actions.performAction('actUnlockChallengeSlot'));
        const unlockContainer = document.createElement('div');
        unlockContainer.className = 'pantheon-challenge-container unlock-challenge-container';
        unlockContainer.append(unlockButton);
        this.element.append(unlockContainer);

        this.setDiscardEnabled(this.discardEnabled);
        this.setUnlockEnabled(this.unlockEnabled);
        this.updateCompleteButtons();
    }
}
