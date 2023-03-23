<?php
namespace AKR\States;
use AKR\Core\Globals;
use AKR\Core\Notifications;
use AKR\Managers\Players;
use AKR\Managers\Tiles;
use AKR\Helpers\Utils;

trait EndOfGameTrait
{
  public function stPreEndOfGame()
  {
    Globals::setLiveScoring(true);
    foreach (Players::getAll() as $player) {
      $scores = $player->board()->getScores();
      $score = $scores['score'];
      Notifications::updateScores($player, $scores);

      if (!Globals::isSolo()) {
        $player->setScore($scores);
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
