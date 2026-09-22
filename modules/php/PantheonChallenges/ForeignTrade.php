<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class ForeignTrade extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'ForeignTrade';
    $this->name = clienttranslate('Foreign Trade');
    $this->description = clienttranslate('Place 1 <MARKET> on the edge that is 1 hex from 1 <MARKET> on the edge');
    $this->color = MARKET;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != MARKET) continue;
        if (!$board->isOnTheEdge($cell, $triangles)) continue;
        // We found a market on the placed tile that is on the edge

        // Now look at distance 2
        $builtNeighbours = $board->getBuiltNeighbours($cell, $triangles);
        foreach ($builtNeighbours as $pos) {
          $builtNeighbours2 = $board->getBuiltNeighbours($pos);

          foreach ($builtNeighbours2 as $pos2) {
            // Ignore placed tile
            if ($board->getTileIdAtPos($pos2) == $tile['id']) continue;

            // Is there a market on the edge here ?
            foreach ($board->getTypesAtPos($pos2) as $type2 => $triangles2) {
              if ($type2 != MARKET) continue;
              if (!$board->isOnTheEdge($pos2, $triangles2)) continue;

              return true;
            }
          }
        }
      }
    }

    return false;
  }
}
