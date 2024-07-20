<?php

namespace AKR\ConstructionCards;

class GuardTower extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'GuardTower';
    $this->name = clienttranslate('Guard Tower');
  }
}
