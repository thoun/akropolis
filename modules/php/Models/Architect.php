<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Models;

use Bga\Games\Akropolis\Core\Globals;

/*
 * Architect: fake player
 */

class Architect extends Player
{
  private int $lvl;

  /**
   * Create Architect instance
   * @param array<mixed>|null $row Database row (not used, info comes from Globals)
   */
  public function __construct(?array $row = null)
  {
    $infos = Globals::getArchitect();
    $this->id = ARCHITECT_ID;
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

  /**
   * Get UI data for Architect
   * @param int|null $currentPlayerId Current player ID (not used for Architect)
   * @return array Architect UI data
   */
  public function getUiData(?int $currentPlayerId = null): array
  {
    $data = parent::getUiData();
    $data['lvl'] = $this->getLvl();
    return $data;
  }

  /**
   * Increment Architect's money
   * @param int $money Amount to add
   */
  public function incMoney(int $money): void
  {
    $this->money += $money;
    $infos = Globals::getArchitect();
    $infos['money'] = $this->money;
    Globals::setArchitect($infos);
  }

  /**
   * Get Architect level
   * @return int Level (0-2)
   */
  public function getLvl(): int
  {
    return $this->lvl;
  }

  // Cached attribute
  protected ?TriangulatedBoard $board = null;

  /**
   * Get Architect's board
   * @return TriangulatedBoard Architect's board
   */
  public function board(): TriangulatedBoard
  {
    if ($this->board == null) {
      $this->board = new TriangulatedBoard($this);
    }
    return $this->board;
  }
}
