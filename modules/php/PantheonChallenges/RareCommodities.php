<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class RareCommodities extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'RareCommodities';
    $this->name = clienttranslate('Rare Commodities');
    $this->description = clienttranslate('Place 1 <MARKET> on a higher level that is 1 hex from 1 <MARKET> on a higher level');
    $this->color = MARKET;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      if ($cell['z'] == 0) continue;

      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != MARKET) continue;

        // Now look at distance 2
        $builtNeighbours = $board->getBuiltNeighbours($cell, $triangles);
        foreach ($builtNeighbours as $pos) {
          $builtNeighbours2 = $board->getBuiltNeighbours($pos);

          foreach ($builtNeighbours2 as $pos2) {
            // Ignore placed tile
            if ($board->getTileIdAtPos($pos2) == $tile['id']) continue;
            if ($pos2['z'] == 0) continue;

            // Is there a market on the edge here ?
            foreach ($board->getTypesAtPos($pos2) as $type2 => $triangles2) {
              if ($type2 != MARKET) continue;

              return true;
            }
          }
        }
      }
    }

    return false;
  }
}
