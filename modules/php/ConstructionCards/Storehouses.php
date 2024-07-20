<?php

namespace AKR\ConstructionCards;

class Storehouses extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Storehouses';
    $this->name = clienttranslate('Storehouses');
  }
}
