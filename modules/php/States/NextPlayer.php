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

/**
 * NextPlayer State
 * Game state to handle transition between players
 */
class NextPlayer extends GameState
{
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
   */
  public function onEnteringState(): string
  {
    $activePId = (int) Players::getActiveId();
    $nextPId = Globals::isSolo() ? 0 : Players::getNextId($activePId);

    // Refill if needed
    $this->refillIfNeeded($nextPId);

    // Auto play architect if solo
    if (Globals::isSolo()) {
      // Call the architect turn method from the game
      if (method_exists($this->game, 'stArchitectTurn')) {
        $this->game->stArchitectTurn();
      }
      $this->refillIfNeeded($activePId);
    } else {
      // Move to next player
      $this->game->activeNextPlayer();
    }

    if ($nextPId != 0) {
      if (method_exists($this->game, 'giveExtraTime')) {
        $this->game->giveExtraTime($nextPId);
      }
    }

    return Globals::isEndOfGame() ? 'end' : 'placeTile';
  }

  /**
   * Refill the dock if needed and trigger detect end of game
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
