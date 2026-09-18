<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Managers;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Core\Stats;
use Bga\Games\Akropolis\Helpers\Collection;
use Bga\Games\Akropolis\Managers\Players;

/* Class to manage all the tiles for Akropolis */

class Tiles extends \Bga\Games\Akropolis\Helpers\Pieces
{
  protected static string $table = 'tiles';
  protected static string $prefix = 'tile_';
  protected static array $customFields = ['player_id', 'x', 'y', 'z', 'r'];
  protected static bool $autoIncrement = false;
  protected static bool $autoremovePrefix = true;

  /**
   * Cast database row to tile format
   * @param array<mixed> $tile Database row
   * @return array{id: int, location: string, state: int, pId: int, x: int, y: int, z: int, r: int, hexes: array<int, array<int, string>>} Tile data
   */
  protected static function cast(array $tile): array
  {
    return [
      'id' => (int) $tile['id'],
      'location' => $tile['location'],
      'state' => (int) $tile['state'],
      'pId' => (int) $tile['player_id'],
      'x' => (int) $tile['x'],
      'y' => (int) $tile['y'],
      'z' => (int) $tile['z'],
      'r' => (int) $tile['r'],
      'hexes' => self::$tiles[$tile['id']],
    ];
  }

  /**
   * Get UI data for tiles in dock and Athena locations
   * @return array<array> Array of tile data
   */
  public static function getUiData(): array
  {
    return self::getInLocation('dock')
      ->merge(self::getInLocation('athena-%'))
      ->toArray();
  }

  /**
   * Setup new game with tiles
   * @param array<int, mixed> $players Array of player info
   * @param array<string, mixed> $options Game options
   */
  public static function setupNewGame(array $players, array $options): void
  {
    $nPlayers = max(2, count($players));

    $tiles = [];
    $singleTiles = [];
    foreach (self::$tiles as $id => $tile) {
      // Athena single tiles
      if (count($tile) == 1) {
        $singleTiles[] = $id;
        continue;
      }
      // Check number of players of tile
      if ((self::$tilesPlayers[$id] ?? 2) > $nPlayers && !Globals::isAllTiles()) {
        continue;
      }

      // Pantheon starting tiles
      if (in_array($id, PANTHEON_STARTING_TILES)) {
        continue;
      }

      $tiles[] = [
        'id' => $id,
        'player_id' => null,
        'x' => 0,
        'y' => 0,
        'z' => 0,
        'r' => 0,
      ];
    }

    // Create the tiles
    self::create($tiles, 'deck');
    self::shuffle('deck');

    // Athena
    if (Globals::isAthena()) {
      $tiles = [];
      shuffle($singleTiles);
      for ($slot = 1; $slot <= 4; $slot++) {
        for ($i = 0; $i < 4; $i++) {
          $tiles[] = [
            'id' => array_shift($singleTiles),
            'location' => "athena-$slot",
            'player_id' => null,
            'x' => 0,
            'y' => 0,
            'z' => 0,
            'r' => 0,
          ];
        }
      }
      self::create($tiles);
    }

    // Pantheon
    if (Globals::isPantheon()) {
      $tiles = [];

      // ONe starting tile per player
      $startingTiles = PANTHEON_STARTING_TILES;
      shuffle($startingTiles);
      $playerIds = Players::getAll()->getIds();
      for ($i = 0; $i < count($playerIds); $i++) {
        $tileId = $startingTiles[$i];
        $tiles[] =  [
          'id' => $tileId,
          'location' => "board",
          'player_id' => $playerIds[$i],
          'x' => 0,
          'y' => 0,
          'z' => 0,
          'r' => 0,
        ];
      }

      // The rest in the capital
      for (; $i < 5; $i++) {
        // TODO : place them in pending state instead
        $tileId = $startingTiles[$i];
        $tiles[] =  [
          'id' => $tileId,
          'location' => "board",
          'player_id' => CAPITAL_ID,
          'x' => 0,
          'y' => $i * 2,
          'z' => 0,
          'r' => 0,
        ];
      }

      self::create($tiles);

      // Draw three random tiles per player
      for ($i = 0; $i < count($playerIds); $i++) {
        self::drawToHand($playerIds[$i], 3);
      }
    }
    // Standard games has docks
    else {
      self::refillDock();
    }
  }

  public static function refillDock(): array
  {
    $nPlayers = max(2, Players::count());
    for ($i = self::countInLocation('dock'); $i < $nPlayers + 2; $i++) {
      self::pickForLocation(1, 'deck', 'dock', $i);
    }

    return self::getInLocation('dock')->toArray();
  }

  public static function shiftDock(int $i): void
  {
    for (; $i < 6; $i++) {
      foreach (self::getInLocation('dock', $i + 1) as $tile) {
        self::setState($tile['id'], $i);
      }
    }
  }

  public static function getOfPlayer(int $pId): Collection
  {
    return self::getSelectQuery()
      ->wherePlayer($pId)
      ->get();
  }

