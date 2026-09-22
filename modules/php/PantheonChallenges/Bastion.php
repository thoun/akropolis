<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Player;
use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\TriangulatedBoard;

class Bastion extends Challenge
{
  /**
   * Create Bastion challenge
   * @param array<mixed>|null $row Database row (optional)
   */
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Bastion';
    $this->name = clienttranslate('Bastion');
    $this->description = clienttranslate('Place 1 <BARRACK> along the edge, adjacent to 1 <BARRACK> along the edge');
    $this->color = COLOR_RED;
  }

  /**
   * Check if placing this tile satisfies the challenge
   * @param Player $player Player to check
   * @param array<mixed> $tile Tile data
   * @return bool True if challenge is satisfied
   */
  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    // Find an hex of that tile that is a barrack on the edge
    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != BARRACK) continue;
        if (!$board->isOnTheEdge($cell, $triangles)) continue;

        // Now find a neighbouring barrack also on the edge
        $builtNeighbours = $this->getBuiltNeighbours($cell, $triangles);
        foreach ($builtNeighbours as $pos) {
          foreach ($this->getTypesAtPos($pos) as $type2 => $triangles2) {
            if ($type2 != BARRACK) continue;
            if (!$board->isOnTheEdge($pos, $triangles2)) continue;

            return true;
          }
        }
      }
    }

    return false;
  }
}
