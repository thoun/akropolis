<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class Suburb extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Suburb';
    $this->name = clienttranslate('Suburb');
    $this->description = clienttranslate('Have 4 <HOUSE> connected along the edge');
    $this->color = HOUSE;
  }

  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();

    // Compute all HOUSE connected components
    list(, $components) = $board->computeTypeComponents(HOUSE);

    // For each component, count how many cells are on the edge
    foreach ($components as $component) {
      $edgeCount = 0;
      foreach ($component['cells'] as $cell) {
        $types = $board->getTypesAtPos($cell);
        $triangles = $types[HOUSE] ?? null;
        if ($triangles === null) continue;
        
        if ($board->isOnTheEdge($cell, $triangles)) {
          $edgeCount++;
        }
      }
      
      if ($edgeCount >= 4) {
        return true;
      }
    }

    return false;
  }
}
