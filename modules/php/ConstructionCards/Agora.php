<?php

namespace AKR\ConstructionCards;

class Agora extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Agora';
    $this->name = clienttranslate('Agora');
  }
}
