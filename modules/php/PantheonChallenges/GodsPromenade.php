<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class GodsPromenade extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'GodsPromenade';
    $this->name = clienttranslate('Gods Promenade');
    $this->description = clienttranslate('Place 1 <GARDEN> adjacent to 1 <GARDEN>');
    $this->color = GARDEN;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != GARDEN) continue;

        // Now find a neighbouring Garden
        $builtNeighbours = $board->getBuiltNeighbours($cell, $triangles);
        foreach ($builtNeighbours as $pos) {
          foreach ($board->getTypesAtPos($pos) as $type2 => $triangles2) {
            if ($type2 != GARDEN) continue;

            return true;
          }
        }
      }
    }

    return false;
  }
}
