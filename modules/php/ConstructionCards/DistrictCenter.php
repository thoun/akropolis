<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class DistrictCenter extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'DistrictCenter';
    $this->name = clienttranslate('District Center');
    $this->desc = clienttranslate('1 central <HOUSE_PLAZA> below its surrounding <DISTRICT> and/or <PLAZA>');
  }

  // Testée
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is house plaza ?
        if ($type != HOUSE_PLAZA) continue;

        // Is surrounded by built neighbours ?
        $neighbours = $board->getBuiltNeighbours($cell);
        if (count($neighbours) < 6) continue;

        // Is it below?
        $below = true;
        foreach ($neighbours as $cell2) {
          $below = $below && ($cell['z'] < $cell2['z']);
        }
        if ($below) {
          return true;
        }
      }
    }

    return false;
  }
}
