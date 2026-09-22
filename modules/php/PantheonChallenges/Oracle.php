<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class Oracle extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Oracle';
    $this->name = clienttranslate('Oracle');
    $this->description = clienttranslate('Place 1 <TEMPLE> on a higher level and surrounded');
    $this->color = TEMPLE;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      if ($cell['z'] == 0) continue;

      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != TEMPLE) continue;

        $builtNeighbours = $board->getBuiltNeighbours($cell, $triangles);
        if (count($builtNeighbours) >= count($triangles)) {
          return true;
        }
      }
    }

    return false;
  }
}
