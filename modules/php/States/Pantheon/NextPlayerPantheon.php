<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\Tiles;

/**
 * NextPlayerPantheon State
 * Game state to handle transition between players in Pantheon mode
 */
class NextPlayerPantheon extends PantheonGameState
{
  /**
   * NextPlayerPantheon constructor
   * @param Game $game Game instance
   */
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_NEXT_PLAYER_PANTHEON,
      type: StateType::GAME,
      name: 'nextPlayerPantheon',
      description: '',
      transitions: [
        'chooseAction' => ST_PANTHEON_CHOOSE_ACTION,
        'end' => ST_PRE_END_OF_GAME,
        'nextPlayer' => ST_NEXT_PLAYER_PANTHEON,
      ],
      updateGameProgression: true,
    );
  }

  /**
   * Get arguments for the state (empty for this state)
   * @return array Empty array
   */
  public function getArgs(): array
  {
    return [];
  }

  /**
   * Handle transition to next player in Pantheon mode
   * @return string Next transition ('chooseAction', 'end', or 'nextPlayer')
   */
  public function onEnteringState(): string
  {
    // Move to next player
    $this->game->activeNextPlayer();

    // Reset tile placed flag for new turn
    Globals::setPantheonTilePlaced(false);

    $currentPlayer = Players::get();
    $currentHand = Tiles::getPlayerHand($currentPlayer->getId());

    if ($currentHand->empty()) {
      // Check if all non-zombie players have empty hands
      $allHandsEmpty = true;
      foreach (Players::getAll() as $player) {
        if ($player->isZombie()) {
          continue;
        }
        $hand = Tiles::getPlayerHand($player->getId());
        if (!$hand->empty()) {
          $allHandsEmpty = false;
          break;
        }
      }

      return $allHandsEmpty ? 'end' : 'nextPlayer';
    }

    return 'chooseAction';
  }
}
