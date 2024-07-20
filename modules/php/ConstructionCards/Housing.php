<?php

namespace AKR\ConstructionCards;

class Housing extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'Housing';
    $this->name = clienttranslate('Housing');
  }
}
