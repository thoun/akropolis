<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class Uprising extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Uprising';
    $this->name = clienttranslate('Uprising');
    $this->description = clienttranslate('Have 4 <BARRACK> along the edge');
    $this->color = BARRACK;
  }

  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    $n = 0;
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is Barrack  ?
        if ($type != BARRACK) continue;
        // Is on the edge ?
        if (!$board->isOnTheEdge($cell, $triangles)) continue;

        $n++;
        if ($n >= 4) return true;
      }
    }

    return false;
  }
}
