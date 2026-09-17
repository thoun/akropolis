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

class Architect extends Player
{
  private int $lvl;

  public function __construct($row)
  {
    $infos = Globals::getArchitect();
    $this->id = 0;
    $this->no = 2;
    $this->money = $infos['money'];
    $this->lvl = (int) $infos['lvl'];

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

  public function getUiData($currentPlayerId = null): array
  {
    $data = parent::getUiData();
    $data['lvl'] = $this->getLvl();
    return $data;
  }

  public function incMoney(int $money): void
  {
    $this->money += $money;
    $infos = Globals::getArchitect();
    $infos['money'] = $this->money;
    Globals::setArchitect($infos);
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
