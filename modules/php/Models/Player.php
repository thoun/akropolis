<?php
namespace AKR\Models;
use AKR\Core\Stats;
use AKR\Core\Notifications;
use AKR\Core\Preferences;
use AKR\Managers\Actions;
use AKR\Managers\ZooCards;
use AKR\Managers\ActionCards;
use AKR\Managers\Meeples;
use AKR\Managers\Buildings;
use AKR\Core\Globals;
use AKR\Core\Engine;
use AKR\Helpers\FlowConvertor;
use AKR\Helpers\Utils;

/*
 * Player: all utility functions concerning a player
 */

class Player extends \AKR\Helpers\DB_Model
{
  private $map = null;
  protected $table = 'player';
  protected $primary = 'player_id';
  protected $attributes = [
    'id' => ['player_id', 'int'],
    'no' => ['player_no', 'int'],
    'name' => 'player_name',
    'color' => 'player_color',
    'eliminated' => 'player_eliminated',
    'score' => ['player_score', 'int'],
    'scoreAux' => ['player_score_aux', 'int'],
    'zombie' => 'player_zombie',

    'money' => ['money', 'int'],
  ];

  public function getUiData($currentPlayerId = null)
  {
    $data = parent::getUiData();
    $data['board'] = $this->board()->getUiData();
    return $data;
  }

  public function getPref($prefId)
  {
    return Preferences::get($this->id, $prefId);
  }

  public function getStat($name)
  {
    $name = 'get' . \ucfirst($name);
    return Stats::$name($this->id);
  }

  // Cached attribute
  protected $board = null;
  public function board()
  {
    if ($this->board == null) {
      $this->board = new Board($this);
    }
    return $this->board;
  }
}