  ////////////////////////////
  // Hand management methods
  public static function getPlayerHand(int $pId): Collection
  {
    return self::getInLocation('hand')
      ->filter(fn($tile) => $tile['pId'] == $pId);
  }

  /**
   * Add a tile to a player's hand
   * @param int $pId Player ID
   * @param int $tileId Tile ID
   */
  public static function addToHand(int $pId, int $tileId): void
  {
    Tiles::DB()->update([
      'tile_location' => "hand",
      'player_id' => $pId,
    ], $tileId);
  }

  /**
   * Draw tiles from deck to player's hand
   * @param int $pId Player ID
   * @param int $n Number of tiles to draw (default: 1)
   * @return Collection<int, array> Collection of drawn tiles
   */
  public static function drawToHand(int $pId, int $n = 1): Collection
  {
    $tiles = self::getTopOf('deck', $n);
    $ids = [];
    foreach ($tiles as $tile) {
      self::addToHand(
        $pId,
        $tile['id']
      );
      $ids[] = $tile['id'];
    }

    return self::getMany($ids);
  }
  /////////////////////////

  /**
   * Add a tile to the board
   * @param int $tileId Tile ID
   * @param int $pId Player ID
   * @param array{x: int, y: int, z: int} $pos Position coordinates
   * @param int $rotation Rotation value
   * @return array Tile data after placement
   */
  public static function add(int $tileId, int $pId, array $pos, int $rotation): array
  {
    self::DB()->update(
      [
        'tile_location' => 'board',
        'player_id' => $pId,
        'x' => $pos['x'],
        'y' => $pos['y'],
        'z' => $pos['z'],
        'r' => $rotation,
      ],
      $tileId
    );
    return self::getSingle($tileId);
  }

  /**
   * Auxiliary function to place a tile - can be reused
   * @param object $player Player placing the tile
   * @param int $tileId Tile ID
   * @param int $hex Hex index
   * @param array{x: int, y: int, z: int} $pos Position coordinates
   * @param int $r Rotation
   * @param bool $shiftDock Whether to shift the dock
   */
  public static function placeTile(object $player, int $tileId, int $hex, array $pos, int $r, bool $shiftDock = true): void
  {
    $tile = Tiles::getSingle($tileId);
    $cost = $tile['state'];

    // Check position : always go back to top left hex on tile
    $geometry = $player->board()->getTileGeometry($tile);
    $pos = $player->board()->getCorrespondingPos($geometry, $pos, $r, $hex);

    // Pay money if needed
    if ($cost > 0) {
      $player->incMoney(-$cost);
      if ($player->getId() != \ARCHITECT_ID) {
        Stats::incMoneyUsed($player, $cost);
      }

      Notifications::payForTile($player, $cost);

      if (Globals::isSolo() && $player->getId() != \ARCHITECT_ID) {
        $architect = Players::getArchitect();
        $architect->incMoney($cost);
        Notifications::gainStones($architect, $cost, true);
      }
    }

    // Place tile
    $money = $player->board()->addTile($tileId, $pos, $r);
    $tile = Tiles::getSingle($tileId);
    Notifications::placeTile($player, $tile);

    // Register move as player's last move
    $lastMoves = Globals::getLastMoves();
    $lastMoves[$player->getId()] = $tile;
    Globals::setLastMoves($lastMoves);

    // Gain money if recovering quarries
    if ($money > 0) {
      $player->incMoney($money);
      Notifications::gainStones($player, $money);
    }

    // Shift remaining tiles
    if ($shiftDock) {
      Tiles::shiftDock($cost);
    }

    // Update score if live scoring
    if (Globals::isLiveScoring()) {
      $scores = $player->board()->getScores();
      Notifications::updateScores($player, $scores);
    }
  }


