import { Game } from "../Game";
import { AbstractActionPantheonState } from "./abstract-action-pantheon";

export class PlaceTilePantheonState extends AbstractActionPantheonState {
    constructor(game: Game, bga: Bga<AkropolisPlayer, AkropolisGamedatas>) {
        super(game, bga);
    }

    public onEnteringState(args: EnteringPlaceTilePantheonArgs, isCurrentPlayerActive: boolean) {
        if (isCurrentPlayerActive) {
            this.game.selectedPosition = null;
            this.game.selectedTile = null;
            this.game.selectedTileHexIndex = null;
            this.game.selectedZone = null;
            this.game.setRotation(0);
            this.game.tableCenter.setSelectable(true);
            const playerOptions = args.cityOptions[0];
            this.game.getCurrentPlayerTable().setPlaceTileOptions(playerOptions, this.game.rotation);
            if (args.canSendToCapital) {
                const capitalOptions = args.capitalOptions[0];
                this.game.getPlayerTable(-1).setPlaceTileOptions(capitalOptions, this.game.rotation);
            }
            this.game.onUpdateActionButtonsPlaceTile();
            this.createActionButtons(args.commonArgs);
        }
    }

    public onLeavingState(args: EnteringPlaceTilePantheonArgs, isCurrentPlayerActive: boolean) {
        this.game.onLeavingPlaceTile();
    }
}
