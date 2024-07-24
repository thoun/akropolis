<?php

namespace AKR\ConstructionCards;

use AKR\Models\Player;

class Pantheon extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Pantheon';
    $this->name = clienttranslate('Pantheon');
    $this->desc = clienttranslate('Exact layout of 3 <PLAZA> around a central <TEMPLE>');
  }

  public function checkTriangleAroundHex($board, $cell)
  {
    $neighbours = $board->getNeighbours($cell);
    $previousConnection = null;
    foreach ($neighbours as $dir => $pos) {
      $hasConnectedPlaza = false;
      foreach ($board->getTypesAtPos($pos) as $type => $triangles) {
        if (in_array($type, PLAZAS) && $board->areCellsTrianglesAdjacent($cell, [$dir], $pos, $triangles)) {
          $hasConnectedPlaza = true;
        }
      }

      // Non alternating pattern => false
      if ($previousConnection === $hasConnectedPlaza) {
        return false;
      } else {
        $previousConnection = $hasConnectedPlaza;
      }
    }

    return true;
  }

  // Testée
  public function isSatisfied(Player $player)
  {
    $board = $player->board();

    foreach ($board->getBuiltCells() as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != TEMPLE) continue;

        if ($this->checkTriangleAroundHex($board, $cell)) {
          return true;
        }
      }
    }

    return false;
  }
}
