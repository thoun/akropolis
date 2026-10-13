import { Game } from '../Game';

interface CompleteChallengeArgs {
    challengeId: string;
    positions: HexPosition[];
}

export class CompleteChallengeState {
    private submitting = false;

    constructor(private game: Game, private bga: Bga<AkropolisPlayer, AkropolisGamedatas>) {}

    public onEnteringState(args: CompleteChallengeArgs, isCurrentPlayerActive: boolean) {
        this.submitting = false;
        this.game.tableCenter.setSelectable(false);
        [this.game.getCurrentPlayerTable(), this.game.getPlayerTable(-1)].forEach(table => {
            table?.cleanPossibleHex();
            table?.removePreviewTile();
        });
        this.game.selectedPosition = null;
        this.game.selectedTile = null;
        this.game.selectedTileHexIndex = null;
        this.game.selectedZone = null;
        if (isCurrentPlayerActive) {
            this.bga.statusBar.addActionButton(_('Cancel'), () => {
                if (!this.submitting) {
                    this.bga.states.restoreServerGameState();
                }
            }, { color: 'secondary', id: 'cancelCompleteChallenge_button' });
            this.game.getPlayerTable(-1).setChallengeHexOptions(args.positions, position => this.submit(args.challengeId, position));
        }
    }

    public onLeavingState() {
        this.game.getPlayerTable(-1)?.cleanPossibleHex();
    }

    private async submit(challengeId: string, position: HexPosition) {
        if (this.submitting || this.game.gamedatas.gamestate.name !== 'clientCompleteChallenge' || !this.bga.players.isCurrentPlayerActive()) {
            return;
        }
        this.submitting = true;
        try {
            await this.bga.actions.performAction('actCompleteChallenge', { challengeId, ...position });
        } catch {
            // performAction displays the server error; keep the selectors available for retry.
        } finally {
            this.submitting = false;
        }
    }
}
