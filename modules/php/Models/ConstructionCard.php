<?php

namespace AKR\Models;

use AKR\Managers\Players;
use AKR\Core\Game;
use AKR\Core\Globals;
use AKR\Managers\Meeples;
/*
 * ConstructionCard
 */

class ConstructionCard extends \AKR\Helpers\DB_Model
{
  protected $table = 'construction-cards';
  protected $primary = 'card_id';
  protected $attributes = [
    'id' => ['card_id', 'int'],
    'location' => 'card_location',
    'state' => ['card_state', 'int'],
  ];
  protected $id;
  protected $location;
  protected $state;

  protected $staticAttributes = [['name', 'str']];
  protected $name;

  public function isSatisfied(\AKR\Models\Player $player)
  {
    return false;
  }
}
