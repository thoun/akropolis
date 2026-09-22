<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\VisibleSystemException;
use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;

/**
 * AskMoneyPantheon State
 * Multiactive state where players can send money to the requesting player
 */
class AskMoneyPantheon extends GameState
{
  /**
   * AskMoneyPantheon constructor
   * @param Game $game Game instance
   */
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_ASK_MONEY_PANTHEON,
      type: StateType::MULTIPLE_ACTIVE_PLAYER,
      name: 'askMoneyPantheon',
      description: clienttranslate('Other players can send money to ${player_name}'),
      descriptionMyTurn: clienttranslate('You can send money to ${player_name}'),
      transitions: [
        'continue' => ST_ASK_MONEY_PANTHEON,
        'chooseActionPantheon' => ST_PANTHEON_CHOOSE_ACTION,
        'placeTilePantheon' => ST_PLACE_TILE_PANTHEON,
        'next' => ST_NEXT_PLAYER_PANTHEON,
      ],
    );
  }

  /**
   * Set up the state with active players
   */
  public function onEnteringState(): void
  {
    // Get the money request data
    $moneyRequest = Globals::getPantheonMoneyRequest();
    $requesterId = $moneyRequest['requester'] ?? 0;

    // Make all players except the requester active
    $players = Players::getAll();
    $activePlayerIds = [];

    foreach ($players as $pId => $player) {
      if ($pId != $requesterId && !$player->isZombie()) {
        $activePlayerIds[] = $pId;
      }
    }

    if (!empty($activePlayerIds)) {
      $this->game->gamestate->setPlayersMultiactive($activePlayerIds, 'next');
    }
  }

  /**
   * Get arguments for the state for all players
   * @return array State arguments indexed by player ID
   */
  public function getArgs(): array
  {
    $moneyRequest = Globals::getPantheonMoneyRequest();
    $requesterId = $moneyRequest['requester'] ?? 0;
    $requester = Players::get($requesterId);
    $amount = $moneyRequest['amount'] ?? 0;
    $responses = $moneyRequest['responses'] ?? [];

    // Get total already pledged
    $totalPledged = array_sum($responses);

    // Compute args for each player
    $args = [
      'player_name' => $requester->getName(),
      'requesterId' => $requesterId,
      'requesterName' => $requester ? $requester->getName() : '',
      'requestedAmount' => $amount,
      'remainingAmount' => max(0, $amount - $totalPledged),
      'responses' => $responses,
      'totalPledged' => $totalPledged,
    ];

    foreach (Players::getAll() as $player) {
      $playerId = $player->getId();
      $playerMoney = $player->getMoney();
      $maxSend = $playerMoney > 0 ? (int) floor($playerMoney / 2) : 0;

      $args[$playerId] = [
        'maxSend' => $maxSend,
        'canRespond' => !isset($responses[$playerId]),
      ];
    }

    return $args;
  }

  /**
   * Send money to the requesting player
   * @param int $amount Amount to send
   * @param int $activePlayerId Active player ID
   * @return string Next transition
   */
  #[PossibleAction]
  public function actSendMoney(int $amount, int $activePlayerId): string
  {
    $player = Players::get($activePlayerId);

    if ($amount <= 0) {
      throw new VisibleSystemException('Amount must be positive');
    }

    // Get current money request
    $moneyRequest = Globals::getPantheonMoneyRequest();
    $responses = $moneyRequest['responses'] ?? [];

    // Check if player already responded
    if (isset($responses[$activePlayerId])) {
      throw new VisibleSystemException('You have already responded');
    }

    // Check if player has enough money
    // For each stone sent, they need to pay 1 to requester + 1 to bank
    $totalCost = $amount * 2;
    if ($player->getMoney() < $totalCost) {
      throw new VisibleSystemException('Not enough stones');
    }

    // Store the response
    $responses[$activePlayerId] = $amount;
    $moneyRequest['responses'] = $responses;
    Globals::setPantheonMoneyRequest($moneyRequest);

    Notifications::sendMoneyResponse($player, $amount);

    $this->game->gamestate->setPlayerNonMultiactive($activePlayerId, '');

    return $this->checkResolution();
  }

  /**
   * Skip sending money
   * @param int $activePlayerId Active player ID
   * @return string Next transition
   */
  #[PossibleAction]
  public function actSkipSendMoney(int $activePlayerId): string
  {
    $player = Players::get($activePlayerId);

    // Get current money request
    $moneyRequest = Globals::getPantheonMoneyRequest();
    $responses = $moneyRequest['responses'] ?? [];

    // Check if player already responded
    if (isset($responses[$activePlayerId])) {
      throw new \BgaVisibleSystemException('You have already responded');
    }

    // Store the response (0 = skip)
    $responses[$activePlayerId] = 0;
    $moneyRequest['responses'] = $responses;
    Globals::setPantheonMoneyRequest($moneyRequest);

    Notifications::skipSendMoney($player);

    $transition = $this->checkResolution();
    $this->game->gamestate->setPlayerNonMultiactive($activePlayerId, $transition);
    return $transition;
  }

  /**
   * Check if the money request should be resolved
   * @return string Next transition
   */
  private function checkResolution(): string
  {
    $moneyRequest = Globals::getPantheonMoneyRequest();
    $requesterId = $moneyRequest['requester'] ?? 0;
    $amount = $moneyRequest['amount'] ?? 0;
    $responses = $moneyRequest['responses'] ?? [];
    $previousState = $moneyRequest['previousState'] ?? 0;

    // Get all non-zombie players except the requester
    $allPlayers = Players::getAll();
    $expectedResponders = [];
    foreach ($allPlayers as $player) {
      if ($player->getId() != $requesterId && !$player->isZombie()) {
        $expectedResponders[] = $player->getId();
      }
    }

    // Check if everyone has responded
    $allResponded = count($responses) === count($expectedResponders);

    // Check if requested amount is met
    $totalPledged = array_sum($responses);
    $amountMet = $totalPledged >= $amount;

    // Resolve if everyone responded or amount is met
    if ($allResponded || $amountMet) {
      return $this->resolveMoneyRequest($previousState);
    }

    // Otherwise continue waiting for responses
    return 'continue';
  }

  /**
   * Resolve the money request
   * @param string $previousState State to return to
   * @return string Next transition
   */
  private function resolveMoneyRequest(string $previousState): string
  {
    $moneyRequest = Globals::getPantheonMoneyRequest();
    $requesterId = $moneyRequest['requester'] ?? 0;
    $requester = Players::get($requesterId);
    $amount = $moneyRequest['amount'] ?? 0;
    $responses = $moneyRequest['responses'] ?? [];

    $totalPledged = array_sum($responses);

    if ($totalPledged >= $amount) {
      // Transfer money: each player sends their pledged amount to requester
      // and pays the same amount to the bank
      foreach ($responses as $playerId => $sendAmount) {
        if ($sendAmount > 0) {
          $player = Players::get($playerId);

          // Player pays 2 * sendAmount (1 to requester, 1 to bank)
          $totalCost = $sendAmount * 2;
          $player->incMoney(-$totalCost);

          // Requester receives sendAmount
          $requester->incMoney($sendAmount);

          Notifications::moneyTransferred($player, $requester, $sendAmount, $totalCost);
        }
      }

      Notifications::moneyRequestSucceeded($requester, $totalPledged);
    } else {
      // Not enough pledged, no money is transferred
      Notifications::moneyRequestFailed($requester, $totalPledged);
    }

    // Clean up globals
    Globals::setPantheonMoneyRequest([]);

    // Set the transition to return to previous state
    return $previousState;
  }


  /**
   * Zombie player handling
   * @param int $playerId Zombie player ID
   * @return string Next transition
   */
  public function zombie(int $playerId): string
  {
    // Auto-skip for zombie players
    $moneyRequest = Globals::getPantheonMoneyRequest();
    $responses = $moneyRequest['responses'] ?? [];
    if (!isset($responses[$playerId])) {
      $responses[$playerId] = 0;
      $moneyRequest['responses'] = $responses;
      Globals::setPantheonMoneyRequest($moneyRequest);
    }

    return $this->checkResolution();
  }
}
