<?php

namespace AKR\ConstructionCards;

class Storehouses extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Storehouses';
    $this->name = clienttranslate('Storehouses');
    $this->desc = clienttranslate('2 separate <MARKET> both completely surrounded by <DISTRICT> and/or <PLAZA>');
  }

  // Testée mais attente réponse (not sure about "separate")
  public function isSatisfied(\AKR\Models\Player $player)
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    $storehouses = [];
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is market  ?
        if ($type != MARKET) continue;

        // Is surrounded by built neighbours ?
        $neighbours = $board->getBuiltNeighbours($cell, $triangles);
        if (count($neighbours) < count($triangles)) continue;

        $storehouses[] = $cell;
      }
    }

    foreach ($storehouses as $cell1) {
      foreach ($storehouses as $cell2) {
        if ($board->getDistance($cell1, $cell2) >= 2) {
          return true;
        }
      }
    }

    return false;
  }
}
