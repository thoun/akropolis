<?php

namespace AKR\ConstructionCards;

class DistrictCenter extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'DistrictCenter';
    $this->name = clienttranslate('District Center');
  }
}
