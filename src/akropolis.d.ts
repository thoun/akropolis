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
}

interface PlayerGrid {
    [x: number]: {
        [y: number]: {
            [z: number]: string;
        }
    }
}

interface AkropolisPlayer extends Player {
    no: number;
    money: number;
    board: {
        grid: PlayerGrid;
    };
    tiles: Tile[]; // TODO Tisaac check if it matches back. No need to send initial tile, as it's already contained in grid. It's just to mark tiles shapes
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
    firstPlayerId: number; // TODO Tisaac check if it matches back
    remainingStacks: number; // TODO Tisaac check if it matches back
    activatedVariants: string[]; // TODO Tisaac send activated variants (house, market, ...)
    soloLevel?: number; // TODO Tisaac send solo level (1 to 3 if solo activated ?)
}

interface AkropolisGame extends Game {
    viewManager: ViewManager;
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
    options: PlaceTileOption[];
}

interface NotifPlacedTileArgs { // TODO Tisaac check if it matches back
    tile: Tile;
    cost: number; // TODO Tisaac check if we let it here or if we move it to a dedicated notif
}

interface NotifNewFirstPlayerArgs { // TODO Tisaac check if it matches back
    playerId: number;
}

interface NotifDockRefillArgs { // TODO Tisaac check if it matches back
    dock: Tile[];
    remainingStacks: number;
}