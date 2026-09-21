<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Managers;

use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Models\Player;


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

  /**
   * Cast database row to altar format
   * @param array<mixed> $altar Database row
   * @return array{id: int, location: string, state: int, color: string, x: int|null, y: int|null, z: int|null} Altar data
   */
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
  /** @var array<int, array{color: string, count: int}> Altar definitions */
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

  /**
   * Place a Divine Altar on the Capital at a specific position
   * @param string $color Altar color
   * @param Player|null $player Player placing the altar
   * @param int $x X coordinate
   * @param int $y Y coordinate
   * @param int $z Z coordinate
   * @return array|null Altar data or null if placement failed
   */
  public static function placeOnCapitalAtPosition(string $color, ?Player $player, int $x, int $y, int $z): ?array
  {
    // Check if position is valid and available
    if (self::hasAtPosition($x, $y, $z)) {
      return null;
    }

    // Get an altar from reserve
    $altar = self::getFromReserve($color);
    if (!$altar) {
      return null;
    }

    // Place the altar
    self::DB()->update([
      'altar_location' => 'capital',
      'x' => $x,
      'y' => $y,
      'z' => $z,
    ], $altar['altar_id']);

    if ($player) {
      Notifications::placeDivineAltar($player, $color, $x, $y, $z);
    }

    return $altar;
  }

  /**
   * Check if there's an altar at a specific position
   * @param int $x X coordinate
   * @param int $y Y coordinate
   * @param int $z Z coordinate
   * @return bool True if altar exists at position
   */
  public static function hasAtPosition(int $x, int $y, int $z): bool
  {
    return self::getInLocation('capital')
      ->where('x', $x)
      ->where('y', $y)
      ->where('z', $z)
      ->count() > 0;
  }

  /**
   * Get an altar from reserve by color
   * @param string $color Altar color
   * @return array|null Altar data or null
   */
  public static function getFromReserve(string $color): ?array
  {
    return self::getInLocation('reserve')
      ->where('altar_color', $color)
      ->first();
  }

  /**
   * Get all available plaza positions in Capital grouped by color
   * @return array<string, array<array{x: int, y: int, z: int}>> Available positions grouped by plaza color
   */
  public static function getAvailablePlazaPositions(): array
  {
    $capital = Players::getCapital();
    $board = $capital->board();

    // Get all plaza positions on the Capital board
    $availableByColor = [];
    foreach ($board->getVisibleBuiltCells() as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if (in_array($type, PLAZAS) && !self::hasAtPosition($cell['x'], $cell['y'], $cell['z'])) {
          $color = self::getPlazaColorFromType($type);
          if ($color) {
            $availableByColor[$color][] = $cell;
          }
        }
      }
    }

    return $availableByColor;
  }

  /**
   * Get the plaza color from a type string
   * @param string|null $type Type string
   * @return string|null Plaza color or null if not a plaza
   */
  private static function getPlazaColorFromType(?string $type): ?string
  {
    return [
      BARRACK_PLAZA => BARRACK,
      HOUSE_PLAZA => HOUSE,
      GARDEN_PLAZA => GARDEN,
      MARKET_PLAZA => MARKET,
      TEMPLE_PLAZA => TEMPLE
    ][$type] ?? null;
  }
}
