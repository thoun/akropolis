<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Core;

use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Managers\Players;

/**
 * Statistics management
 */
class Stats extends \Bga\Games\Akropolis\Helpers\DB_Manager
{
  protected static string $table = 'stats';
  protected static string $primary = 'stats_id';

  /**
   * Cast database row to stat format
   * @param array{stats_id: int, stats_type: int, stats_player_id: int|null, stats_value: int} $row Database row
   * @return array{id: int, type: int, pId: int|null, value: int} Formatted stat
   */
  protected static function cast(array $row): array
  {
    return [
      'id' => $row['stats_id'],
      'type' => $row['stats_type'],
      'pId' => $row['stats_player_id'],
      'value' => $row['stats_value'],
    ];
  }

  /**
   * Create and store a stat declared but not present in DB yet
   * (only happens when adding stats while a game is running)
   */
  public static function checkExistence(): void
  {
    $default = [
      'int' => 0,
      'float' => 0,
      'bool' => false,
      'str' => '',
    ];

    // Fetch existing stats, all stats
    $stats = Game::get()->getStatTypes();

    /** @var array<int, string> $existingStats */
    $existingStats = self::DB()
      ->get()
      ->map(function ($stat) {
        return $stat['type'] . ',' . ($stat['pId'] === null ? 'table' : 'player');
      })
      ->toArray();

    $values = [];
    // Deal with table stats first
    foreach ($stats['table'] as $stat) {
      if ($stat['id'] < 10) {
        continue;
      }
      if (!in_array($stat['id'] . ',table', $existingStats)) {
        $values[] = [
          'stats_type' => $stat['id'],
          'stats_player_id' => null,
          'stats_value' => $default[$stat['type']],
        ];
      }
    }

    // Deal with player stats
    $playerIds = Players::getAll()->getIds();
    foreach ($stats['player'] as $stat) {
      if ($stat['id'] < 10) {
        continue;
      }
      if (!in_array($stat['id'] . ',player', $existingStats)) {
        foreach ($playerIds as $i => $pId) {
          $value = $default[$stat['type']];
          if ($stat['id'] === STAT_STARTING_POSITION) {
            $value = $i + 1;
          }

          $values[] = [
            'stats_type' => $stat['id'],
            'stats_player_id' => $pId,
            'stats_value' => $value,
          ];
        }
      }
    }

    // Insert if needed
    if (!empty($values)) {
      self::DB()
        ->multipleInsert(['stats_type', 'stats_player_id', 'stats_value'])
        ->values($values);
    }
  }

  /**
   * Get a filtered query for a specific stat
   * @param int $id Stat type ID
   * @param int|object|null $pId Player ID or player object (null for table stats)
   * @return \Bga\Games\Akropolis\Helpers\QueryBuilder Query builder
   */
  protected static function getFilteredQuery(int $id, int|object|null $pId): \Bga\Games\Akropolis\Helpers\QueryBuilder
  {
    $query = self::DB()->where('stats_type', $id);
    if ($pId === null) {
      $query = $query->whereNull('stats_player_id');
    } else {
      $query = $query->where('stats_player_id', is_int($pId) ? $pId : $pId->getId());
    }
    return $query;
  }

