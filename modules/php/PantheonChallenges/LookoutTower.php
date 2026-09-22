<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class LookoutTower extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'LookoutTower';
    $this->name = clienttranslate('Lookout Tower');
    $this->description = clienttranslate('Place 1 <BARRACK> on a higher level and along the edge');
    $this->color = BARRACK;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    // Find an hex of that tile that is a barrack on the edge
    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      if ($cell['z'] < 1) continue;

      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != BARRACK) continue;
        if (!$board->isOnTheEdge($cell, $triangles)) continue;

        return true;
      }
    }

    return false;
  }
}
