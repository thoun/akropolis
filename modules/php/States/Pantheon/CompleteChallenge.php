<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\Altars;
use Bga\Games\Akropolis\Managers\PantheonChallenges;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Akropolis\Game;

/**
 * CompleteChallenge State
 * Player can complete architectural challenges
 */
class CompleteChallenge extends GameState
{
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_COMPLETE_CHALLENGE,
      type: StateType::ACTIVE_PLAYER,
      name: 'completeChallenge',
      description: clienttranslate('${actplayer} can complete architectural challenges'),
      descriptionMyTurn: clienttranslate('${you} can complete architectural challenges'),
      transitions: [
        'next' => ST_NEXT_PLAYER_PANTHEON,
        'complete' => ST_COMPLETE_CHALLENGE,
      ],
    );
  }

  public function getArgs(int $activePlayerId): array
  {
    $player = Players::getActive();

    // Get available challenges
    $challenges = PantheonChallenges::getRevealed();

    // Check which challenges the player can complete
    $completableChallenges = [];
    foreach ($challenges as $challenge) {
      if ($challenge->isSatisfied($player)) {
        $completableChallenges[$challenge->getId()] = $challenge->getUiData();
      }
    }

    return [
      'completableChallenges' => $completableChallenges,
      'allChallenges' => PantheonChallenges::getUiData(),
      'unlockedSlots' => Globals::getUnlockedChallengeSlots(),
      'money' => $player->getMoney(),
    ];
  }

  #[PossibleAction]
  public function actCompleteChallenge(string $challengeId, int $activePlayerId): string
  {
    $player = Players::getActive();

    // Get the challenge
    $challenge = PantheonChallenges::getById($challengeId);
    if (!$challenge || $challenge->getLocation() !== 'revealed') {
      throw new \BgaVisibleSystemException('Challenge not available');
    }

    // Validate player can complete this challenge
    if (!$challenge->isSatisfied($player)) {
      throw new \BgaVisibleSystemException('Challenge requirements not met');
    }

    $color = $challenge->getColor();

    // Place Divine Altar on Capital
    $placed = Altars::placeOnCapital($color, $player);

    if (!$placed) {
      throw new \BgaVisibleSystemException('No available plaza of that color in Capital');
    }

    // Complete the challenge
    PantheonChallenges::completeChallenge($challengeId);

    // Draw new challenge for the slot
    PantheonChallenges::drawChallenge();

    Notifications::completeChallenge($player, $challengeId, $color);

    // Check if player can complete more challenges
    $completable = PantheonChallenges::getCompletableChallenges($player);
    if (!empty($completable)) {
      // Stay in complete state to allow multiple completions
      return 'complete';
    } else {
      return 'next';
    }
  }

  #[PossibleAction]
  public function actSkipCompleteChallenge(int $activePlayerId): string
  {
    $this->checkAction('actSkipCompleteChallenge');
    return 'next';
  }

  #[PossibleAction]
  public function actDiscardChallenge(string $challengeId, int $activePlayerId): string
  {
    $this->checkAction('actDiscardChallenge');
    $player = Players::getActive();

    // Check player has enough money (stones)
    if ($player->getMoney() < 1) {
      throw new \BgaVisibleSystemException('Not enough stones to discard challenge');
    }

    // Discard challenge and draw new one
    PantheonChallenges::discardChallenge($challengeId);

    // Pay 1 money (stone)
    $player->incMoney(-1);
    Notifications::discardChallenge($player, $challengeId);

    return 'complete';
  }

  #[PossibleAction]
  public function actUnlockChallengeSlot(int $activePlayerId): string
  {
    $this->checkAction('actUnlockChallengeSlot');
    $player = Players::getActive();

    // Check player has enough money (stones)
    if ($player->getMoney() < 5) {
      throw new \BgaVisibleSystemException('Not enough stones to unlock challenge slot');
    }

    // Unlock additional slot
    $newSlots = Globals::getUnlockedChallengeSlots() + 1;
    Globals::setUnlockedChallengeSlots($newSlots);

    // Pay 5 money (stones)
    $player->incMoney(-5);
    Notifications::unlockChallengeSlot($player, $newSlots);

    // Draw new challenge for the new slot
    PantheonChallenges::drawChallenge();

    return 'complete';
  }

  public function zombie(int $playerId): string
  {
    // Simple zombie: just skip
    return 'next';
  }
}
