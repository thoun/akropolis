<?php

declare(strict_types=1);

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Akropolis implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */

namespace Bga\Games\Akropolis;

require_once 'constants.inc.php';

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Stats;
use Bga\Games\Akropolis\Core\Preferences;
use Bga\Games\Akropolis\Managers\ConstructionCards;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\Tiles;
use Bga\Games\Akropolis\Managers\Altars;
use Bga\Games\Akropolis\Managers\PantheonChallenges;
use Bga\Games\Akropolis\States\Pantheon\PantheonSetup;
use Bga\Games\Akropolis\States\PlaceTile;
use Bga\GameFramework\Table;

class Game extends Table
{
  use DebugTrait;

  public static ?Game $instance = null;

  /**
   * Game constructor
   */
  function __construct()
  {
    parent::__construct();
    self::$instance = $this;
    self::initGameStateLabels(['logging' => 10]);
  }

  /**
   * Get the game instance
   * @return Game The singleton game instance
   */
  public static function get(): Game
  {
    return self::$instance;
  }

  /*
   * setupNewGame:
   */
  protected function setupNewGame($players, $options = []): mixed
  {
    Globals::setupNewGame($players, $options);
    Players::setupNewGame($players, $options);
    ConstructionCards::setupNewGame($players, $options);
    Tiles::setupNewGame($players, $options);
    $this->activeNextPlayer();

    if (Globals::isPantheon()) {
      Altars::setupNewGame();
      PantheonChallenges::setupNewGame($players, $options);
      return PantheonSetup::class;
    }

    return PlaceTile::class;
  }

  /*
   * getAllDatas:
   */
  public function getAllDatas(int $currentPlayerId): array
  {
    $activatedVariants = [];
    foreach (DISTRICTS as $district) {
      if (Globals::isVariant($district)) {
        $activatedVariants[] = $district;
      }
    }

    $data = [
      'players' => Players::getUiData($currentPlayerId),
      'dock' => Tiles::getUiData(),
      'deck' => Tiles::countInLocation('deck'),
      'firstPlayerId' => Globals::getFirstPlayer(),
      'activatedVariants' => $activatedVariants,
      'allTiles' => Globals::isAllTiles(),
      'soloPlayer' => Globals::isSolo() ? Players::getArchitect()->getUiData($currentPlayerId) : null,
      'lastMoves' => Globals::getLastMoves(),

      // Athena
      'isAthena' => Globals::isAthena(),
      'cards' => ConstructionCards::getUiData(),
      'cardStatuses' => Globals::getAthenaCardStatuses(),

      // Pantheon
      'isPantheon' => Globals::isPantheon(),
    ];

    if (Globals::isPantheon()) {
      $data['challenges'] = PantheonChallenges::getUiData();
      $data['capital'] = Players::getCapital()->getUiData($currentPlayerId);
    }

    return $data;
  }

  /*
   * getGameProgression:
   */
  function getGameProgression(): int
  {
    $placed = Tiles::countInLocation('board');
    $allTilesToPlace = Tiles::getSelectWhere(null, null, null)->count() - 1;
    return ($placed * 100) / $allTilesToPlace;
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
}
