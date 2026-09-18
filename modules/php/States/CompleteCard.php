<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States;

use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Managers\ConstructionCards;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\Tiles;
use Bga\Games\Akropolis\Helpers\Utils;
use Bga\Games\Akropolis\Helpers\Collection;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;

/**
 * CompleteCard State
 * Player may complete a fulfilled construction card (Athena expansion)
 */
class CompleteCard extends GameState
{
  /**
   * CompleteCard constructor
   * @param Game $game Game instance
   */
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_COMPLETE_CARD,
      type: StateType::ACTIVE_PLAYER,
      name: 'completeCard',
      description: clienttranslate('${actplayer} may complete a fulfilled construction card'),
      descriptionMyTurn: clienttranslate('${you} may complete a fulfilled construction card'),
      transitions: [
        'completeCard' => ST_COMPLETE_CARD,
        'next' => ST_NEXT_PLAYER,
      ],
    );
  }

  public function getArgs(int $activePlayerId): array
  {
    $player = Players::getActive();

    // Completable construction cards
    $cards = $this->getCompletableCards($player);

    // Placement options for single tiles
    $geometry = TILE_GEOMETRIES[1];
    $options = $player->board()->getPlacementOptions(0, $geometry);
    foreach ($options as &$option) {
      unset($option['r']); // Useless for single tile
    }

    $automaPicks = [];
    if (Globals::isSolo()) {
      foreach ($cards as $cardId => $card) {
        $tiles = Tiles::getInLocation($card->getLocation());
        $hierarchy = [];
        foreach ($tiles as $tileId => $tile) {
          $type = $tile['hexes'][0];
          $rank = 2;
          // DOUBLE TILE
          if (is_array($type)) {
            $rank = 1;
          }
          // PLAZA 
          else if (in_array($type, \PLAZAS)) {
            $rank = 0;
          }
          $hierarchy[$rank][] = $tileId;
        }

        $automaPicks[$cardId] = $hierarchy[0] ?? $hierarchy[1] ?? $hierarchy[2];
      }
    }

    return [
      'options' => $options,
      'cardIds' => $cards->getIds(),
      'automaPicks' => $automaPicks,
    ];
  }

  #[PossibleAction]
  public function actCompleteCard(
    string $cardId,
    int $tileId,
    array $pos,
    int $r,
    ?int $automaTileId = null,
    ?int $activePlayerId = null
  ): string {
    $player = Players::getActive();

    // Sanity check
    $args = $this->getArgs($activePlayerId ?? $player->getId());

    // Check card
    if (!in_array($cardId, $args['cardIds'])) {
      throw new \BgaVisibleSystemException('Cannot complete this card. Should not happen');
    }

    // Check tile
    $card = ConstructionCards::getSingle($cardId);
    $tileIds = Tiles::getInLocation($card->getLocation())->getIds();
    if (!in_array($tileId, $tileIds)) {
      throw new \BgaVisibleSystemException('Cannot place this tile. Should not happen');
    }

    $tile = Tiles::getSingle($tileId);

    $optionId = Utils::search($args['options'], function ($option) use ($pos) {
      return Utils::compareZones($option, $pos) == 0;
    });

    if ($optionId === false) {
      throw new \BgaVisibleSystemException('Impossible hex to place that tile. Should not happen');
    }

    // AUTOMA
    $statuses = Globals::getAthenaCardStatuses();

    if (Globals::isSolo()) {
      if (!in_array($automaTileId, $args['automaPicks'][$cardId])) {
        throw new \BgaVisibleSystemException(
          'Wrong tile given to automa. You must give him a plaza if possible, then a double-tile if possible, otherwise a single district tile'
        );
      }

      $architect = Players::getArchitect();
      $statuses[$architect->getId()][] = $cardId;
    }

    // Complete card
    $statuses[$player->getId()][] = $cardId;
    Globals::setAthenaCardStatuses($statuses);
    Notifications::completeCard($player, $card);

    if (Globals::isSolo()) {
      $architect = Players::getArchitect();
      Notifications::completeCard($architect, $card, true);
      $this->stArchitectPlaceSingleTile($automaTileId);
    }

    // Place tile
    Tiles::placeTile($player, $tileId, 0, $pos, $r, false);

    // Check if player can complete another card
    if ($this->canCompleteCard($player)) {
      return 'completeCard';
    }

    return 'next';
  }

  #[PossibleAction]
  public function actSkipCompleteCard(int $activePlayerId = null): string
  {
    return 'next';
  }

  /**
   * Get completable cards for a player
   * @param object $player Player to check
   * @return Collection<int, object> Collection of completable cards
   */
  private function getCompletableCards(object $player): Collection
  {
    $cards = new Collection();

    // Are we playing with Athena expansion ??
    if (!Globals::isAthena()) {
      return $cards;
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
        $cards[$cardId] = $card;
      }
    }

    return $cards;
  }

  /**
   * Check if player can complete any card
   * @param object $player Player to check
   * @return bool True if player can complete at least one card
   */
  private function canCompleteCard(object $player): bool
  {
    return $this->getCompletableCards($player)->count() > 0;
  }

  /**
   * Place a single tile for the architect in solo mode
   * @param int $tileId Tile ID to place
   */
  private function stArchitectPlaceSingleTile(int $tileId)
  {
    $geometry = TILE_GEOMETRIES[1];
    $architect = Players::getArchitect();
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

    Tiles::placeTile($architect, $tileId, 0, $minOption, $minOption['r'][0]);
  }

  /**
   * Zombie player handling - just skip
   * @param int $playerId Zombie player ID
   * @return string Next transition
   */
  public function zombie(int $playerId): string
  {
    // For zombie players, just skip
    return 'next';
  }
}
