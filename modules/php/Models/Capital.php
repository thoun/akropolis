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

class Capital extends Player
{
  protected int $lvl;

  public function __construct($row)
  {
    $this->id = CAPITAL_ID;
    $this->no = -1;
    $this->money = 0;
    $this->lvl = (int) Globals::getScenario();

    $lvlNames = [
      0 => clienttranslate('Corinthe'),
      1 => clienttranslate('Sparte'),
      2 => clienttranslate('Athena'),
    ];
    $this->name = $lvlNames[$this->lvl];
    $this->color = '000000';
    $this->score = $this->getScore();
    $this->scoreAux = 0;
    $this->eliminated = false;
    $this->zombie = false;
  }

  public function getScore(): int
  {
    return 0; // TODO
  }

  public function getUiData($currentPlayerId = null)
  {
    $data = parent::getUiData();
    $data['lvl'] = $this->getLvl();
    return $data;
  }

  public function getLvl()
  {
    return $this->lvl;
  }

  // Cached attribute
  protected $board = null;
  public function board(): TriangulatedBoard
  {
    if ($this->board == null) {
      $this->board = new TriangulatedBoard($this);
    }
    return $this->board;
  }
}
