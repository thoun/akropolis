<?php

namespace Bga\Games\Akropolis\Managers;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;


// Circular dependency: PantheonManager uses Altars, Altars uses PantheonManager
// We'll use the class name directly without import to avoid issues

/* Class to manage all the altars for Pantheon expansion */

class Altars extends \Bga\Games\Akropolis\Helpers\Pieces
{
  protected static string $table = 'pantheon_altars';
  protected static string $prefix = 'altar_';
  protected static array $customFields = ['color', 'x', 'y', 'z'];
  protected static bool $autoIncrement = true;
  protected static bool $autoremovePrefix = true;

  protected static function cast(array $altar): array
  {
    return [
      'id' => (int) $altar['altar_id'],
      'location' => $altar['altar_location'],
      'state' => (int) ($altar['altar_state']),
      'color' => $altar['altar_color'],
      'x' => $altar['x'] !== null ? (int) $altar['x'] : null,
      'y' => $altar['y'] !== null ? (int) $altar['y'] : null,
      'z' => $altar['z'] !== null ? (int) $altar['z'] : null,
    ];
  }

  // Altar definitions: color, god, count
  public static array $altars = [
    ['color' => BARRACK, 'count' => 4],
    ['color' => GARDEN, 'count' => 3],
    ['color' => HOUSE, 'count' => 5],
    ['color' => MARKET, 'count' => 4],
    ['color' => TEMPLE, 'count' => 4],
  ];

  /**
   * Setup Divine Altars in reserve
   */
  public static function setupNewGame(): void
  {
    $altars = [];
    foreach (self::$altars as $altar) {
      $altars[] = [
        'nbr' => $altar['count'],
        'color' => $altar['color'],
        'state' => 0,
        'location' => 'reserve',
        'x' => null,
        'y' => null,
        'z' => null,
      ];
    }

    self::create($altars);
  }



  // /**
  //  * Place a Divine Altar on the Capital on the first available plaza of matching color
  //  */
  // public static function placeOnCapital($color, $player = null): bool
  // {
  //   $capital = PantheonManager::getCapital();
  //   $plazas = $capital->getPlazasByColor($color);

  //   foreach ($plazas as $plaza) {
  //     if (!self::hasAtPosition($plaza['x'], $plaza['y'], $plaza['z'])) {
  //       $altar = self::getFromReserve($color);
  //       if ($altar) {
  //         self::DB()->update([
  //           'altar_location' => 'capital',
  //           'x' => $plaza['x'],
  //           'y' => $plaza['y'],
  //           'z' => $plaza['z'],
  //         ], $altar['altar_id'], 'pantheon_altars');

  //         $capital->placeAltar($altar, $plaza);

  //         if ($player) {
  //           Notifications::placeDivineAltar($player, $color, $plaza);
  //         }
  //         return true;
  //       }
  //     }
  //   }

  //   return false;
  // }

  // /**
  //  * Check if there's an altar at a specific position
  //  */
  // public static function hasAtPosition($x, $y, $z): bool
  // {
  //   $result = self::getInLocation(CAPITAL_LOC)
  //     ->where('x', $x)
  //     ->where('y', $y)
  //     ->where('z', $z)
  //     ->where('location', 'capital')
  //     ->getSingle();

  //   return $result !== null;
  // }

  // /**
  //  * Get an altar from reserve by color
  //  */
  // public static function getFromReserve($color)
  // {
  //   return self::DB()
  //     ->where('altar_color', $color)
  //     ->where('altar_location', 'reserve')
  //     ->getSingle('pantheon_altars');
  // }

  // /**
  //  * Get all altars in the capital
  //  */
  // public static function getInCapital(): array
  // {
  //   return self::DB()
  //     ->where('altar_location', 'capital')
  //     ->get(false, 'pantheon_altars');
  // }

  // /**
  //  * Get all altars in reserve
  //  */
  // public static function getInReserve(): array
  // {
  //   return self::DB()
  //     ->where('altar_location', 'reserve')
  //     ->get(false, 'pantheon_altars');
  // }
}
