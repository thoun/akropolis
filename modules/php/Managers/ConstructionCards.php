<?php

namespace AKR\Managers;

use AKR\Core\Globals;
use AKR\Helpers\Utils;

/* Class to manage all the construction cards for Akropolis */

class ConstructionCards extends \AKR\Helpers\Pieces
{
  protected static $table = 'construction-cards';
  protected static $prefix = 'card_';
  protected static $customFields = [];
  protected static $autoIncrement = false;
  protected static $autoremovePrefix = false;

  protected static function cast($card)
  {
    return self::getCardInstance($card['card_id'], $card);
  }

  public static function getCardInstance($id, $data = null)
  {
    $className = "\AKR\ConstructionCards\\$id";
    return new $className($data);
  }

  public static function getUiData()
  {
    return self::getInLocation('athena-%')->toArray();
  }

  public static function setupNewGame($players, $options)
  {
    if (!Globals::isAthena()) return;

    $cardIds = Utils::rand(self::$cards, 4);
    $cards = [];
    foreach ($cardIds as $i => $id) {
      $slot = $i + 1;
      $cards[] = [
        'id' => $id,
        'location' => "athena-$slot"
      ];
    }

    // Create the tiles
    self::create($cards);
  }

  static $cards = [
    "Agora",
    "CityMarket",
    "DistrictCenter",
    "Fortress",
    "GuardTower",
    "HangingGardens",
    "Housing",
    "LuxuryGoods",
    "MainStreet",
    "Oasis",
    "Pantheon",
    "Parkland",
    "PilgrimsStairs",
    "QuarryMine",
    "Rampart",
    "Sanctuary",
    "Storehouses",
    "Villa",
  ];
}
