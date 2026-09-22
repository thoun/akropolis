<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class BustlingTrade extends Challenge
{
  /**
   * Create BustlingTrade challenge
   * @param array<mixed>|null $row Database row (optional)
   */
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'BustlingTrade';
    $this->name = clienttranslate('Bustling Trade');
    $this->description = clienttranslate('Have 5 isolated <MARKET>');
    $this->color = MARKET;
  }

  /**
   * Check if player satisfies the challenge
   * @param Player $player Player to check
   * @return bool True if challenge is satisfied
   */
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $cells = $board->getVisibleBuiltCells();
    $markets = [];
    foreach ($cells as $cell) {
      foreach ($board->getTypesAtPos($cell) as $type => $triangles) {
        if ($type != MARKET) continue;
        $markets[] = $cell;
      }
    }

    $nIsolated = 0;
    foreach ($markets as $cell1) {
      $isolated = true;
      foreach ($markets as $cell2) {
        if ($board->getDistance($cell1, $cell2) <= 1) {
          $isolated = false;
          break;
        }
      }

      if ($isolated) {
        $nIsolated++;
        if ($nIsolated >= 5) return true;
      }
    }

    return false;
  }
}
