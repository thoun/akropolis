<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\GameFramework\StateType;
use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Core\Globals;

/**
 * ChooseActionPantheon State
 * Player can choose from available Pantheon actions after placing a tile
 * This prevents automatically skipping to the next player's turn
 */
class ChooseActionPantheon extends PantheonGameState
{
  /**
   * ChooseActionPantheon constructor
   * @param Game $game Game instance
   */
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_PANTHEON_CHOOSE_ACTION,
      type: StateType::ACTIVE_PLAYER,
      name: 'chooseActionPantheon',
      description: clienttranslate('${actplayer} can take an action or end their turn'),
      descriptionMyTurn: clienttranslate('${you} can take an action or end your turn'),
      transitions: [
        'placeTile' => ST_PLACE_TILE_PANTHEON,
        'next' => ST_NEXT_PLAYER_PANTHEON,
        'end' => ST_PRE_END_OF_GAME,
      ],
    );
  }

  public function onEnteringState(): void {}

  /**
   * Get arguments for the state
   * @param int $activePlayerId Active player ID
   * @return array State arguments
   */
  public function getArgs(int $activePlayerId): array
  {
    return [
      'commonArgs' => $this->getPantheonArgs($activePlayerId),
    ];
  }

  /**
   * Zombie player handling - just skip
   * @param int $playerId Zombie player ID
   * @return string Next transition
   */
  public function zombie(int $playerId): string
  {
    return 'next';
  }
}
