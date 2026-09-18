<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class Sanctuary extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Sanctuary';
    $this->name = clienttranslate('Sanctuary');
    $this->desc = clienttranslate('Exact layout of 3 adjacent <TEMPLE>');
  }

  // Testée
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    // For each temple
    foreach ($board->getBuiltCells() as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != TEMPLE) continue;

        // For each direction
        foreach ($triangles as $dir) {
          $nextDir = ($dir + 2) % 6; // Next dir to check

          // Any built cell in that dir ?
          $neighbours = $board->getBuiltNeighbours($cell, [$dir]);
          if (empty($neighbours)) continue;
          $nextCell = $neighbours[0];

          // Any connected built temple in that dir ?
          foreach ($board->getTypesAtPos($nextCell) as $nextType => $nextTriangles) {
            if ($nextType != TEMPLE) continue;

            // Cell must be connected to previous cell 
            if (!in_array(($dir + 3) % 6, $nextTriangles)) continue;
            // And also must allow to keep going in direction + 120%
            if (!in_array($nextDir, $nextTriangles)) continue;

            // Any built cell in that dir ?
            $neighbours = $board->getBuiltNeighbours($nextCell, [$nextDir]);
            if (empty($neighbours)) continue;
            $nextNextCell = $neighbours[0];
            // Any connected built barrack in that dir ?
            foreach ($board->getTypesAtPos($nextNextCell) as $nextNextType => $nextNextTriangles) {
              if ($nextNextType != TEMPLE) continue;
              // Cell must be connected to previous cell 
              if (!in_array(($nextDir + 3) % 6, $nextNextTriangles)) continue;
              // Cell must be connected to first cell
              if (!$board->areCellsTrianglesAdjacent($cell, $triangles, $nextNextCell, $nextNextTriangles)) continue;

              return true; // A GROUP OF 3 !!
            }
          }
        }
      }
    }

    return false;
  }
}
