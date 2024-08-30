<?php

namespace AKR\ConstructionCards;

class Oasis extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Oasis';
    $this->name = clienttranslate('Oasis');
    $this->desc = clienttranslate('1 <GARDEN> completely surrounded by <DISTRICT> and/or <PLAZA>');
  }

  // Testée
  public function isSatisfied(\AKR\Models\Player $player)
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
