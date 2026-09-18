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
    return false;
  }
}
