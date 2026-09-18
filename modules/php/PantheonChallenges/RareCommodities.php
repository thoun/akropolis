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
    return false;
  }
}
