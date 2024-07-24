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

  public function isSatisfied(\AKR\Models\Player $player)
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    $storehouses = 0;
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is market  ?
        if ($type != MARKET) continue;

        // Is surrounded by built neighbours ?
        $neighbours = $board->getBuiltNeighbours($cell);
        if (count($neighbours) < 6) continue;

        $storehouses++;
      }
    }
    // TODO : not sure about "separate"

    return $storehouses >= 2;
  }
}
