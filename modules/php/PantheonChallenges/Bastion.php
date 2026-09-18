<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Player;
use Bga\Games\Akropolis\Models\Challenge;

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
    return false;
  }
}
