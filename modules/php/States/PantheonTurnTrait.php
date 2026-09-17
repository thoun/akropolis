<?php

namespace AKR\States;

use AKR\Core\Globals;
use AKR\Core\Notifications;
use AKR\Managers\Altars;
use AKR\Managers\Players;
use AKR\Managers\Tiles;
use AKR\Managers\PantheonManager;
use AKR\Managers\PantheonChallenges;

/**
 * Key differences from base game:
 * - Players have a hand of 3 tiles instead of drawing from dock
 * - Can place tiles in their own city OR in the Capital (costs 1 stone)
 * - Can complete challenges to place Divine Altars
 */

trait PantheonTurnTrait
{
  public function argsPlaceTilePantheon()
  {
    $player = Players::getActive();
    $capital = PantheonManager::getCapital();

    $geometry = TILE_GEOMETRIES[3];
    $cityOptions = [];
    $capitalOptions = [];
    for ($hex = 0; $hex < 3; $hex++) {
      $cityOptions[$hex] = $player->board()->getPlacementOptions($hex, $geometry);
      $capitalOptions[$hex] = $capital->getPlacementOptions($hex, $geometry);
    }

    // Available tiles from player's hand
    $hand = Tiles::getPlayerHand($player->getId());
    $tileIds = $hand->getIds();

    return [
      'cityOptions' => $cityOptions,
      'capitalOptions' => $capitalOptions,
      'canSendToCapital' => $player->getMoney() >= 1,
      'tileIds' => $tileIds,
      'completableChallenges' => PantheonChallenges::getCompletableChallenges($player),
    ];
  }

  /**
   * Action: Place a tile in the player's own city
   * 
   * @param int $tileId The tile ID to place
   * @param int $hex Hex index (0-2)
   * @param array $pos Position as ['x' => int, 'y' => int, 'z' => int]
   * @param int $r Rotation (0-5)
   */
  public function actPlaceTileInCity($tileId, $hex, $pos, $r)
  {
    $this->checkAction('actPlaceTileInCity');
    $player = Players::getActive();

    // Validate tile is in player's hand
    $hand = PantheonManager::getPlayerHand($player->getId());
    if (!isset($hand[$tileId])) {
      throw new \BgaVisibleSystemException('Tile not in hand');
    }

    // Use existing method to place tile in player's city
    $this->actPlaceTileAux($player, $tileId, $hex, $pos, $r);

    // Remove tile from hand
    PantheonManager::removeFromHand($player->getId(), $tileId);

    Notifications::placeInCity($player, Tiles::getSingle($tileId));

    // Check if any challenges are now completable
    $completable = PantheonChallenges::getCompletableChallenges($player);

    // Draw new tile to maintain hand of 3
    $this->refillPlayerHand($player);

    // Check end of game
    if (PantheonManager::isGameEnd()) {
      $this->gamestate->nextState('end');
    } else {
      // If player can complete challenges, give them the option
      if (!empty($completable)) {
        $this->gamestate->nextState('complete');
      } else {
        $this->gamestate->nextState('next');
      }
    }
  }

  /**
   * Action: Place a tile in the Capital (costs 1 stone)
   * 
   * @param int $tileId The tile ID to place
   * @param int $hex Hex index (0-2)
   * @param array $pos Position as ['x' => int, 'y' => int, 'z' => int]
   * @param int $r Rotation (0-5)
   */
  public function actPlaceTileInCapital($tileId, $hex, $pos, $r)
  {
    $this->checkAction('actPlaceTileInCapital');
    $player = Players::getActive();

    // Check player has enough money (stones)
    if ($player->getMoney() < 1) {
      throw new \BgaVisibleSystemException('Not enough stones to place in Capital');
    }

    // Validate tile is in player's hand
    $hand = PantheonManager::getPlayerHand($player->getId());
    if (!isset($hand[$tileId])) {
      throw new \BgaVisibleSystemException('Tile not in hand');
    }

    // Get tile data before removing from hand
    $tile = Tiles::getSingle($tileId);

    // Pay 1 money (stone)
    $player->incMoney(-1);
    Notifications::payStoneForCapital($player, 1);

    // Place tile in Capital
    $capital = PantheonManager::getCapital();
    $moneyGained = $capital->addTile($tileId, $pos, $r);

    // Add to Capital tracking in database
    PantheonManager::addToCapitalDB($tileId, $pos, $r);

    // Remove tile from hand
    PantheonManager::removeFromHand($player->getId(), $tileId);

    // Gain money if quarries covered
    if ($moneyGained > 0) {
      $player->incMoney($moneyGained);
      Notifications::gainStones($player, $moneyGained);
    }

    Notifications::placeInCapital($player, $tile);

    // Draw new tile to maintain hand of 3
    $this->refillPlayerHand($player);

    // Check end of game
    if (PantheonManager::isGameEnd()) {
      $this->gamestate->nextState('end');
    } else {
      $this->gamestate->nextState('next');
    }
  }

  // /**
  //  * Action: Complete an architectural challenge
  //  * 
  //  * @param string $challengeId The challenge ID to complete
  //  */
  // public function actCompleteChallenge($challengeId)
  // {
  //   $this->checkAction('actCompleteChallenge');
  //   $player = Players::getActive();

