<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\VisibleSystemException;
use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\PantheonChallenges;
use Bga\Games\Akropolis\Managers\Altars;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;

/**
 * PantheonGameState - Base class for Pantheon expansion states
 * Provides common actions and data available during any point in a player's turn:
 * - Complete a challenge
 * - Pay 1 stone to discard and draw a new challenge
 * - Pay 5 stones to create a new slot and draw a challenge into that slot
 */
abstract class PantheonGameState extends GameState
{
  protected function getStateName(): string
  {
    return $this->name;
  }


  /**
   * Get common Pantheon arguments for the state
   * @param int $activePlayerId Active player ID
   * @return array{completableChallenges: Collection, allChallenges: Collection, unlockedSlots: int, money: int, altarPositions: array} Pantheon state arguments
   */
  protected function getPantheonArgs(int $activePlayerId): array
  {
    $player = Players::get($activePlayerId);
    $completableChallenges = PantheonChallenges::getCompletableChallenges($player);
    $money = $player ? $player->getMoney() : 0;

    return [
      'completableChallenges' => $completableChallenges->toAssoc(),
      'canDiscardChallenge' => $money >= 1,
      'canUnlockSlot' => $money >= 5,
      'canAskForMoney' => Game::get()->getPlayerCount() > 1,
      'availableAltarPositions' => Altars::getAvailablePlazaPositions(),
    ];
  }

  /**
   * Complete a challenge action
   * @param string $challengeId Challenge ID
   * @param int $x X coordinate for altar placement in Capital
   * @param int $y Y coordinate for altar placement in Capital
   * @param int $z Z coordinate for altar placement in Capital
   * @return string Next transition
   */
  #[PossibleAction]
  public function actCompleteChallenge(string $challengeId, int $x, int $y, int $z): string
  {
    $player = Players::getActive();

    // Get the challenge
    $challenge = PantheonChallenges::get($challengeId);
    if (!$challenge || $challenge->getLocation() !== 'board') {
      throw new VisibleSystemException('Challenge not available');
    }

    // Validate player can complete this challenge
    if (!$challenge->isSatisfied($player)) {
      throw new VisibleSystemException('Challenge requirements not met');
    }

    // Place Divine Altar on Capital at specified position
    $color = $challenge->getColor();
    $altar = Altars::placeOnCapitalAtPosition($color, $player, $x, $y, $z);
    if (!$altar) {
      throw new VisibleSystemException('No available plaza of that color in Capital can be placed at that position');
    }

    // Complete challenge and draw a new one
    $challenge->setLocation('completed');
    $newChallenge = PantheonChallenges::drawChallenge();

    Notifications::completeChallenge($player, $challengeId, $color, $newChallenge, $x, $y, $z);

    return $this->getStateName();
  }

  /**
   * Discard a challenge action
   * @param string $challengeId Challenge ID
   * @return string Next transition
   */
  #[PossibleAction]
  public function actDiscardChallenge(string $challengeId): string
  {
    $player = Players::getActive();
    if ($player->getMoney() < 1) {
      throw new VisibleSystemException('Not enough stones to discard challenge');
    }

    // Discard the challenge and draw a new one
    $challenge = PantheonChallenges::get($challengeId);
    $challenge->setLocation('discarded');
    $newChallenge = PantheonChallenges::drawChallenge();
    $player->incMoney(-1);
    Notifications::discardChallenge($player, $challengeId, $newChallenge);

    return $this->getStateName();
  }

  /**
   * Unlock an additional challenge slot action
   * @return string Next transition
   */
  #[PossibleAction]
  public function actUnlockChallengeSlot(): string
  {
    $player = Players::getActive();
    if ($player->getMoney() < 5) {
      throw new VisibleSystemException('Not enough stones to unlock challenge slot');
    }

    // Unlock additional slot
    $player->incMoney(-5);
    $newSlots = Globals::getUnlockedChallengeSlots() + 1;
    Globals::setUnlockedChallengeSlots($newSlots);

    // Draw new challenge for the new slot
    $newChallenge = PantheonChallenges::drawChallenge();
    Notifications::unlockChallengeSlot($player, $newSlots, $newChallenge);

    return $this->getStateName();
  }

  /**
   * Ask other players for money action
   * @param int $amount Amount of stones requested
   * @return string Next transition
   */
  #[PossibleAction]
  public function actAskForMoney(int $amount): string
  {
    $player = Players::getActive();

    if ($amount <= 0) {
      throw new VisibleSystemException('Amount must be positive');
    }

    // Store the request
    Globals::setPantheonMoneyRequest([
      'amount' => $amount,
      'requester' => $player->getId(),
      'responses' => [],
      'previousState' => $this->getStateName(),
    ]);

    Notifications::askForMoney($player, $amount);

    // Transition to the multiactive state where other players can respond
    return AskMoneyPantheon::class;
  }
}
