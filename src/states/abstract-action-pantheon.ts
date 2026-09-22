import { Game } from "../Game";

export class AbstractActionPantheonState {
    constructor(protected game: Game, protected bga: Bga<AkropolisPlayer, AkropolisGamedatas>) {
    }

    public createActionButtons(commonArgs: PantheonCommonArgs) {
        if (!commonArgs) {
            return;
        }

        // TODO
        const challengeId = 'TODO';
        const x = 0;
        const y = 0;
        const z = 0;

        this.bga.statusBar.addActionButton(
            _('Complete challenge'), 
            () => this.bga.actions.performAction('actCompleteChallenge', { challengeId, x, y, z }),  
            { color: 'secondary', disabled: !commonArgs.completableChallenges.length }
        );
        this.bga.statusBar.addActionButton(
            _('Discard challenge'), 
            () => this.bga.actions.performAction('actDiscardChallenge', { challengeId }), 
            { color: 'secondary', disabled: !commonArgs.canDiscardChallenge }
        );
        this.bga.statusBar.addActionButton(
            _('Unlock challenge slot'), 
            () => this.bga.actions.performAction('actUnlockChallengeSlot'), 
            { color: 'secondary', disabled: !commonArgs.canUnlockSlot }
        );
        if (commonArgs.canAskForMoney) {
            for (let amount = 1; amount <= commonArgs.maxMoneyRequestable; amount ++) {
                this.bga.statusBar.addActionButton(
                    _('Ask for ${amount} stone(s)').replace('${amount}', `${amount}`), 
                    () => this.bga.actions.performAction('actAskForMoney', { amount }), 
                    { color: 'secondary' }
                );
            }
        }
    }
}
