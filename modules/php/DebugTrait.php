<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Managers\Players;

trait DebugTrait
{
  /**
   * Debug: Place a tile
   * @param int $tileId Tile ID
   * @param int $x X coordinate
   * @param int $y Y coordinate
   * @param int $z Z coordinate
   * @param int $rotation Rotation value
   */
  function debug_placeTile(int $tileId, int $x, int $y, int $z, int $rotation): void
  {
    $player = Players::getCurrent();
    $player->board()->addTile($tileId, ['x' => $x, 'y' => $y, 'z' => $z], $rotation);
  }

  /**
   * Debug: Mark the game to end at the next end-of-game check
   */
  function debug_triggerEndOfGame(): void
  {
    Globals::setEndOfGame(true);
  }
}
