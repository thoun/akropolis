<?php

namespace AKR\ConstructionCards;

class Fortress extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Fortress';
    $this->name = clienttranslate('Fortress');
  }
}
