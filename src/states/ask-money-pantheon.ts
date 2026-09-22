import { Game } from "../Game";

export class AskMoneyPantheonState {
    constructor(private game: Game, private bga: Bga<AkropolisPlayer, AkropolisGamedatas>) {
    }

    public onEnteringState(args: EnteringAskMoneyPantheonArgs, isCurrentPlayerActive: boolean) {
        if (isCurrentPlayerActive) {
            for (let amount = args.remainingAmount; amount >= 1; amount--) {
                this.bga.statusBar.addActionButton(
                    _('Give ${amount} stone(s) (cost : ${cost} stones)').replace('${amount}', `${amount}`).replace('${cost}', `${amount * 2}`), 
                    () => this.bga.actions.performAction('actSendMoney', { amount }),
                );
            }
            this.bga.statusBar.addActionButton(
                _('Skip'), 
                () => this.bga.actions.performAction('actSkipSendMoney'),
                { color: 'alert' }
            );
        }
    }
}
