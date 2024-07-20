<?php

namespace AKR\ConstructionCards;

class HangingGardens extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'HangingGardens';
    $this->name = clienttranslate('Hanging Gardens');
  }
}
