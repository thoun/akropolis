<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class PatricianVilla extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'PatricianVilla';
    $this->name = clienttranslate('Patrician Villa');
    $this->description = clienttranslate('Place 1 <HOUSE> higher and adjacent to 1 <HOUSE> on a higher level');
    $this->color = HOUSE;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    // Find an hex of that tile that is a house and that is high enough
    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      if ($cell['z'] < 2) continue;

      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != HOUSE) continue;

        // Now find a neighbouring house on higher grounds
        $builtNeighbours = $this->getBuiltNeighbours($cell, $triangles);
        foreach ($builtNeighbours as $pos) {
          foreach ($this->getTypesAtPos($pos) as $type2 => $triangles2) {
            if ($type2 != HOUSE) continue;
            if ($board->getMaxHeightAtPos($pos, false) == 0) continue;

            return true;
          }
        }
      }
    }

    return false;
  }
}
