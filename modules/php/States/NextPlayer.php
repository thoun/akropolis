<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States;

use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\Tiles;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Akropolis\Helpers\Utils;

/**
 * NextPlayer State
 * Game state to handle transition between players
 */
class NextPlayer extends GameState
{
  /**
   * NextPlayer constructor
   * @param Game $game Game instance
   */
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_NEXT_PLAYER,
      type: StateType::GAME,
      name: 'nextPlayer',
      description: '',
      transitions: [
        'placeTile' => ST_PLACE_TILE,
        'end' => ST_PRE_END_OF_GAME,
      ],
      updateGameProgression: true,
    );
  }

  /**
   * Handle transition to next player
   * @return string Next transition ('placeTile' or 'end')
   */
  public function onEnteringState(): string
  {
    $activePId = (int) Players::getActiveId();
    $nextPId = Globals::isSolo() ? 0 : Players::getNextId($activePId);

    // Refill if needed
    $this->refillIfNeeded($nextPId);

    // Auto play architect if solo
    if (Globals::isSolo()) {
      $this->stArchitectTurn();
      $this->refillIfNeeded($activePId);
    } else {
      // Move to next player
      $this->game->activeNextPlayer();
    }

    if ($nextPId != 0) {
      $this->game->giveExtraTime($nextPId);
    }

    return Globals::isEndOfGame() ? 'end' : 'placeTile';
  }


  public function stArchitectTurn()
  {
    $architect = Players::getArchitect();
    $geometry = TILE_GEOMETRIES[3];
    $options = $architect->board()->getPlacementOptions(0, $geometry);

    // Keep only options at ground level
    Utils::filter($options, function ($option) {
      return $option['z'] == 0;
    });

    // Keep the closest one to the center
    $min = null;
    $minOption = null;
    foreach ($options as $option) {
      $dist = abs($option['x']) + abs($option['y']);
      if (is_null($min) || $dist < $min) {
        $min = $dist;
        $minOption = $option;
      }
    }

    // Find the tile
    $tiles = Tiles::getInLocation('dock')->order(function ($tile1, $tile2) {
      return $tile1['state'] - $tile2['state'];
    });
    $tilesWithPlaza = $tiles->filter(function ($tile) use ($architect) {
      return $tile['state'] <= $architect->getMoney() && count(array_intersect(PLAZAS, $tile['hexes'])) > 0;
    });

    if ($tilesWithPlaza->empty()) {
      $tileId = $tiles->first()['id'];
      Notifications::automataDelay($architect, clienttranslate('${player_name} takes the first City tile from the Construction Site'));
    } else {
      $tileId = $tilesWithPlaza->first()['id'];
      Notifications::automataDelay($architect, clienttranslate('${player_name} takes cheapest City tile with a Plaza'));
    }

    Tiles::placeTile($architect, $tileId, 0, $minOption, $minOption['r'][0]);
  }

  /**
   * Refill the dock if needed and trigger detect end of game
   * @param int $nextPId Next player ID
   */
  private function refillIfNeeded(int $nextPId): void
  {
    if (Tiles::countInLocation('dock') == 1) {
      if (Tiles::countInLocation('deck') > 0) {
        $dock = Tiles::refillDock();
        $deck = Tiles::countInLocation('deck');
        Notifications::refill($dock, $deck);

        Globals::setFirstPlayer($nextPId);
        Notifications::updateFirstPlayer($nextPId);
      } else {
        Globals::setEndOfGame(true);
      }
    }
  }
}
