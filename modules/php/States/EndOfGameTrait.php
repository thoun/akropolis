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
        $player->setScore($score);
      }
      $player->setScoreAux($player->getMoney());
    }

    // IF solo : score of 1 if bigger than architect, otherwise 0
    if (Globals::isSolo()) {
      $architect = Players::getArchitect();
      $scores = $architect->board()->getScores();
      Notifications::updateScores($architect, $scores);
      $scoreArchitect = $scores['score'];

      if ($scoreArchitect < $score) {
        $win = true;
      } elseif ($scoreArchitect == $score) {
        $win = $player->getMoney() > $architect->getMoney();
      } else {
        $win = false;
      }
      $player->setScore($win ? 1 : 0);
    }

    $this->gamestate->nextState('');
  }
}
