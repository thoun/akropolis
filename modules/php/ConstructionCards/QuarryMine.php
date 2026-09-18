<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class QuarryMine extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'QuarryMine';
    $this->name = clienttranslate('Quarry Mine');
    $this->desc = clienttranslate('Player has 8 <STONE>');
  }

  public function isSatisfied(Player $player): bool
  {
    return $player->getMoney() >= 8;
  }
}
