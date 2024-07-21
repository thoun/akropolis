<?php

namespace AKR\ConstructionCards;

class Villa extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Villa';
    $this->name = clienttranslate('Villa');
    $this->desc = clienttranslate('4 <HOUSE> on second level or above');
  }

  public function isSatisfied(\AKR\Models\Player $player)
  {
    $board = $player->board();
    $highHouses = 0;
    $cells = $board->getVisibleBuiltCells();
    foreach ($cells as $cell) {
      if ($cell['z'] < 2) continue;

      $types = array_keys($board->getTypesAtPos($cell));
      if (in_array(HOUSE, $types)) {
        $highHouses++;
      }
    }

    return $highHouses >= 4;
  }
}
