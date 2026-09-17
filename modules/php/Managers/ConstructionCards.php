<?php

namespace Bga\Games\Akropolis\Managers;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Helpers\Utils;
use Bga\Games\Akropolis\Models\ConstructionCard;

/* Class to manage all the construction cards for Akropolis */

class ConstructionCards extends \Bga\Games\Akropolis\Helpers\Pieces
{
  protected static string $table = 'construction-cards';
  protected static string $prefix = 'card_';
  protected static array $customFields = [];
  protected static bool $autoIncrement = false;
  protected static bool $autoremovePrefix = false;

  protected static function cast($card): ConstructionCard
  {
    return self::getCardInstance($card['card_id'], $card);
  }

  public static function getCardInstance($id, $data = null): ConstructionCard
  {
    $className = "\Bga\Games\Akropolis\ConstructionCards\\$id";
    return new $className($data);
  }

  public static function getUiData(): array
  {
    if (!Globals::isAthena()) return [];

    return self::getAll()->ui();
  }

  public static function setupNewGame(array $players, array $options): void
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

  static array $cards = [
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
