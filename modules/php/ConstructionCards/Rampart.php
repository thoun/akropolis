<?php

namespace AKR\ConstructionCards;

class Rampart extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Rampart';
    $this->name = clienttranslate('Rampart');
  }
}
