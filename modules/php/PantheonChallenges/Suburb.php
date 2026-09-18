<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class Suburb extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Suburb';
    $this->name = clienttranslate('Suburb');
    $this->description = clienttranslate('Have 4 <HOUSE> connected along the edge');
    $this->color = HOUSE;
  }

  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    return false;
  }
}
