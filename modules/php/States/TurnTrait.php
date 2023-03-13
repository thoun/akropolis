<?php
namespace AKR\States;
use AKR\Core\Globals;
use AKR\Core\Notifications;
use AKR\Managers\Players;
use AKR\Managers\Tiles;

trait TurnTrait
{
  public function argsPlaceTile()
  {
    $player = Players::getActive();
    $options = $player->board()->getPlacementOptions();
    return [
      'options' => $options,
    ];
  }
}
