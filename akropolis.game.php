<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Akropolis implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * akropolis.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */

$swdNamespaceAutoload = function ($class) {
  $classParts = explode('\\', $class);
  if ($classParts[0] == 'AKR') {
    array_shift($classParts);
    $file = dirname(__FILE__) . '/modules/php/' . implode(DIRECTORY_SEPARATOR, $classParts) . '.php';
    if (file_exists($file)) {
      require_once $file;
    } else {
      var_dump('Cannot find file : ' . $file);
    }
  }
};
spl_autoload_register($swdNamespaceAutoload, true, true);

require_once APP_GAMEMODULE_PATH . 'module/table/table.game.php';

use AKR\Core\Globals;
use AKR\Core\Stats;
use AKR\Core\Preferences;
use AKR\Managers\ConstructionCards;
use AKR\Managers\Players;
use AKR\Managers\Tiles;

class Akropolis extends Table
{
  use AKR\DebugTrait;
  use AKR\States\TurnTrait;
  use AKR\States\CompleteCardTrait;
  use AKR\States\ArchitectTurnTrait;
  use AKR\States\EndOfGameTrait;

  public static $instance = null;
  function __construct()
  {
    parent::__construct();
    self::$instance = $this;
    self::initGameStateLabels(['logging' => 10]);
    Stats::checkExistence();
  }

  public static function get()
  {
    return self::$instance;
  }

  protected function getGameName()
  {
    return 'akropolis';
  }

  /*
   * setupNewGame:
   */
  protected function setupNewGame($players, $options = [])
  {
    Globals::setupNewGame($players, $options);
    Players::setupNewGame($players, $options);
    ConstructionCards::setupNewGame($players, $options);
    Tiles::setupNewGame($players, $options);
    $this->activeNextPlayer();
  }

  /*
   * getAllDatas:
   */
  public function getAllDatas()
  {
    $pId = $this->getCurrentPId();

    $activatedVariants = [];
    foreach (DISTRICTS as $district) {
      if (Globals::isVariant($district)) {
        $activatedVariants[] = $district;
      }
    }

    return [
      'prefs' => Preferences::getUiData($pId),
      'players' => Players::getUiData($pId),
      'dock' => Tiles::getUiData(),
      'deck' => Tiles::countInLocation('deck'),
      'firstPlayerId' => Globals::getFirstPlayer(),
      'activatedVariants' => $activatedVariants,
      'allTiles' => Globals::isAllTiles(),
      'soloPlayer' => Globals::isSolo() ? Players::getArchitect()->getUiData($pId) : null,
      'lastMoves' => Globals::getLastMoves(),

      // Athena
      'isAthena' => Globals::isAthena(),
      'cards' => ConstructionCards::getUiData(),
      'cardStatuses' => Globals::getAthenaCardStatuses(),
    ];
  }

  /*
   * getGameProgression:
   */
  function getGameProgression()
  {
    $placed = Tiles::countInLocation('board');
    $allTilesToPlace = Tiles::getSelectWhere(null, null, null)->count() - 1;
    return ($placed * 100) / $allTilesToPlace;
  }

  function actChangePreference($pref, $value)
  {
    Preferences::set($this->getCurrentPId(), $pref, $value);
  }

  ////////////////////////////////////
  ////////////   Zombie   ////////////
  ////////////////////////////////////
  /*
   * zombieTurn:
   *   This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
   *   You can do whatever you want in order to make sure the turn of this player ends appropriately
   */
  public function zombieTurn($state, $activePlayer)
  {
    $stateName = $state['name'];
    if ($state['type'] === 'activeplayer') {
      $this->gamestate->nextState('zombiePass');
    } elseif ($state['type'] === 'multipleactiveplayer') {
      // Make sure player is in a non blocking status for role turn
      $this->gamestate->setPlayerNonMultiactive($activePlayer, '');
    }
  }

  /////////////////////////////////////
  //////////   DB upgrade   ///////////
  /////////////////////////////////////
  // You don't have to care about this until your game has been published on BGA.
  // Once your game is on BGA, this method is called everytime the system detects a game running with your old Database scheme.
  // In this case, if you change your Database scheme, you just have to apply the needed changes in order to
  //   update the game database and allow the game to continue to run with your new version.
  /////////////////////////////////////
  /*
   * upgradeTableDb
   *  - int $from_version : current version of this game database, in numerical form.
   *      For example, if the game was running with a release of your game named "140430-1345", $from_version is equal to 1404301345
   */
  public function upgradeTableDb($from_version) {}

  /////////////////////////////////////////////////////////////
  // Exposing protected methods, please use at your own risk //
  /////////////////////////////////////////////////////////////

  // Exposing protected method getCurrentPlayerId
  public function getCurrentPId()
  {
    return $this->getCurrentPlayerId();
  }

  // Exposing protected method translation
  public function translate($text)
  {
    return $this->_($text);
  }
}
