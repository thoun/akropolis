<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Managers;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Game;

/*
 * Players manager : allows to easily access players ...
 *  a player is an instance of Player class
 */

class Players extends \Bga\Games\Akropolis\Helpers\DB_Manager
{
  protected static string $table = 'player';
  protected static string $primary = 'player_id';

  /**
   * Cast database row to Player object
   * @param array<mixed> $row Database row
   * @return \Bga\Games\Akropolis\Models\Player Player object
   */
  protected static function cast(array $row): \Bga\Games\Akropolis\Models\Player
  {
    return new \Bga\Games\Akropolis\Models\Player($row);
  }

  /**
   * Setup new game with player data
   * @param array<int, array{player_canal: string, player_name: string, player_avatar: string}> $players Player info
   * @param array<string, mixed> $options Game options
   */
  public static function setupNewGame(array $players, array $options): void
  {
    // Create players
    $gameInfos = Game::get()->getGameinfos();
    $colors = $gameInfos['player_colors'];
    $query = self::DB()->multipleInsert([
      'player_id',
      'player_color',
      'player_canal',
      'player_name',
      'player_avatar',
      'player_score',
      'money',
    ]);

    $values = [];
    $i = 1;
    foreach ($players as $pId => $player) {
      $color = array_shift($colors);
      $stones = $i++;
      if (Globals::isPantheon()) {
        $stones = 2;
      }
      $values[] = [$pId, $color, $player['player_canal'], $player['player_name'], $player['player_avatar'], 0, $stones];
    }
    $query->values($values);

    self::determineFirstPlayer();

    Game::get()->reattributeColorsBasedOnPreferences($players, $gameInfos['player_colors']);
    Game::get()->reloadPlayersBasicInfos();
  }

  /**
   * Get active player ID
   * @return int Active player ID
   */
  public static function getActiveId(): int
  {
    return (int) Game::get()->getActivePlayerId();
  }

  /**
   * Get current player ID
   * @return int Current player ID
   */
  public static function getCurrentId(): int
  {
    return (int) Game::get()->getCurrentPlayerId();
  }

  /**
   * Get all players
   * @return \Bga\Games\Akropolis\Helpers\Collection<int, \Bga\Games\Akropolis\Models\Player> Collection of all players
   */
  public static function getAll(): \Bga\Games\Akropolis\Helpers\Collection
  {
    return self::DB()->get(false);
  }

  /**
   * Get a player by ID
   * @param int|null $pId Player ID (defaults to active player)
   * @return \Bga\Games\Akropolis\Models\Player|null Player object or null
   */
  public static function get(?int $pId = null): ?\Bga\Games\Akropolis\Models\Player
  {
    $pId = $pId ?: self::getActiveId();
    return self::DB()
      ->where($pId)
      ->getSingle();
  }

  /**
   * Get active player
   * @return \Bga\Games\Akropolis\Models\Player|null Active player or null
   */
  public static function getActive(): ?\Bga\Games\Akropolis\Models\Player
  {
    return self::get();
  }

  /**
   * Get current player
   * @return \Bga\Games\Akropolis\Models\Player|null Current player or null
   */
  public static function getCurrent(): ?\Bga\Games\Akropolis\Models\Player
  {
    return self::get(self::getCurrentId());
  }

  /**
   * Get next player ID
   * @param int|object $player Player ID or player object
   * @return int Next player ID
   */
  public static function getNextId(int|object $player): int
  {
    $pId = is_int($player) ? $player : $player->getId();
    $table = Game::get()->getNextPlayerTable();
    return (int) $table[$pId];
  }

  /**
   * Return the number of players
   * @return int Number of players
   */
  public static function count(): int
  {
    return self::DB()->count();
  }

  /**
   * Get UI data for all players
   * @param int $pId Current player ID for perspective
   * @return array<int, array> Associative array of player UI data
   */
  public static function getUiData(int $pId): array
  {
    return self::getAll()
      ->map(function ($player) use ($pId) {
        return $player->getUiData($pId);
      })
      ->toAssoc();
  }

  /**
   * Get architect player (for solo mode)
   * @return \Bga\Games\Akropolis\Models\Architect|null Architect or null
   */
  public static function getArchitect(): ?\Bga\Games\Akropolis\Models\Architect
  {
    return Globals::isSolo() ? new \Bga\Games\Akropolis\Models\Architect(null) : null;
  }

  /**
   * Get capital player (for Pantheon mode)
   * @return \Bga\Games\Akropolis\Models\Capital|null Capital or null
   */
  public static function getCapital(): ?\Bga\Games\Akropolis\Models\Capital
  {
    return Globals::isPantheon() ? new \Bga\Games\Akropolis\Models\Capital(null) : null;
  }

  /**
   * Determine first player and store in globals
   */
  public static function determineFirstPlayer(): void
  {
    $pId = self::getFirstPlayerId();
    Globals::setFirstPlayer($pId);
  }

  /**
   * Get first player according to player_no
   * @return int First player ID
   */
  public static function getFirstPlayerId(): int
  {
    return self::DB()
      ->select(['player_id'])
      ->orderBy('player_no', 'ASC')
      ->getSingle()
      ->getId();
  }
}
