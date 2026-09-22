<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class MarketStall extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'MarketStall';
    $this->name = clienttranslate('Market Stall');
    $this->description = clienttranslate('Place 1 tile, so that 1 <MARKET> is enclosed');
    $this->color = MARKET;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    // Check that the tile was placed at level 0
    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      if ($cell['z'] != 0) {
        return false;
      }
    }

    $neighbouringCells = $board->getTileNeighbouringCells($tile);
    foreach ($neighbouringCells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != MARKET) continue;

        // Check if this market cell is fully enclosed
        $builtNeighbours = $board->getBuiltNeighbours($cell, $triangles);
        if (count($builtNeighbours) >= count($triangles)) {
          return true;
        }
      }
    }

    return false;
  }
}