  //   // Get the challenge
  //   $challenge = PantheonChallenges::getById($challengeId);
  //   if (!$challenge || $challenge->getLocation() !== 'revealed') {
  //     throw new \BgaVisibleSystemException('Challenge not available');
  //   }

  //   // Validate player can complete this challenge
  //   if (!$challenge->isSatisfied($player)) {
  //     throw new \BgaVisibleSystemException('Challenge requirements not met');
  //   }

  //   $color = $challenge->getColor();

  //   // Place Divine Altar on Capital
  //   $placed = Altars::placeOnCapital($color, $player);

  //   if (!$placed) {
  //     throw new \BgaVisibleSystemException('No available plaza of that color in Capital');
  //   }

  //   // Complete the challenge
  //   PantheonChallenges::completeChallenge($challengeId);

  //   // Draw new challenge for the slot
  //   PantheonChallenges::drawChallenge();

  //   Notifications::completeChallenge($player, $challengeId, $color);

  //   // Check if player can complete more challenges
  //   $completable = PantheonChallenges::getCompletableChallenges($player);
  //   if (!empty($completable)) {
  //     // Stay in complete state to allow multiple completions
  //     $this->gamestate->nextState('complete');
  //   } else {
  //     $this->gamestate->nextState('next');
  //   }
  // }

  // /**
  //  * Action: Skip completing challenges (end turn)
  //  */
  // public function actSkipCompleteChallenge()
  // {
  //   $this->checkAction('actSkipCompleteChallenge');
  //   $this->gamestate->nextState('next');
  // }

  // /**
  //  * Action: Discard a challenge (costs 1 stone)
  //  * 
  //  * @param string $challengeId The challenge ID to discard
  //  */
  // public function actDiscardChallenge($challengeId)
  // {
  //   $this->checkAction('actDiscardChallenge');
  //   $player = Players::getActive();

  //   // Check player has enough money (stones)
  //   if ($player->getMoney() < 1) {
  //     throw new \BgaVisibleSystemException('Not enough stones to discard challenge');
  //   }

  //   // Discard challenge and draw new one
  //   PantheonChallenges::discardChallenge($challengeId);

  //   // Pay 1 money (stone)
  //   $player->incMoney(-1);
  //   Notifications::discardChallenge($player, $challengeId);

  //   $this->gamestate->nextState('complete');
  // }

  // /**
  //  * Action: Unlock an additional challenge slot (costs 5 stones)
  //  */
  // public function actUnlockChallengeSlot()
  // {
  //   $this->checkAction('actUnlockChallengeSlot');
  //   $player = Players::getActive();

  //   // Check player has enough money (stones)
  //   if ($player->getMoney() < 5) {
  //     throw new \BgaVisibleSystemException('Not enough stones to unlock challenge slot');
  //   }

  //   // Unlock additional slot
  //   $newSlots = Globals::getUnlockedChallengeSlots() + 1;
  //   Globals::setUnlockedChallengeSlots($newSlots);

  //   // Pay 5 money (stones)
  //   $player->incMoney(-5);
  //   Notifications::unlockChallengeSlot($player, $newSlots);

  //   // Draw new challenge for the new slot
  //   PantheonChallenges::drawChallenge();

  //   $this->gamestate->nextState('complete');
  // }

  // /**
  //  * Arguments for complete challenge state
  //  */
  // public function argsCompleteChallenge()
  // {
  //   $player = Players::getActive();

  //   // Get available challenges
  //   $challenges = PantheonChallenges::getRevealed();

  //   // Check which challenges the player can complete
  //   $completableChallenges = [];
  //   foreach ($challenges as $challenge) {
  //     if ($challenge->isSatisfied($player)) {
  //       $completableChallenges[$challenge->getId()] = $challenge->getUiData();
  //     }
  //   }

  //   return [
  //     'completableChallenges' => $completableChallenges,
  //     'allChallenges' => PantheonChallenges::getUiData(),
  //     'unlockedSlots' => Globals::getUnlockedChallengeSlots(),
  //     'money' => $player->getMoney(),
  //   ];
  // }

  // /**
  //  * Next player state for Pantheon
  //  */
  // public function stNextPlayerPantheon()
  // {
  //   // Move to next player
  //   $this->activeNextPlayer();

  //   // Check end of game condition
  //   if (PantheonManager::isGameEnd()) {
  //     $this->gamestate->nextState('end');
  //   } else {
  //     $this->gamestate->nextState('placeTile');
  //   }
  // }

  // /**
  //  * Refill player's hand to 3 tiles
  //  */
  // private function refillPlayerHand($player)
  // {
  //   $hand = PantheonManager::getPlayerHand($player->getId());
  //   while (count($hand) < 3) {
  //     $tile = PantheonManager::drawTileForPlayer($player->getId());
  //     if ($tile) {
  //       PantheonManager::addToHand($player->getId(), $tile['id']);
  //       $hand = PantheonManager::getPlayerHand($player->getId());
  //     } else {
  //       // No more tiles in deck
  //       break;
  //     }
  //   }
  // }
}
