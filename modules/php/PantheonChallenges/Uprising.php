<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class Uprising extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Uprising';
    $this->name = clienttranslate('Uprising');
    $this->description = clienttranslate('Have 4 <BARRACK> along the edge');
    $this->color = BARRACK;
  }

  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    return false;
  }
}
