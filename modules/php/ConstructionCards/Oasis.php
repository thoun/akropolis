<?php

namespace AKR\ConstructionCards;

class Oasis extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Oasis';
    $this->name = clienttranslate('Oasis');
  }
}
