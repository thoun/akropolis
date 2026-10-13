import { Game } from "../Game";

export class AbstractActionPantheonState {
    constructor(protected game: Game, protected bga: Bga<AkropolisPlayer, AkropolisGamedatas>) {
    }

    public onEnteringState(args: { commonArgs: PantheonCommonArgs }, isCurrentPlayerActive: boolean) {
        this.game.pantheonChallenges?.setDiscardEnabled(isCurrentPlayerActive && !!args.commonArgs?.canDiscardChallenge);
        this.game.pantheonChallenges?.setCompleteEnabled(isCurrentPlayerActive ? args.commonArgs : undefined);
        this.game.pantheonChallenges?.setUnlockEnabled(isCurrentPlayerActive && !!args.commonArgs?.canUnlockSlot);
    }

    public onLeavingState(args: { commonArgs: PantheonCommonArgs }, isCurrentPlayerActive: boolean) {
        this.game.pantheonChallenges?.setDiscardEnabled(false);
        this.game.pantheonChallenges?.setCompleteEnabled();
        this.game.pantheonChallenges?.setUnlockEnabled(false);
    }

    public createActionButtons(commonArgs: PantheonCommonArgs) {
        if (!commonArgs) {
            return;
        }

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
