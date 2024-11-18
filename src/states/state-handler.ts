abstract class StateHandler<Args> {
    public abstract get stateName(): string;

    constructor(protected game: AkropolisGame) {
    }

    public onEnteringState(args: Args, isCurrentPlayerActive: boolean) {}
    public onLeavingState(args: Args, isCurrentPlayerActive: boolean) {}
    public onUpdateActionButtons(args: Args, isCurrentPlayerActive: boolean) {}

    public get args(): Args {
        return (this.game as any).gamedatas.gamestate.private_state?.args ?? (this.game as any).gamedatas.gamestate.args;
    }

    
    protected setGamestateDescription(sentence: string) {
        const activePlayersIds = (this.game as any).getActivePlayers();
        const actPlayer = activePlayersIds.length === 1 ? this.game.getPlayer(activePlayersIds[0]) : null;
        const currentPlayer = this.game.getPlayer(this.game.getPlayerId());
        const args = {
            actplayer: actPlayer ? '<span style="font-weight:bold;color:#'+actPlayer.color+';">'+actPlayer.name+'</span>' : undefined,
            you: '<span style="font-weight:bold;color:#'+currentPlayer.color+';">'+__('lang_mainsite','You')+'</span>',
            ...this.args,
        };
        
        document.getElementById('pagemaintitletext')!.innerHTML = (this.game as any).format_string_recursive(_(sentence), args);
    }
}