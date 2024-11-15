<?php

namespace AKR\States;

use AKR\Core\Globals;
use AKR\Core\Notifications;
use AKR\Core\Stats;
use AKR\Managers\Players;
use AKR\Managers\Tiles;
use AKR\Helpers\Utils;
use AKR\Helpers\Collection;
use AKR\Managers\ConstructionCards;

trait CompleteCardTrait
{
  // Construction Card to complete ?
  public function goToNextPlayerUnlessCompletableCard()
  {
    $player = Players::getActive();
    $canComplete = $this->getCompletableCards($player)->count() > 0;
    $transition = $canComplete ? 'completeCard' : 'next';
    $this->gamestate->nextState($transition);
  }

  public function getCompletableCards($player)
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

  public function actSkipCompleteCard()
  {
    // Sanity check
    self::checkAction('actSkipCompleteCard');
    $this->gamestate->nextState('next');
  }

  public function argsCompleteCard()
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
          else if (in_array($type, PLAZAS)) {
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

  public function actCompleteCard(string $cardId, $tileId, $pos, $r)
  {
    $player = Players::getActive();
    // Sanity check
    self::checkAction('actCompleteCard');
    $args = $this->argsCompleteCard();
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

    // Complete card
    $statuses = Globals::getAthenaCardStatuses();
    $statuses[$player->getId()][] = $cardId;
    Globals::setAthenaCardStatuses($statuses);
    Notifications::completeCard($player, $card);

    // Place tile
    $this->actPlaceTileAux($player, $tileId, 0, $pos, $r);

    $this->goToNextPlayerUnlessCompletableCard();
  }
}