  /** @var array<int, array<int, array<int, string>>> Tile definitions by ID */
  public static array $tiles = [
    #1
    [QUARRY, QUARRY, HOUSE_PLAZA],
    [QUARRY, QUARRY, HOUSE_PLAZA],
    [QUARRY, QUARRY, MARKET_PLAZA],
    [QUARRY, QUARRY, MARKET_PLAZA],
    [GARDEN, QUARRY, HOUSE_PLAZA],
    #6
    [BARRACK, QUARRY, MARKET_PLAZA],
    [QUARRY, QUARRY, HOUSE_PLAZA],
    [HOUSE, QUARRY, TEMPLE_PLAZA],
    [QUARRY, QUARRY, TEMPLE_PLAZA],
    [QUARRY, QUARRY, TEMPLE_PLAZA],
    #11
    [QUARRY, QUARRY, BARRACK_PLAZA],
    [QUARRY, QUARRY, BARRACK_PLAZA],
    [QUARRY, QUARRY, GARDEN_PLAZA],
    [HOUSE, QUARRY, BARRACK_PLAZA],
    [TEMPLE, MARKET, HOUSE_PLAZA],
    #16
    [BARRACK, TEMPLE, HOUSE],
    [QUARRY, MARKET, HOUSE_PLAZA],
    [QUARRY, TEMPLE, MARKET_PLAZA],
    [QUARRY, HOUSE, BARRACK_PLAZA],
    [HOUSE, TEMPLE, BARRACK_PLAZA],
    #21
    [TEMPLE, HOUSE, MARKET_PLAZA],
    [QUARRY, HOUSE, GARDEN_PLAZA],
    [MARKET, BARRACK, HOUSE_PLAZA],
    [HOUSE, GARDEN, MARKET_PLAZA],
    [MARKET, HOUSE, BARRACK_PLAZA],
    #26
    [GARDEN, MARKET, HOUSE],
    [HOUSE, BARRACK, TEMPLE_PLAZA],
    [HOUSE, QUARRY, GARDEN_PLAZA],
    [HOUSE, HOUSE, QUARRY],
    [HOUSE, HOUSE, QUARRY],
    #31
    [BARRACK, GARDEN, QUARRY],
    [TEMPLE, BARRACK, QUARRY],
    [HOUSE, BARRACK, QUARRY],
    [BARRACK, HOUSE, QUARRY],
    [HOUSE, HOUSE, QUARRY],
    #36
    [MARKET, BARRACK, QUARRY],
    [BARRACK, MARKET, QUARRY],
    [HOUSE, MARKET, QUARRY],
    [TEMPLE, MARKET, QUARRY],
    [MARKET, TEMPLE, QUARRY],
    #41
    [MARKET, GARDEN, QUARRY],
    [TEMPLE, HOUSE, QUARRY],
    [GARDEN, HOUSE, QUARRY],
    [HOUSE, TEMPLE, QUARRY],
    [MARKET, HOUSE, QUARRY],
    #46
    [QUARRY, QUARRY, GARDEN],
    [QUARRY, QUARRY, BARRACK],
    [QUARRY, QUARRY, TEMPLE],
    [QUARRY, QUARRY, MARKET],
    [MARKET, HOUSE, QUARRY],
    #51
    [HOUSE, MARKET, QUARRY],
    [TEMPLE, MARKET, HOUSE],
    [GARDEN, BARRACK, HOUSE],
    [MARKET, BARRACK, HOUSE],
    [HOUSE, BARRACK, GARDEN_PLAZA],
    #56
    [MARKET, HOUSE, GARDEN_PLAZA],
    [QUARRY, HOUSE, TEMPLE_PLAZA],
    [HOUSE, MARKET, TEMPLE_PLAZA],
    [QUARRY, QUARRY, HOUSE],
    [HOUSE, BARRACK, QUARRY],
    #61
    [BARRACK, MARKET, QUARRY],

    # Athena
    #62
    [[MARKET, GARDEN]],
    [[BARRACK, TEMPLE]],
    [[HOUSE, MARKET]],
    [[HOUSE, BARRACK]],
    [[MARKET, BARRACK]],
    [[TEMPLE, GARDEN]],
    [[HOUSE, GARDEN]],
    [[MARKET, TEMPLE]],
    [[BARRACK, GARDEN]],
    [[HOUSE, TEMPLE]],
    #72
    [HOUSE],
    [HOUSE],
    [HOUSE],
    [GARDEN],
    [MARKET],
    [MARKET],
    [TEMPLE],
    [TEMPLE],
    [BARRACK],
    [BARRACK],
    #82
    [HOUSE_PLAZA],
    [HOUSE_PLAZA],
    [HOUSE_PLAZA],
    [GARDEN_PLAZA],
    [MARKET_PLAZA],
    [MARKET_PLAZA],
    [TEMPLE_PLAZA],
    [TEMPLE_PLAZA],
    [BARRACK_PLAZA],
    [BARRACK_PLAZA],

    # Pantheon
    # 92
    [HOUSE_PLAZA, QUARRY, QUARRY],
    [MARKET_PLAZA, QUARRY, QUARRY],
    [BARRACK_PLAZA, QUARRY, QUARRY],
    [TEMPLE_PLAZA, QUARRY, QUARRY],
    [GARDEN_PLAZA, QUARRY, QUARRY],

    #97
  ];

  /** @var array<int, int> Minimum player count for each tile */
  public static array $tilesPlayers = [
    #1
    2,
    2,
    2,
    3,
    2,
    #6
    2,
    2,
    2,
    2,
    3,
    #11
    4,
    2,
    2,
    2,
    3,
    #16
    2,
    4,
    4,
    3,
    2,
    #21
    2,
    2,
    2,
    2,
    2,
    #26
    2,
    2,
    2,
    3,
    4,
    #31
    3,
    2,
    4,
    4,
    2,
    #36
    2,
    2,
    4,
    2,
    2,
    #41
    2,
    3,
    4,
    4,
    3,
    #46
    2,
    4,
    2,
    2,
    2,
    #51
    3,
    2,
    2,
    3,
    3,
    #56
    4,
    2,
    4,
    3,
    2,
    #61
    2,

    # ATHENA
    # ALWAYS TAKE THEM IF OPTION IS ENABLED
  ];
}
