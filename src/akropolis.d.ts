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
}

interface AkropolisGame extends Game {
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
}

interface NotifNewFirstPlayerArgs { // TODO Tisaac check if it matches back
    playerId: number;
}