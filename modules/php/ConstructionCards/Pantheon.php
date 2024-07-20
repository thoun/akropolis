<?php

namespace AKR\ConstructionCards;

class Pantheon extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Pantheon';
    $this->name = clienttranslate('Pantheon');
  }
}
