<?php

namespace AKR\ConstructionCards;

use AKR\Models\Player;

class MainStreet extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'MainStreet';
    $this->name = clienttranslate('Main Street');
    $this->desc = clienttranslate('Straight line of 5 <DISTRICT>');
  }

  public function checkLineInDir($board, $cell, $dir, $i, $types)
  {
    // Any connected built barrack in that dir ?
    foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
      if (in_array($type, $types) || !in_array($type, DISTRICTS)) continue;

      // Cell must be connected to previous cell, unless $i = 0
      if ($i > 0 && !in_array(($dir + 3) % 6, $triangles)) continue;
      // And also must allow to keep going in same direction, unless $i = 4
      if ($i < 4 && !in_array($dir, $triangles)) continue;

      // Reached end of line ? => FOUND!
      if ($i == 4) {
        return true;
      }
      // Otherwise, check next cell
      else {
        // Any built cell in that dir ?
        $neighbours = $board->getBuiltNeighbours($cell, [$dir]);
        if (empty($neighbours)) continue;
        $nextCell = $neighbours[0];
        if ($this->checkLineInDir($board, $nextCell, $dir, $i + 1, array_merge($types, [$type]))) {
          return true;
        }
      }
    }
    return false;
  }

  // Testée (sans dual tiles)
  public function isSatisfied(Player $player)
  {
    $board = $player->board();
    // For each barrack
    foreach ($board->getBuiltCells() as $cell) {
      foreach ([0, 1, 2, 3, 4, 5] as $dir) {
        if ($this->checkLineInDir($board, $cell, $dir, 0, [])) {
          return true;
        }
      }
    }

    return false;
  }
}
