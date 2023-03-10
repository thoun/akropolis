/**
 * Your game interfaces
 */

interface AkropolisPlayer extends Player {
    playerNo: number;
    // TODO
}

interface AkropolisGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: AkropolisPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    // TODO
}

interface AkropolisGame extends Game {
    getPlayerId(): number;

    setTooltip(id: string, html: string): void;  
}
/* Examples 
interface EnteringChooseOperationArgs {
    operations: { [operation: number]: Operation; };
}

interface NotifSetPlayedOperationArgs {
    playerId: number;
    type: number;
    operationsNumber: number;
    firstPlayer: boolean;
}
*/