<?php

namespace AKR\ConstructionCards;

class MainStreet extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'MainStreet';
    $this->name = clienttranslate('Main Street');
  }
}
