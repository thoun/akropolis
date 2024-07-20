<?php

namespace AKR\ConstructionCards;

class LuxuryGoods extends \AKR\Models\ConstructionCard
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'LuxuryGoods';
    $this->name = clienttranslate('Luxury Goods');
  }
}
