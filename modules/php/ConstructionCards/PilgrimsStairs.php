<?php

namespace AKR\ConstructionCards;

class PilgrimsStairs extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'PilgrimsStairs';
    $this->name = clienttranslate('Pilgrims\' Stairs');
  }
}
