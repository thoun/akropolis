<?php

namespace AKR\ConstructionCards;

class QuarryMine extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'QuarryMine';
    $this->name = clienttranslate('Quarry Mine');
  }
}
