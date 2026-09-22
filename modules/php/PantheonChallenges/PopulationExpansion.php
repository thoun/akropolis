<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class PopulationExpansion extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'PopulationExpansion';
    $this->name = clienttranslate('Population Expansion');
    $this->description = clienttranslate('Place 1 <HOUSE> adjacent to 4 <HOUSE>');
    $this->color = HOUSE;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    // Find an hex of that tile that is a house
    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != HOUSE) continue;

        $n = 0;
        // Now find 4 neighbouring houses

        $builtNeighbours = $this->getBuiltNeighbours($cell, $triangles);
        foreach ($builtNeighbours as $pos) {
          foreach ($this->getTypesAtPos($pos) as $type2 => $triangles2) {
            if ($type2 != HOUSE) continue;

            $n++;
            if ($n >= 4) return true;
          }
        }
      }
    }

    return false;
  }
}
