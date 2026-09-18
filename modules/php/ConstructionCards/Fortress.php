<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class Fortress extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Fortress';
    $this->name = clienttranslate('Fortress');
    $this->desc = clienttranslate('Exact layout of 1 <BARRACK_PLAZA> and 2 <BARRACK>');
  }

  // Testée mais question en suspens
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();

    foreach ($board->getBuiltCells() as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != BARRACK_PLAZA) continue;

        $neighbours = $board->getNeighbours($cell);
        $connectedBarracks = [];
        foreach ($neighbours as $dir => $pos) {
          $hasConnectedBarrack = false;
          foreach ($board->getTypesAtPos($pos) as $type => $triangles) {
            if ($type == BARRACK && $board->areCellsTrianglesAdjacent($cell, [$dir], $pos, $triangles)) {
              $hasConnectedBarrack = true;
            }
          }
          $connectedBarracks[] = $hasConnectedBarrack;
        }

        for ($i = 0; $i < 6; $i++) {
          if ($connectedBarracks[$i] && $connectedBarracks[($i + 2) % 6]) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
