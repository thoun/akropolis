<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class Neighborhood extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Neighborhood';
    $this->name = clienttranslate('Neighborhood');
    $this->description = clienttranslate('Place 1 <HOUSE>, so that 2 <HOUSE> are surrounded');
    $this->color = HOUSE;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    return false;
  }
}
