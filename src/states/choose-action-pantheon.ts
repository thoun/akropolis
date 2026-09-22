import { Game } from "../Game";
import { AbstractActionPantheonState } from "./abstract-action-pantheon";

export class ChooseActionPantheonState extends AbstractActionPantheonState {
    constructor(game: Game, bga: Bga<AkropolisPlayer, AkropolisGamedatas>) {
        super(game, bga);
    }

    public onEnteringState(args: EnteringChooseActionPantheonArgs, isCurrentPlayerActive: boolean) {
        if (isCurrentPlayerActive) {
            this.createActionButtons(args.commonArgs);
            this.bga.statusBar.addActionButton(_('Pass'), () => this.bga.actions.performAction('actPass'), { color: 'alert' });
        }
    }

    public onLeavingState(args: EnteringChooseActionPantheonArgs, isCurrentPlayerActive: boolean) {
    }
}
