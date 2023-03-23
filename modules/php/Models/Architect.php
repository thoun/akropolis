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
 * Architect: fake player
 */

class Architect extends Player
{
  public function __construct($row)
  {
    $infos = Globals::getArchitect();
    $this->id = 0;
    $this->no = 2;
    $this->money = $infos['money'];
    $this->lvl = $infos['lvl'];

    $lvlNames = [
      0 => clienttranslate('Hippodamos'),
      1 => clienttranslate('Metagenes'),
      2 => clienttranslate('Callicrates'),
    ];
    $this->name = $lvlNames[$infos['lvl']];
    $this->color = '000000';
    $this->score = $infos['score'];
    $this->scoreAux = 0;
    $this->eliminated = false;
    $this->zombie = false;
  }

  public function getUiData($currentPlayerId = null)
  {
    $data = parent::getUiData();
    $data['lvl'] = $this->getLvl();
    return $data;
  }

  public function incMoney($money)
  {
    $this->money += $money;
    $infos = Globals::getArchitect();
    $infos['money'] = $this->money;
    Globals::setArchitect($infos);
  }

  public function getLvl()
  {
    return $this->lvl;
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
