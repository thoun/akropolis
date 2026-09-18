<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class Parkland extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Parkland';
    $this->name = clienttranslate('Parkland');
    $this->desc = clienttranslate('1 <GARDEN> adjacent to 1 <GARDEN_PLAZA>');
  }

  // Testée
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is garden plaza ?
        if ($type != GARDEN_PLAZA) continue;

        $neighbours = $board->getBuiltNeighbours($cell);
        foreach ($neighbours as $cell2) {
          foreach ($board->getTypesAtPos($cell2) as $type2 => $triangles2) {
            if ($type2 != GARDEN) continue;
            if (!$board->areCellsTrianglesAdjacent($cell, $triangles, $cell2, $triangles2)) continue;

            return true;
          }
        }
      }
    }

    return false;
  }
}
