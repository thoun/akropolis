<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class Ritual extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Ritual';
    $this->name = clienttranslate('Ritual');
    $this->description = clienttranslate('Place 1 <TEMPLE>, so that 1 <TEMPLE> are surrounded');
    $this->color = TEMPLE;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      if ($cell['z'] != 0) continue;

      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != TEMPLE) continue;

        // Now find a neighbouring temple surrounded
        $builtNeighbours = $board->getBuiltNeighbours($cell, $triangles);
        foreach ($builtNeighbours as $pos) {
          foreach ($board->getTypesAtPos($pos) as $type2 => $triangles2) {
            if ($type2 != TEMPLE) continue;

            // Check if this temple cell is surrounded (all triangle sides have built neighbours)
            $builtNeighbours = $board->getBuiltNeighbours($pos, $triangles2);
            if (count($builtNeighbours) >= count($triangles)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }
}
