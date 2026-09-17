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
use Bga\Games\Akropolis\Managers\Tiles;

/*
 * Player: all utility functions concerning a player
 */

class Player extends \Bga\Games\Akropolis\Helpers\DB_Model
{
  protected string $table = 'player';
  protected string $primary = 'player_id';
  protected array $attributes = [
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
  protected int $id;
  protected ?int $no;
  protected ?string $name;
  protected ?string $color;
  protected ?bool $eliminated;
  protected ?int $score;
  protected ?int $scoreAux;
  protected ?bool $zombie;
  protected ?int $money;

  public function getUiData($currentPlayerId = null): array
  {
    $data = parent::getUiData();
    $data['board'] = $this->board()->getUiData();
    if (Globals::isPantheon() && $currentPlayerId == $this->getId()) {
      $data['tiles'] = Tiles::getPlayerHand($this->getId());
    }
    return $data;
  }

  public function getPref(int $prefId): int
  {
    return Preferences::get($this->id, $prefId);
  }

  public function getStat(string $name): mixed
  {
    $name = 'get' . \ucfirst($name);
    return Stats::$name($this->id);
  }

  // Cached attribute
  protected ?TriangulatedBoard $board = null;
  //  public function board(): \Bga\Games\Akropolis\Models\Board
  public function board(): \Bga\Games\Akropolis\Models\TriangulatedBoard
  {
    if ($this->board == null) {
      //      $this->board = new Board($this);
      $this->board = new TriangulatedBoard($this);
    }
    return $this->board;
  }
}
