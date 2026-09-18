<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class LuxuryGoods extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'LuxuryGoods';
    $this->name = clienttranslate('Luxury Goods');
    $this->desc = clienttranslate('1 <MARKET_PLAZA> on 3rd level or above');
  }

  // Testée
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is market plaza  ?
        if ($type != MARKET_PLAZA) continue;

        // Is on 3rd floor ?
        if ($cell['z'] >= 2) {
          return true;
        }
      }
    }

    return false;
  }
}
