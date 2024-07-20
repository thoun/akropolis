<?php

namespace AKR\ConstructionCards;

class Sanctuary extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Sanctuary';
    $this->name = clienttranslate('Sanctuary');
  }
}
