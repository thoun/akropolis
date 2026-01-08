<?php
namespace AKR;
use AKR\Core\Globals;
use AKR\Managers\Players;

trait DebugTrait
{
  function debug_placeTile($tileId, $x, $y, $z, $rotation)
  {
    $player = Players::getCurrent();
    $player->board()->addTile($tileId, ['x' => $x, 'y' => $y, 'z' => $z], $rotation);
  }

  function debug_tp()
  {
  }

  function debug_lr() {
    Globals::setEndOfGame(true);
  }
}
