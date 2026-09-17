<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Akropolis\Game;

/**
 * NextPlayerPantheon State
 * Game state to handle transition between players in Pantheon mode
 */
class NextPlayerPantheon extends GameState
{
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
            ],
            updateGameProgression: true,
        );
    }

    public function getArgs(): array
    {
        return [];
    }

    /**
     * Handle transition to next player in Pantheon mode
     */
    public function onEnteringState(): string
    {
        // Move to next player
        $this->game->activeNextPlayer();

        // Check end of game condition
        if (PantheonManager::isGameEnd()) {
            return 'end';
        } else {
            return 'placeTile';
        }
    }
}
