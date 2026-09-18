<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class Ritual extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Ritual';
    $this->name = clienttranslate('Ritual');
    $this->description = clienttranslate('Place 1 <TEMPLE>, so that 1 <TEMPLE> are surrounded');
    $this->color = TEMPLE;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    return false;
  }
}
