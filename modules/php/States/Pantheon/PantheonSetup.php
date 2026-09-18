<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\Tiles;
use Bga\Games\Akropolis\Managers\PantheonManager;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Akropolis\Game;

/**
 * Pantheon Setup State
 * Distribute starting tiles to players
 */
class PantheonSetup extends GameState
{
  /**
   * PantheonSetup constructor
   * @param Game $game Game instance
   */
  function __construct(protected Game $game)
  {
      parent::__construct(
          $game,
          id: ST_PANTHEON_SETUP,
          type: StateType::MULTIPLE_ACTIVE_PLAYER,
          name: 'pantheonSetup',
          description: clienttranslate('Setup: Distribute starting tiles'),
          transitions: [
              'next' => ST_PLACE_TILE_PANTHEON,
          ],
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
   * Setup for Pantheon: make all players active for simultaneous setup
   * @return string Empty string
   */
  public function onEnteringState(): string
  {
      $this->gamestate->setAllPlayersMultiactive();

      // If all players have placed their starting tiles, move to next state
      // This is handled by the action method
      return '';
  }

  /**
   * Action to place starting tile in capital
   * @param int $tileId Tile ID
   * @param int $playerId Player ID
   * @return string Next transition or empty string
   */
  #[PossibleAction]
  public function actPlaceStartingTileInCapital(int $tileId, int $playerId): string
  {
      $player = Players::getById($playerId);

      // For now, just mark that this player has placed their tile
      // The actual logic will be implemented based on your game's requirements

      // Mark this player as having placed their starting tile
      if (method_exists('Bga\\Games\\Akropolis\\Managers\\PantheonManager', 'markStartingTilePlaced')) {
          PantheonManager::markStartingTilePlaced($playerId);
      }

      // Check if all players have placed their starting tiles
      if (
          method_exists('Bga\\Games\\Akropolis\\Managers\\PantheonManager', 'allStartingTilesPlaced') &&
          PantheonManager::allStartingTilesPlaced()
      ) {
          // All starting tiles placed, move to next state
          return 'next';
      }

      // Not all players done yet, stay in this state
      return '';
  }

  /**
   * Zombie player handling - mark as done
   * @param int $playerId Zombie player ID
   * @return string Next transition or empty string
   */
  public function zombie(int $playerId): string
  {
      // For zombie players in Pantheon setup, just mark them as done
      if (method_exists('Bga\\Games\\Akropolis\\Managers\\PantheonManager', 'markStartingTilePlaced')) {
          PantheonManager::markStartingTilePlaced($playerId);
      }

      // Check if all players have placed their starting tiles
      if (
          method_exists('Bga\\Games\\Akropolis\\Managers\\PantheonManager', 'allStartingTilesPlaced') &&
          PantheonManager::allStartingTilesPlaced()
      ) {
          return 'next';
      }

      return '';
  }
}
