<?php

namespace AKR\ConstructionCards;

class Villa extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Villa';
    $this->name = clienttranslate('Villa');
  }
}
