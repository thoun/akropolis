<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;
use Bga\Games\Akropolis\Models\TriangulatedBoard;

class Housing extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Housing';
    $this->name = clienttranslate('Housing');
    $this->desc = clienttranslate('Exact layout of 6 <HOUSE> around a central <DISTRICT>');
  }

  public function checkCircleAroundHex(TriangulatedBoard $board, array $cell): bool
  {
    $neighbours = $board->getBuiltNeighbours($cell);
    if (count($neighbours) < 6) return false;

    foreach ($neighbours as $dir => $pos) {
      $hasConnectedHouse = false;
      foreach ($board->getTypesAtPos($pos) as $type => $triangles) {
        if ($type == HOUSE && $board->areCellsTrianglesAdjacent($cell, [$dir], $pos, $triangles)) {
          $hasConnectedHouse = true;
        }
      }
      if (!$hasConnectedHouse) {
        return false;
      }
    }

    return true;
  }

  // Testée (sans dual tile): bool
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $seen = [];
    // Check circle around each cell adjacent to a house
    foreach ($board->getBuiltCells() as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != HOUSE) continue;

        foreach ($board->getNeighbours($cell, false, $triangles) as $pos) {
          if (!$board->isCellBuilt($pos)) continue;

          $id = $board->getCellId($pos);
          if (in_array($id, $seen)) continue;
          $seen[] = $id;
          if ($this->checkCircleAroundHex($board, $pos)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
