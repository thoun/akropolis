<?php

namespace AKR\ConstructionCards;

class CityMarket extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'CityMarket';
    $this->name = clienttranslate('City Market');
  }
}
