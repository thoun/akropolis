<?php

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\Player;

class QuarryMine extends \Bga\Games\Akropolis\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'QuarryMine';
    $this->name = clienttranslate('Quarry Mine');
    $this->desc = clienttranslate('Player has 8 <STONE>');
  }

  public function isSatisfied(Player $player)
  {
    return $player->getMoney() >= 8;
  }
}
