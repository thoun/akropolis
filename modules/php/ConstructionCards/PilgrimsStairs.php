<?php

namespace AKR\ConstructionCards;

use AKR\Models\Player;

class PilgrimsStairs extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'PilgrimsStairs';
    $this->name = clienttranslate('Pilgrims\' Stairs');
    $this->desc = clienttranslate('1 <TEMPLE_PLAZA> above a straight set of at least 2 steps');
  }

  // Testée mais en attente de réponse
  public function isSatisfied(Player $player)
  {
    $board = $player->board();
    // For each temple plaza
    foreach ($board->getBuiltCells() as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != TEMPLE_PLAZA) continue;

        // For each direction
        foreach ($triangles as $dir) {
          // Any built cell in that dir ?
          $neighbours = $board->getBuiltNeighbours($cell, [$dir]);
          if (empty($neighbours)) continue;
          $nextCell = $neighbours[0];
          // Height must be smaller
          if ($nextCell['z'] >= $cell['z']) continue;

          // Any built cell in that dir ?
          $neighbours = $board->getBuiltNeighbours($nextCell, [$dir]);
          if (empty($neighbours)) continue;
          $nextNextCell = $neighbours[0];
          if ($nextNextCell['z'] >= $nextCell['z']) continue;

          return true;
        }
      }
    }

    return false;
  }
}
