import { Game } from "../Game";

export abstract class StateHandler<Args> {
    public abstract get stateName(): string;

    constructor(protected game: Game) {
    }

    public onEnteringState(args: Args, isCurrentPlayerActive: boolean) {}
    public onLeavingState(args: Args, isCurrentPlayerActive: boolean) {}
    public onUpdateActionButtons(args: Args, isCurrentPlayerActive: boolean) {}

    public get args(): Args {
        return this.game.gamedatas.gamestate.private_state?.args ?? this.game.gamedatas.gamestate.args;
    }
}
