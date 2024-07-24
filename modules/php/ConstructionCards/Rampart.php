<?php

namespace AKR\ConstructionCards;

use AKR\Models\Player;

class Rampart extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Rampart';
    $this->name = clienttranslate('Rampart');
    $this->desc = clienttranslate('1 straight line of 3 or more <BARRACK>');
  }

  // Testée
  public function isSatisfied(Player $player)
  {
    $board = $player->board();
    // For each barrack
    foreach ($board->getBuiltCells() as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != BARRACK) continue;

        // For each direction
        foreach ($triangles as $dir) {
          // Any built cell in that dir ?
          $neighbours = $board->getBuiltNeighbours($cell, [$dir]);
          if (empty($neighbours)) continue;
          $nextCell = $neighbours[0];

          // Any connected built barrack in that dir ?
          foreach ($board->getTypesAtPos($nextCell) as $nextType => $nextTriangles) {
            if ($nextType != BARRACK) continue;
            // Cell must be connected to previous cell 
            if (!in_array(($dir + 3) % 6, $nextTriangles)) continue;
            // And also must allow to keep going in same direction
            if (!in_array($dir, $nextTriangles)) continue;

            // Any built cell in that dir ?
            $neighbours = $board->getBuiltNeighbours($nextCell, [$dir]);
            if (empty($neighbours)) continue;
            $nextNextCell = $neighbours[0];
            // Any connected built barrack in that dir ?
            foreach ($board->getTypesAtPos($nextNextCell) as $nextNextType => $nextNextTriangles) {
              if ($nextNextType != BARRACK) continue;
              // Cell must be connected to previous cell 
              if (!in_array(($dir + 3) % 6, $nextNextTriangles)) continue;

              return true; // A LINE OF 3 !!
            }
          }
        }
      }
    }

    return false;
  }
}
