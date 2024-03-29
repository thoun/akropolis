<?php
namespace AKR\Managers;
use AKR\Core\Game;
use AKR\Core\Globals;
use AKR\Core\Stats;
use AKR\Helpers\Utils;

/*
 * Players manager : allows to easily access players ...
 *  a player is an instance of Player class
 */
class Players extends \AKR\Helpers\DB_Manager
{
  protected static $table = 'player';
  protected static $primary = 'player_id';
  protected static function cast($row)
  {
    return new \AKR\Models\Player($row);
  }

  public static function setupNewGame($players, $options)
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
      $values[] = [$pId, $color, $player['player_canal'], $player['player_name'], $player['player_avatar'], 0, $i++];
    }
    $query->values($values);

    self::determineFirstPlayer();

    Game::get()->reattributeColorsBasedOnPreferences($players, $gameInfos['player_colors']);
    Game::get()->reloadPlayersBasicInfos();
  }

  public static function getActiveId()
  {
    return (int) Game::get()->getActivePlayerId();
  }

  public static function getCurrentId()
  {
    return (int) Game::get()->getCurrentPId();
  }

  public static function getAll()
  {
    return self::DB()->get(false);
  }

  /*
   * get : returns the Player object for the given player ID
   */
  public static function get($pId = null)
  {
    $pId = $pId ?: self::getActiveId();
    return self::DB()
      ->where($pId)
      ->getSingle();
  }

  public static function getActive()
  {
    return self::get();
  }

  public static function getCurrent()
  {
    return self::get(self::getCurrentId());
  }

  public static function getNextId($player)
  {
    $pId = is_int($player) ? $player : $player->getId();
    $table = Game::get()->getNextPlayerTable();
    return (int) $table[$pId];
  }

  /*
   * Return the number of players
   */
  public static function count()
  {
    return self::DB()->count();
  }

  /*
   * getUiData : get all ui data of all players
   */
  public static function getUiData($pId)
  {
    return self::getAll()
      ->map(function ($player) use ($pId) {
        return $player->getUiData($pId);
      })
      ->toAssoc();
  }

  public static function getArchitect()
  {
    return Globals::isSolo() ? new \AKR\Models\Architect(null) : null;
  }

  public static function determineFirstPlayer()
  {
    $pId = self::getFirstPlayerId();
    Globals::setFirstPlayer($pId);
  }

  /*
   * Get first player according to player_no
   */
  public static function getFirstPlayerId()
  {
    return self::DB()
      ->select(['player_id'])
      ->orderBy('player_no', 'ASC')
      ->getSingle()
      ->getId();
  }
}
