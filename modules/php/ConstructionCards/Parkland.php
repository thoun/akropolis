<?php

namespace AKR\ConstructionCards;

class Parkland extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Parkland';
    $this->name = clienttranslate('Parkland');
  }
}
