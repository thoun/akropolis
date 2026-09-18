<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Models;

use Bga\Games\Akropolis\Core\Globals;

/*
 * Capital: fake player for Pantheon expansion
 */

class Capital extends Player
{
  protected int $lvl;

  /**
   * Create Capital instance
   * @param array<mixed>|null $row Database row (not used, info comes from Globals)
   */
  public function __construct(?array $row = null)
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

  /**
   * Get Capital score
   * @return int Score (currently always 0, TODO)
   */
  public function getScore(): int
  {
    return 0; // TODO
  }

  /**
   * Get UI data for Capital
   * @param int|null $currentPlayerId Current player ID (not used for Capital)
   * @return array Capital UI data
   */
  public function getUiData(?int $currentPlayerId = null): array
  {
    $data = parent::getUiData();
    $data['lvl'] = $this->getLvl();
    return $data;
  }

  /**
   * Get Capital level (scenario)
   * @return int Level (0-2)
   */
  public function getLvl(): int
  {
    return $this->lvl;
  }

  // Cached attribute
  protected ?TriangulatedBoard $board = null;

  /**
   * Get Capital's board
   * @return TriangulatedBoard Capital's board
   */
  public function board(): TriangulatedBoard
  {
    if ($this->board == null) {
      $this->board = new TriangulatedBoard($this);
    }
    return $this->board;
  }
}
