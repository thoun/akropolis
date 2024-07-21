<?php

namespace AKR\ConstructionCards;

use AKR\Models\Player;

class QuarryMine extends \AKR\Models\ConstructionCard
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
