<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class Neighborhood extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Neighborhood';
    $this->name = clienttranslate('Neighborhood');
    $this->description = clienttranslate('Place 1 <HOUSE>, so that 2 <HOUSE> are surrounded');
    $this->color = HOUSE;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      if ($cell['z'] != 0) continue;

      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != HOUSE) continue;

        // Now find two neighbouring houses surrounded
        $nSurrounded = 0;
        $builtNeighbours = $board->getBuiltNeighbours($cell, $triangles);
        foreach ($builtNeighbours as $pos) {
          foreach ($board->getTypesAtPos($pos) as $type2 => $triangles2) {
            if ($type2 != HOUSE) continue;

            // Check if this house cell is surrounded (all triangle sides have built neighbours)
            $builtNeighbours = $board->getBuiltNeighbours($pos, $triangles2);
            if (count($builtNeighbours) >= count($triangles)) {
              $nSurrounded++;
              if ($nSurrounded >= 2) return true;
            }
          }
        }
      }
    }

    return false;
  }
}
