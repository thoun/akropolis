<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Models;

use Bga\Games\Akropolis\Core\Stats;
use Bga\Games\Akropolis\Core\Preferences;
use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Game;
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
    'eliminated' => ['player_eliminated', 'bool'],
    'score' => ['player_score', 'int'],
    'scoreAux' => ['player_score_aux', 'int'],
    'zombie' => ['player_zombie', 'bool'],

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

  /**
   * Get UI data for this player
   * @param int|null $currentPlayerId Current player ID for perspective
   * @return array Player UI data including board
   */
  public function getUiData(?int $currentPlayerId = null): array
  {
    $data = parent::getUiData();
    $data['board'] = $this->board()->getUiData();
    if (Globals::isPantheon() && $currentPlayerId == $this->getId()) {
      $data['tiles'] = Tiles::getPlayerHand($this->getId());
    }
    return $data;
  }

  /**
   * Get a player preference
   * @param int $prefId Preference ID
   * @return mixed Preference value
   */
  public function getPref(int $prefId): mixed
  {
    return Game::get()->bga->userPreferences->get($this->id, $prefId);
  }

  /**
   * Get a player stat
   * @param string $name Stat name
   * @return mixed Stat value
   */
  public function getStat(string $name): mixed
  {
    $name = 'get' . \ucfirst($name);
    return Stats::$name($this->id);
  }

  // Cached attribute
  protected ?TriangulatedBoard $board = null;

  /**
   * Get the player's board
   * @return TriangulatedBoard Player's board
   */
  public function board(): TriangulatedBoard
  {
    if ($this->board == null) {
      $this->board = new TriangulatedBoard($this);
    }
    return $this->board;
  }
}
