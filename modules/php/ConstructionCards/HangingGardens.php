<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class HangingGardens extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'HangingGardens';
    $this->name = clienttranslate('Hanging Gardens');
    $this->desc = clienttranslate('2 adjacent <GARDEN> on different levels');
  }

  // Testée
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        // Is garden ?
        if ($type != GARDEN) continue;

        $neighbours = $board->getBuiltNeighbours($cell);
        foreach ($neighbours as $cell2) {
          // Must be on different height
          if ($cell2['z'] == $cell['z']) continue;

          // Must contain a connected garden
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
