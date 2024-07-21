<?php

namespace AKR\ConstructionCards;

class LuxuryGoods extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'LuxuryGoods';
    $this->name = clienttranslate('Luxury Goods');
    $this->desc = clienttranslate('1 <MARKET_PLAZA> on 3rd level or above');
  }

  public function isSatisfied(\AKR\Models\Player $player)
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is market plaza  ?
        if ($type != MARKET_PLAZA) continue;

        // Is on 3rd floor ?
        if ($cell['z'] >= 3) {
          return true;
        }
      }
    }

    return false;
  }
}
