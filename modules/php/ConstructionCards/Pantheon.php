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

    $connectedPlazas = [];
    foreach ($neighbours as $dir => $pos) {
      $hasConnectedPlaza = false;
      foreach ($board->getTypesAtPos($pos) as $type => $triangles) {
        if (in_array($type, PLAZAS) && $board->areCellsTrianglesAdjacent($cell, [$dir], $pos, $triangles)) {
          $hasConnectedPlaza = true;
        }
      }
      $connectedPlazas[] = $hasConnectedPlaza;
    }

    for ($i = 0; $i < 6; $i++) {
      if ($connectedPlazas[$i] && $connectedPlazas[($i + 2) % 6] && $connectedPlazas[($i + 4) % 6]) {
        return true;
      }
    }

    return false;
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
