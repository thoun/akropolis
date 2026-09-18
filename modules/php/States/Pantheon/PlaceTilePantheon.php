<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Core\Stats;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\Tiles;
use Bga\Games\Akropolis\Managers\PantheonChallenges;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Akropolis\Game;

/**
 * PlaceTilePantheon State
 * Player must place a tile in their city or in the Capital
 */
class PlaceTilePantheon extends GameState
{
  /**
   * PlaceTilePantheon constructor
   * @param Game $game Game instance
   */
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_PLACE_TILE_PANTHEON,
      type: StateType::ACTIVE_PLAYER,
      name: 'placeTilePantheon',
      description: clienttranslate('${actplayer} must place a tile in their city or in the Capital'),
      descriptionMyTurn: clienttranslate('${you} must play a tile in your city or in the Capital'),
      transitions: [
        'next' => ST_NEXT_PLAYER_PANTHEON,
        'complete' => ST_COMPLETE_CHALLENGE,
        'end' => ST_PRE_END_OF_GAME,
      ],
    );
  }

  /**
   * Get arguments for the state
   * @param int $activePlayerId Active player ID
   * @return array{cityOptions: array, capitalOptions: array, canSendToCapital: bool, tileIds: array, completableChallenges: Collection} State arguments
   */
  public function getArgs(int $activePlayerId): array
  {
    $player = Players::getActive();
    $capital = Players::getCapital();

    $geometry = \TILE_GEOMETRIES[3];
    $cityOptions = [];
    $capitalOptions = [];

    for ($hex = 0; $hex < 3; $hex++) {
      $cityOptions[$hex] = $player->board()->getPlacementOptions($hex, $geometry);
      $capitalOptions[$hex] = $capital->board()->getPlacementOptions($hex, $geometry);
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

  // #[PossibleAction]
  // public function actPlaceTileInCity(int $tileId, int $hex, array $pos, int $r, int $activePlayerId): string
  // {
  //   $player = Players::getActive();

  //   // Validate tile is in player's hand
  //   $hand = Tiles::getPlayerHand($player->getId());
  //   if (!isset($hand[$tileId])) {
  //     throw new \BgaVisibleSystemException('Tile not in hand');
  //   }

  //   // Use existing method to place tile in player's city
  //   // This calls the method from PlaceTile state via the game
  //   Tiles::placeTile($player, $tileId, $hex, $pos, $r);

  //   // Remove tile from hand
  //   Tiles::removeFromHand($player->getId(), $tileId);

  //   Notifications::placeInCity($player, Tiles::getSingle($tileId));

  //   // Check if any challenges are now completable
  //   $completable = PantheonChallenges::getCompletableChallenges($player);

  //   // Draw new tile to maintain hand of 3
  //   $this->refillPlayerHand($player);

  //   // Check end of game
  //   if (PantheonManager::isGameEnd()) {
  //     return 'end';
  //   } else {
  //     // If player can complete challenges, give them the option
  //     if (!empty($completable)) {
  //       return 'complete';
  //     } else {
  //       return 'next';
  //     }
  //   }
  // }

  // #[PossibleAction]
  // public function actPlaceTileInCapital(int $tileId, int $hex, array $pos, int $r, int $activePlayerId): string
  // {
  //   $this->checkAction('actPlaceTileInCapital');
  //   $player = Players::getActive();

  //   // Check player has enough money (stones)
  //   if ($player->getMoney() < 1) {
  //     throw new \BgaVisibleSystemException('Not enough stones to place in Capital');
  //   }

  //   // Validate tile is in player's hand
  //   $hand = PantheonManager::getPlayerHand($player->getId());
  //   if (!isset($hand[$tileId])) {
  //     throw new \BgaVisibleSystemException('Tile not in hand');
  //   }

  //   // Get tile data before removing from hand
  //   $tile = Tiles::getSingle($tileId);

  //   // Pay 1 money (stone)
  //   $player->incMoney(-1);
  //   Notifications::payStoneForCapital($player, 1);

  //   // Place tile in Capital
  //   $capital = PantheonManager::getCapital();
  //   $moneyGained = $capital->addTile($tileId, $pos, $r);

  //   // Add to Capital tracking in database
  //   PantheonManager::addToCapitalDB($tileId, $pos, $r);

  //   // Remove tile from hand
  //   PantheonManager::removeFromHand($player->getId(), $tileId);

  //   // Gain money if quarries covered
  //   if ($moneyGained > 0) {
  //     $player->incMoney($moneyGained);
  //     Notifications::gainStones($player, $moneyGained);
  //   }

  //   Notifications::placeInCapital($player, $tile);

  //   // Draw new tile to maintain hand of 3
  //   $this->refillPlayerHand($player);

  //   // Check end of game
  //   if (PantheonManager::isGameEnd()) {
  //     return 'end';
  //   } else {
  //     return 'next';
  //   }
  // }

  // #[PossibleAction]
  // public function actCompleteChallenge(string $challengeId, int $activePlayerId): string
  // {
  //   $this->checkAction('actCompleteChallenge');
  //   $player = Players::getActive();

  //   // This will be handled in the CompleteChallenge state
  //   // For now, transition to complete state
  //   return 'complete';
  // }

  // #[PossibleAction]
  // public function actDiscardChallenge(string $challengeId, int $activePlayerId): string
  // {
  //   $this->checkAction('actDiscardChallenge');
  //   $player = Players::getActive();

  //   // This will be handled in the CompleteChallenge state
  //   return 'complete';
  // }

  // #[PossibleAction]
  // public function actUnlockChallengeSlot(int $activePlayerId): string
  // {
  //   $this->checkAction('actUnlockChallengeSlot');
  //   $player = Players::getActive();

  //   // This will be handled in the CompleteChallenge state
  //   return 'complete';
  // }

  // /**
  //  * Refill player's hand to 3 tiles
  //  */
  // private function refillPlayerHand($player): void
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

  // /**
  //  * Fallback method for placing tile in city
  //  */
  // private function placeTileInCity($player, $tileId, $hex, $pos, $r): void
  // {
  //   $tile = Tiles::getSingle($tileId);
  //   $cost = $tile['state'];

  //   // Check position : always go back to top left hex on tile
  //   $geometry = $player->board()->getTileGeometry($tile);
  //   $pos = $player->board()->getCorrespondingPos($geometry, $pos, $r, $hex);

  //   // Pay money if needed
  //   if ($cost > 0) {
  //     $player->incMoney(-$cost);
  //     if ($player->getId() != \ARCHITECT_ID) {
  //       Stats::incMoneyUsed($player, $cost);
  //     }

  //     Notifications::payForTile($player, $cost);

  //     if (Globals::isSolo() && $player->getId() != \ARCHITECT_ID) {
  //       $architect = Players::getArchitect();
  //       $architect->incMoney($cost);
  //       Notifications::gainStones($architect, $cost, true);
  //     }
  //   }

  //   // Place tile
  //   $money = $player->board()->addTile($tileId, $pos, $r);
  //   $tile = Tiles::getSingle($tileId);
  //   Notifications::placeTile($player, $tile);

  //   // Register move as player's last move
  //   $lastMoves = Globals::getLastMoves();
  //   $lastMoves[$player->getId()] = $tile;
  //   Globals::setLastMoves($lastMoves);

  //   // Gain money if recovering quarries
  //   if ($money > 0) {
  //     $player->incMoney($money);
  //     Notifications::gainStones($player, $money);
  //   }

  //   // Update score if live scoring
  //   if (Globals::isLiveScoring()) {
  //     $scores = $player->board()->getScores();
  //     Notifications::updateScores($player, $scores);
  //   }
  // }

  public function zombie(int $playerId): string
  {
    // Simple zombie: just skip
    return 'next';
  }
}
