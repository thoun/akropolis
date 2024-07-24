<?php

namespace AKR\ConstructionCards;

use AKR\Models\Player;

class Sanctuary extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Sanctuary';
    $this->name = clienttranslate('Sanctuary');
  }

  // Testée
  public function isSatisfied(Player $player)
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
