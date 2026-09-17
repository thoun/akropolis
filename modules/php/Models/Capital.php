<?php

namespace Bga\Games\Akropolis\Models;

use Bga\Games\Akropolis\Core\Stats;
use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Core\Preferences;
use Bga\Games\Akropolis\Managers\Actions;
use Bga\Games\Akropolis\Managers\ZooCards;
use Bga\Games\Akropolis\Managers\ActionCards;
use Bga\Games\Akropolis\Managers\Meeples;
use Bga\Games\Akropolis\Managers\Buildings;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Engine;
use Bga\Games\Akropolis\Helpers\FlowConvertor;
use Bga\Games\Akropolis\Helpers\Utils;

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

  public function getUiData($currentPlayerId = null): array
  {
    $data = parent::getUiData();
    $data['lvl'] = $this->getLvl();
    return $data;
  }

  public function getLvl(): int
  {
    return $this->lvl;
  }

  // Cached attribute
  protected ?TriangulatedBoard $board = null;
  public function board(): TriangulatedBoard
  {
    if ($this->board == null) {
      $this->board = new TriangulatedBoard($this);
    }
    return $this->board;
  }
}
