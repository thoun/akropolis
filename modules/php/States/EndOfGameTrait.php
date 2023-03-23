<?php
namespace AKR\States;
use AKR\Core\Globals;
use AKR\Core\Notifications;
use AKR\Managers\Players;
use AKR\Managers\Tiles;
use AKR\Helpers\Utils;

trait EndOfGameTrait
{
  public function computeScore($scores)
  {
    $map = [
      BARRACK => \BARRACK_PLAZA,
      MARKET => \MARKET_PLAZA,
      TEMPLE => \TEMPLE_PLAZA,
      HOUSE => \HOUSE_PLAZA,
      GARDEN => \GARDEN_PLAZA,
      QUARRY => QUARRY,
    ];

    $score = 0;
    foreach ($scores['districts'] as $type => $size) {
      $score += $size * $scores['stars'][$map[$type]];
    }

    return $score;
  }

  public function stPreEndOfGame()
  {
    Globals::setLiveScoring(true);
    foreach (Players::getAll() as $player) {
      $scores = $player->board()->getScores();
      $score = $this->computeScore($scores);
      Notifications::updateScores($player, $scores);

      if (!Globals::isSolo()) {
        $player->setScore($score);
      }
    }

    // IF solo : score of 1 if bigger than architect, otherwise 0
    if (Globals::isSolo()) {
      $architect = Players::getArchitect();
      $scoreArchitect = $this->computeScore($architect->board()->getScores());
      $player->setScore($scoreArchitect < $score ? 1 : 0);
    }

    $this->gamestate->nextState('');
  }
}
