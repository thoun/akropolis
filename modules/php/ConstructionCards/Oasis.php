<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class Oasis extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Oasis';
    $this->name = clienttranslate('Oasis');
    $this->desc = clienttranslate('1 <GARDEN> completely surrounded by <DISTRICT> and/or <PLAZA>');
  }

  // Testée
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is market  ?
        if ($type != GARDEN) continue;

        // Is surrounded by built neighbours ?
        $neighbours = $board->getBuiltNeighbours($cell, $triangles);
        if (count($neighbours) < count($triangles)) continue;

        return true;
      }
    }

    return false;
  }
}
