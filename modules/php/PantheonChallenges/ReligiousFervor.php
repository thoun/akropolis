<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class ReligiousFervor extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'ReligiousFervor';
    $this->name = clienttranslate('Religious Fervor');
    $this->description = clienttranslate('Have 3 <TEMPLE> surrounded');
    $this->color = TEMPLE;
  }

  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    $n = 0;
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is temple  ?
        if ($type != TEMPLE) continue;

        // Is surrounded by built neighbours ?
        $neighbours = $board->getBuiltNeighbours($cell, $triangles);
        if (count($neighbours) < count($triangles)) continue;

        $n++;
        if ($n >= 3) return true;
      }
    }

    return false;
  }
}
