<?php
namespace AKR\Managers;
use AKR\Core\Globals;

/* Class to manage all the tiles for Akropolis */

class Tiles extends \AKR\Helpers\Pieces
{
  protected static $table = 'tiles';
  protected static $prefix = 'tile_';
  protected static $customFields = ['player_id', 'x', 'y', 'z', 'r'];
  protected static $autoIncrement = false;
  protected static $autoremovePrefix = true;

  protected static function cast($tile)
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

  public function getUiData()
  {
    return self::getInLocation('dock')->toArray();
  }

  public function setupNewGame($players, $options)
  {
    $tiles = [];
    foreach (self::$tiles as $id => $tile) {
      // Check number of players of tile
      if (
        self::$tilesPlayers[$id] > count($players) &&
        ($options[OPTION_ALL_TILES] ?? OPTION_ALL_TILES_DISABLED) == OPTION_ALL_TILES_DISABLED
      ) {
        continue;
      }

      $tiles[] = [
        'id' => $id,
        'player_id' => null,
        'x' => 0,
        'y' => 0,
        'r' => 0,
      ];
    }

    // Create the tiles
    self::create($tiles, 'deck');
    self::shuffle('deck');

    self::refillDock();
  }

  public static function refillDock()
  {
    $nPlayers = Players::count();
    for ($i = self::countInLocation('dock'); $i < $nPlayers + 2; $i++) {
      self::pickForLocation(1, 'deck', 'dock', $i);
    }

    return self::getInLocation('dock')->toArray();
  }

  public static function shiftDock($i)
  {
    for (; $i < 6; $i++) {
      foreach (self::getInLocation('dock', $i + 1) as $tile) {
        self::setState($tile['id'], $i);
      }
    }
  }

  public static function getOfPlayer($pId)
  {
    return self::getSelectQuery()
      ->wherePlayer($pId)
      ->get();
  }

  public function add($tileId, $pId, $pos, $rotation)
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

  public static $tiles = [
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
  ];

  public static $tilesPlayers = [
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
  ];
}
