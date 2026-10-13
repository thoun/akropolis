<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\GameFramework\StateType;
use Bga\Games\Akropolis\States\PreEndOfGame;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;
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
        'placeTile' => ST_PLACE_TILE_PANTHEON,
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
   * @return string Next state class
   */
  public function onEnteringState(): string
  {
    $player = Players::getActive();
    $missingTiles = 3 - Tiles::getPlayerHand($player->getId())->count();
    if ($missingTiles > 0 && Tiles::countInLocation('deck') > 0) {
      Tiles::drawToHand($player->getId(), $missingTiles);
      Notifications::refillHand($player, Tiles::getPlayerHand($player->getId())->toArray());
    }

    Globals::setPantheonTilePlaced(false);

    // Visit each player at most once, ignoring empty hands.
    foreach (Players::getAll() as $_player) {
      $this->game->activeNextPlayer();
      $player = Players::getActive();
      if (!Tiles::getPlayerHand($player->getId())->empty()) {
        return PlaceTilePantheon::class;
      }
    }

    return PreEndOfGame::class;
  }
}
