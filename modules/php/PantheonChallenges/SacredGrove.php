<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class SacredGrove extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'SacredGrove';
    $this->name = clienttranslate('Sacred Grove');
    $this->description = clienttranslate('Place 1 <GARDEN> on a higher level');
    $this->color = GARDEN;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    return false;
  }
}
