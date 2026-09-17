<?php

namespace Bga\Games\Akropolis\Models;

use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Core\Game;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Managers\Meeples;
/*
 * ConstructionCard
 */

class ConstructionCard extends \Bga\Games\Akropolis\Helpers\DB_Model
{
  protected $table = 'construction-cards';
  protected $primary = 'card_id';
  protected $attributes = [
    'id' => ['card_id', 'int'],
    'location' => 'card_location',
    'state' => ['card_state', 'int'],
  ];
  protected int $id;
  protected string $location;
  protected int $state;

  protected array $staticAttributes = [['name', 'str'], ['desc', 'str']];
  protected string $name = "";
  protected string $desc = "";

  public function isSatisfied(\Bga\Games\Akropolis\Models\Player $player)
  {
    return false;
  }
}
