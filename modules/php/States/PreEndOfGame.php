<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States;

use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Managers\Players;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;

/**
 * PreEndOfGame State
 * Prepare for end of game - calculate final scores
 */
class PreEndOfGame extends GameState
{
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_PRE_END_OF_GAME,
      type: StateType::GAME,
      name: 'preEndOfGame',
      description: '',
      transitions: [
        '' => ST_END_GAME,
      ],
    );
  }

  public function getArgs(): array
  {
    return [];
  }

  /**
   * Calculate final scores for all players
   */
  public function onEnteringState(): string
  {
    Globals::setLiveScoring(true);

    foreach (Players::getAll() as $player) {
      $scores = $player->board()->getScores();
      $score = $scores['score'];
      Notifications::updateScores($player, $scores);

      if (!Globals::isSolo()) {
        $player->setScore($score);
      }
      $player->setScoreAux($player->getMoney());
    }

    // If solo: score of 1 if bigger than architect, otherwise 0
    if (Globals::isSolo()) {
      $architect = Players::getArchitect();
      $scores = $architect->board()->getScores();
      Notifications::updateScores($architect, $scores);
      $scoreArchitect = $scores['score'];

      foreach (Players::getAll() as $player) {
        $score = $player->board()->getScores()['score'];

        if ($scoreArchitect < $score) {
          $win = true;
        } elseif ($scoreArchitect == $score) {
          $win = $player->getMoney() > $architect->getMoney();
        } else {
          $win = false;
        }
        $player->setScore($win ? 1 : 0);
      }
    }

    // Transition to end game state
    return '';
  }
}
