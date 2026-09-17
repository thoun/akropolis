<?php

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\Player;

class Agora extends \Bga\Games\Akropolis\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Agora';
    $this->name = clienttranslate('Agora');
    $this->desc = clienttranslate('1 <PLAZA> of each type');
  }

  // Testée
  public function isSatisfied(Player $player)
  {
    $board = $player->board();
    $plaza = $board->getPlazaStars();
    return min($plaza) > 0;
  }
}
