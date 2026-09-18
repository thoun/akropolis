<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class Agora extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Agora';
    $this->name = clienttranslate('Agora');
    $this->desc = clienttranslate('1 <PLAZA> of each type');
  }

  // Testée
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $plaza = $board->getPlazaStars();
    return min($plaza) > 0;
  }
}