  /**
   * Magic method that intercepts undefined static method calls
   * Supports: getXxx(), setXxx(), incXxx() patterns
   * @param string $method Method name
   * @param array<mixed> $args Method arguments
   * @return int|null Stat value or null
   */
  public static function __callStatic(string $method, array $args): ?int
  {
    if (preg_match('/^([gs]et|inc)([A-Z])(.*)$/', $method, $match)) {
      $stats = Game::get()->getStatTypes();

      // Sanity check: does the name correspond to a declared variable?
      $name = strtolower($match[2]) . $match[3];
      $isTableStat = \array_key_exists($name, $stats['table']);
      $isPlayerStat = \array_key_exists($name, $stats['player']);
      if (!$isTableStat && !$isPlayerStat) {
        throw new \InvalidArgumentException("Statistic {$name} doesn't exist");
      }

      if ($match[1] === 'get') {
        // Basic getters
        $id = null;
        $pId = null;
        if ($isTableStat) {
          $id = $stats['table'][$name]['id'];
        } else {
          if (empty($args)) {
            throw new \InvalidArgumentException("You need to specify the player for the stat {$name}");
          }
          $id = $stats['player'][$name]['id'];
          $pId = $args[0];
        }

        /** @var array{value: int}|null $row */
        $row = self::getFilteredQuery($id, $pId)->get(true);
        return $row['value'];
      } elseif ($match[1] === 'set') {
        // Setters in DB and update cache
        $id = null;
        $pId = null;
        $value = null;

        if ($isTableStat) {
          $id = $stats['table'][$name]['id'];
          $value = $args[0];
        } else {
          if (count($args) < 2) {
            throw new \InvalidArgumentException("You need to specify the player for the stat {$name}");
          }
          $id = $stats['player'][$name]['id'];
          $pId = $args[0];
          $value = $args[1];
        }

        self::getFilteredQuery($id, $pId)
          ->update(['stats_value' => $value])
          ->run();
        return $value;
      } elseif ($match[1] === 'inc') {
        $id = null;
        $pId = null;
        $value = null;

        if ($isTableStat) {
          $id = $stats['table'][$name]['id'];
          $value = $args[0] ?? 1;
        } else {
          if (count($args) < 1) {
            throw new \InvalidArgumentException("You need to specify the player for the stat {$name}");
          }
          $id = $stats['player'][$name]['id'];
          $pId = $args[0];
          $value = $args[1] ?? 1;
        }

        self::getFilteredQuery($id, $pId)
          ->inc(['stats_value' => $value])
          ->run();
        return $value;
      }
    }
    return null;
  }

  /*********************
   ***** CARD STATS ****
   *********************/

  /**
   * Set next card for a player
   * @param int $pId Player ID
   * @param int $cardCode Card code
   * @param int $draftTurn Draft turn number
   */
  public static function setNextCard(int $pId, int $cardCode, int $draftTurn): void
  {
    for ($i = 1; $i <= 14; $i++) {
      $name = 'getCard' . $i;
      $s = (int) self::$name($pId);
      if ($s === 0) {
        $name = 'setCard' . $i;
        self::$name($pId, $cardCode + 2048 * $draftTurn);
        return;
      }
    }
  }

  /**
   * Set card as played for a player
   * @param int $pId Player ID
   * @param int $cardCode Card code
   * @param int $turn Turn number
   */
  public static function setCardPlayed(int $pId, int $cardCode, int $turn): void
  {
    for ($i = 1; $i <= 14; $i++) {
      $name = 'getCard' . $i;
      $s = (int) self::$name($pId);
      $t = $s % 2048;
      if ($t === $cardCode) {
        $name = 'setCard' . $i;
        self::$name($pId, $s + $turn * 2048 * 16);
        return;
      }
    }
  }

  /**
   * Set next discarded card for a player
   * @param int $pId Player ID
   * @param int $code Card code
   */
  public static function setNextDiscardedCard(int $pId, int $code): void
  {
    for ($i = 1; $i <= 6; $i++) {
      $name = 'getCardDiscarded' . $i;
      $s = (int) self::$name($pId);
      if ($s === 0) {
        $name = 'setCardDiscarded' . $i;
        self::$name($pId, $code);
        return;
      }
    }
  }

  /**
   * Increment money used stat for a player by ID
   * @param int $pId Player ID
   * @param int $n Amount to increment
   */
  public static function incMoneyUsedByPId(int $pId, int $n): void
  {
    self::incMoneyUsed($pId, $n);
  }

  /**
   * Increment money used stat for a player
   * @param int|object $player Player ID or player object
   * @param int $n Amount to increment
   */
  public static function incMoneyUsed(int|object $player, int $n): void
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::incMoneyUsedByPId($pId, $n);
  }
}
