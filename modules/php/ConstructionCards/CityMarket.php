<?php

namespace AKR\ConstructionCards;

use AKR\Models\Player;

class CityMarket extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'CityMarket';
    $this->name = clienttranslate('City Market');
    $this->desc = clienttranslate('Exact layout of 3 <MARKET> around a central <DISTRICT>');
  }

  public function checkTriangleAroundHex($board, $cell)
  {
    $neighbours = $board->getNeighbours($cell);
    $previousConnection = null;
    foreach ($neighbours as $dir => $pos) {
      $hasConnectedMarket = false;
      foreach ($board->getTypesAtPos($pos) as $type => $triangles) {
        if ($type == MARKET && $board->areCellsTrianglesAdjacent($cell, [$dir], $pos, $triangles)) {
          $hasConnectedMarket = true;
        }
      }

      // Non alternating pattern => false
      if ($previousConnection === $hasConnectedMarket) {
        return false;
      } else {
        $previousConnection = $hasConnectedMarket;
      }
    }

    return true;
  }

  // Testée mais question en suspens
  public function isSatisfied(Player $player)
  {
    $board = $player->board();
    $seen = [];
    // Check triangle around each cell adjacent to a market
    foreach ($board->getBuiltCells() as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != MARKET) continue;

        foreach ($board->getNeighbours($cell, false, $triangles) as $pos) {
          $id = $board->getCellId($pos);
          if (in_array($id, $seen)) continue;
          $seen[] = $id;
          if ($this->checkTriangleAroundHex($board, $pos)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
