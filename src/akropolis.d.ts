/**
 * Your game interfaces
 */

interface Tile {
    hexes: string[];
    id: number;
    location: string;
    pId: number;
    x: number;
    y: number;
    z: number;
    r: number;
    state: number;
}

interface Scores {
    districts: { [type: string]: number };
    stars: { [type: string]: number };
    score: number;
}

interface PlayerBoard {
    tiles: Tile[];
    scores: Scores;
}

interface AkropolisPlayer extends Player {
    no: number;
    money: number;
    board: PlayerBoard;
    lvl?: number; // solo level
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
    dock: Tile[];
    firstPlayerId: number;
    deck: number; // remaining tiles
    activatedVariants: string[];
    soloPlayer?: AkropolisPlayer;
}

interface AkropolisGame extends Game {
    viewManager: ViewManager;
    animationManager: AnimationManager;
    tilesManager: TilesManager;

    getPlayerId(): number;

    setTooltip(id: string, html: string): void;  
    constructionSiteHexClicked(tile: Tile, hexIndex: number, hex: HTMLDivElement): void;
    possiblePositionClicked(x: number, y: number, z: number): void;
    incRotation(): void;
}

interface PlaceTileOption {
    x: number;
    y: number;
    z: number;
    r: number[];
}

interface EnteringPlaceTileArgs {
    options: PlaceTileOption[][];
}

interface NotifPlacedTileArgs {
    player_id: number;
    tile: Tile;
}

interface NotifPayArgs {
    player_id: number;
    cost: number;
}

interface NotifGainStonesArgs {
    player_id: number;
    n: number;
}

interface NotifUpdateFirstPlayerArgs {
    pId: number;
}

interface NotifDockRefillArgs {
    dock: Tile[];
    deck: number;
}

interface NotifUpdateScoresArgs {
    player_id: number;
    scores: Scores;
}
