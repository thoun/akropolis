<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Core;

use Bga\Games\Akropolis\Game;

/**
 * Statistics management
 * Uses BGA framework's built-in stat system via bga->tableStats and bga->playerStats
 * Documentation: https://en.doc.boardgamearena.com/Main_game_logic:_Game.php#Game_statistics
 */
class Stats
{
  /**
   * Initialize a statistic with a default value
   * Must be called for each statistic in setupNewGame method
   * @param string $name Stat name (as defined in stats.inc.php)
   * @param int|float|bool $value Initial value
   * @param bool $isPlayerStat Whether it's a player stat
   * @return void
   */
  public static function init(string $name, int|float|bool $value = 0, bool $isPlayerStat = false): void
  {
    if ($isPlayerStat) {
      Game::get()->bga->playerStats->init($name, $value);
    } else {
      Game::get()->bga->tableStats->init($name, $value);
    }
  }

  /**
   * Check existence and create stats if needed
   * Note: With BGA framework's built-in system, stats must be initialized
   * via init() method. This method is kept for backward compatibility.
   */
  public static function checkExistence(): void
  {
    // BGA framework handles stat creation via init() calls
    // This method is kept for backward compatibility
  }

  /*********************
   *** CARD STATS *****
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
      $statName = 'card' . $i;

      $currentValue = Game::get()->bga->playerStats->get($statName, $pId);
      if ($currentValue === 0 || $currentValue === null) {
        // Encode card code and draft turn in the stat value
        $value = $cardCode + 2048 * $draftTurn;
        Game::get()->bga->playerStats->set($statName, $value, $pId);
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
      $statName = 'card' . $i;

      $currentValue = Game::get()->bga->playerStats->get($statName, $pId);
      if ($currentValue === null) {
        continue;
      }

      $t = $currentValue % 2048;
      if ($t === $cardCode) {
        // Encode played turn in the higher bits
        $value = $currentValue + $turn * 2048 * 16;
        Game::get()->bga->playerStats->set($statName, $value, $pId);
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
      $statName = 'cardDiscarded' . $i;

      $currentValue = Game::get()->bga->playerStats->get($statName, $pId);
      if ($currentValue === 0 || $currentValue === null) {
        Game::get()->bga->playerStats->set($statName, $code, $pId);
        return;
      }
    }
  }

  /*********************
   *** MONEY STATS *****
   *********************/

  /**
   * Increment money used stat for a player by ID
   * @param int $pId Player ID
   * @param int $n Amount to increment
   */
  public static function incMoneyUsedByPId(int $pId, int $n): void
  {
    Game::get()->bga->playerStats->inc('moneyUsed', $n, $pId);
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

  /*********************
   *** GENERIC HELPERS **
   *********************/

  /**
   * Generic stat getter for player stats
   * @param string $statName Stat name (as defined in stats.inc.php)
   * @param int $pId Player ID
   * @return int|float|bool|null Stat value or null
   */
  public static function getPlayerStat(string $statName, int $pId): int|float|bool|null
  {
    return Game::get()->bga->playerStats->get($statName, $pId);
  }

  /**
   * Generic stat getter for table stats
   * @param string $statName Stat name (as defined in stats.inc.php)
   * @return int|float|bool|null Stat value or null
   */
  public static function getTableStat(string $statName): int|float|bool|null
  {
    return Game::get()->bga->tableStats->get($statName);
  }

  /**
   * Generic stat setter for player stats
   * @param string $statName Stat name (as defined in stats.inc.php)
   * @param int $pId Player ID
   * @param int|float|bool $value Value to set
   * @return void
   */
  public static function setPlayerStat(string $statName, int $pId, int|float|bool $value): void
  {
    Game::get()->bga->playerStats->set($statName, $value, $pId);
  }

  /**
   * Generic stat setter for table stats
   * @param string $statName Stat name (as defined in stats.inc.php)
   * @param int|float|bool $value Value to set
   * @return void
   */
  public static function setTableStat(string $statName, int|float|bool $value): void
  {
    Game::get()->bga->tableStats->set($statName, $value);
  }

  /**
   * Generic stat increment for player stats
   * @param string $statName Stat name (as defined in stats.inc.php)
   * @param int $pId Player ID
   * @param int|float $increment Amount to increment
   * @return void
   */
  public static function incPlayerStat(string $statName, int $pId, int|float $increment = 1): void
  {
    Game::get()->bga->playerStats->inc($statName, $increment, $pId);
  }

  /**
   * Generic stat increment for table stats
   * @param string $statName Stat name (as defined in stats.inc.php)
   * @param int|float $increment Amount to increment
   * @return void
   */
  public static function incTableStat(string $statName, int|float $increment = 1): void
  {
    Game::get()->bga->tableStats->inc($statName, $increment);
  }

  /**
   * Get all values for a player stat
   * @param string $statName Stat name (as defined in stats.inc.php)
   * @return array<int, int|float|bool> Associative array of player_id => value
   */
  public static function getAllPlayerStats(string $statName): array
  {
    return Game::get()->bga->playerStats->getAll($statName);
  }

  /**
   * Magic method that intercepts undefined static method calls
   * Supports: getXxx(), setXxx(), incXxx() patterns for backward compatibility
   * @param string $method Method name
   * @param array<mixed> $args Method arguments
   * @return int|float|bool|void Return value from the operation
   * @throws \InvalidArgumentException If stat doesn't exist
   */
  public static function __callStatic(string $method, array $args)
  {
    if (preg_match('/^(get|set|inc)([A-Z])(.*)$/', $method, $match)) {
      $action = $match[1];
      $name = strtolower($match[2]) . $match[3];

      // We don't need to check if stat exists - BGA framework will handle it
      // and return null for undefined stats

      // Determine if it's a player or table stat by checking the first argument
      // If first arg is a player ID or object, it's a player stat
      $isPlayerStat = !empty($args) && (is_int($args[0]) || is_object($args[0]));

      if ($isPlayerStat) {
        $pId = is_int($args[0]) ? $args[0] : $args[0]->getId();

        if ($action === 'get') {
          return Game::get()->bga->playerStats->get($name, $pId);
        } elseif ($action === 'set') {
          $value = $args[1] ?? null;
          if ($value === null) {
            throw new \InvalidArgumentException("You need to specify a value for setStat");
          }
          Game::get()->bga->playerStats->set($name, $value, $pId);
        } elseif ($action === 'inc') {
          $increment = $args[1] ?? 1;
          Game::get()->bga->playerStats->inc($name, $increment, $pId);
        }
      } else {
        // Table stat
        if ($action === 'get') {
          return Game::get()->bga->tableStats->get($name);
        } elseif ($action === 'set') {
          $value = $args[0] ?? null;
          if ($value === null) {
            throw new \InvalidArgumentException("You need to specify a value for setStat");
          }
          Game::get()->bga->tableStats->set($name, $value);
        } elseif ($action === 'inc') {
          $increment = $args[0] ?? 1;
          Game::get()->bga->tableStats->inc($name, $increment);
        }
      }
    }
  }
}
