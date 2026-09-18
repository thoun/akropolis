<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States;

use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Core\Stats;
use Bga\Games\Akropolis\Managers\ConstructionCards;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\Tiles;
use Bga\Games\Akropolis\Helpers\Utils;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;

/**
 * PlaceTile State
 * Player must place a tile in their city
 */
class PlaceTile extends GameState
{
  /**
   * PlaceTile constructor
   * @param Game $game Game instance
   */
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_PLACE_TILE,
      type: StateType::ACTIVE_PLAYER,
      name: 'placeTile',
      description: clienttranslate('${actplayer} must place a tile in their city'),
      descriptionMyTurn: clienttranslate('${you} must play a tile in your city'),
      transitions: [
        'completeCard' => ST_COMPLETE_CARD,
        'next' => ST_NEXT_PLAYER,
      ],
    );
  }

  /**
   * Get arguments for the state
   * @param int $activePlayerId Active player ID
   * @return array{options: array, tileIds: array} State arguments
   */
  public function getArgs(int $activePlayerId): array
  {
    $player = Players::getActive();
    $options = [];
    $geometry = TILE_GEOMETRIES[3];

    for ($hex = 0; $hex < 3; $hex++) {
      $options[$hex] = $player->board()->getPlacementOptions($hex, $geometry);
    }

    $tiles = Tiles::getInLocation('dock')->filter(function ($tile) use ($player) {
      return $tile['state'] <= $player->getMoney();
    });

    return [
      'options' => $options,
      'tileIds' => $tiles->getIds(),
    ];
  }

  #[PossibleAction]
  public function actPlaceTile(int $tileId, int $hex, int $x, int $y, int $z, int $r, int $activePlayerId): string
  {
    $pos = ['x' => $x, 'y' => $y, 'z' => $z];
    $player = Players::getActive();

    // Sanity check
    $args = $this->getArgs($activePlayerId);

    // Check tile
    if (!in_array($tileId, $args['tileIds'])) {
      throw new \BgaVisibleSystemException('Cannot place this tile. Should not happen');
    }

    $tile = Tiles::getSingle($tileId);

    // Check position : always go back to top left hex on tile
    $geometry = $player->board()->getTileGeometry($tile);
    $realPos = $player->board()->getCorrespondingPos($geometry, $pos, $r, $hex);

    $optionId = Utils::search($args['options'][0], function ($option) use ($realPos) {
      return Utils::compareZones($option, $realPos) == 0;
    });

    if ($optionId === false) {
      throw new \BgaVisibleSystemException('Impossible hex. Should not happen');
    }

    // Check rotation
    $option = $args['options'][0][$optionId];
    if (!in_array($r, $option['r'])) {
      throw new \BgaVisibleSystemException('Impossible rotation. Should not happen');
    }

    // Place the tile
    Tiles::placeTile($player, $tileId, $hex, $pos, $r);

    // Check if player can complete a card
    if ($this->canGoToCompleteCard($player)) {
      return 'completeCard';
    }

    return 'next';
  }

  /**
   * Check if we should transition to complete card state
   * @param object $player Player to check
   * @return bool True if player can complete a card
   */
  private function canGoToCompleteCard(object $player): bool
  {
    // Are we playing with Athena expansion ??
    if (!Globals::isAthena()) {
      return false;
    }

    // Get corresponding completed cards for that player
    $statuses = Globals::getAthenaCardStatuses()[$player->getId()] ?? [];

    // Go through each card in play
    foreach (ConstructionCards::getAll() as $cardId => $card) {
      // Already fulfilled ?
      if (in_array($cardId, $statuses)) {
        continue;
      }

      // Can be fulfilled ?
      if ($card->isSatisfied($player)) {
        return true;
      }
    }

    return false;
  }

  /**
   * This should be called from CompleteCard state, not here
   * @return string Next transition ('completeCard' or 'next')
   */
  public function goToNextPlayerUnlessCompletableCard(): string
  {
    $player = Players::getActive();
    $canComplete = $this->canGoToCompleteCard($player);
    $transition = $canComplete ? 'completeCard' : 'next';
    return $transition;
  }

  /**
   * Zombie player handling - just skip their turn
   * @param int $playerId Zombie player ID
   * @return string Next transition
   */
  public function zombie(int $playerId): string
  {
    // For zombie players, just skip their turn
    return 'next';
  }
}
