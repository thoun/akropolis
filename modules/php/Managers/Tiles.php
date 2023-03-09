<?php
namespace AKR\Managers;
use AKR\Core\Globals;

/* Class to manage all the tiles for Akropolis */

class Tiles extends \AKR\Helpers\Pieces
{
  protected static $table = 'tiles';
  protected static $prefix = 'card_';
  protected static $customFields = ['level', 'player_id', 'extra_datas', 'type'];
  protected static $autoIncrement = true;
  protected static $autoremovePrefix = false;

  // protected static function cast($card)
  // {
  //   return self::getInstance($card['type'], $card);
  // }

  // protected static function getInstance($type, $row = null)
  // {
  //   $className = '' . $type;
  //   return new $className($row);
  // }

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
