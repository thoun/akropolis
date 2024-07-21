<?php

namespace AKR\ConstructionCards;

use AKR\Models\Player;

class Agora extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Agora';
    $this->name = clienttranslate('Agora');
    $this->desc = clienttranslate('1 <PLAZA> of each type');
  }

  public function isSatisfied(Player $player)
  {
    $board = $player->board();
    $plaza = $board->getPlazaStars();
    return min($plaza) > 0;
  }
}
