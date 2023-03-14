<?php
namespace AKR\States;
use AKR\Core\Globals;
use AKR\Core\Notifications;
use AKR\Managers\Players;
use AKR\Managers\Tiles;
use AKR\Helpers\Utils;

trait TurnTrait
{
  public function argsPlaceTile()
  {
    $player = Players::getActive();
    $options = $player->board()->getPlacementOptions();
    $tiles = Tiles::getInLocation('dock')->filter(function ($tile) use ($player) {
      return $tile['state'] <= $player->getMoney();
    });

    return [
      'options' => $options,
      'tileIds' => $tiles->getIds(),
    ];
  }

  public function actPlaceTile($tileId, $pos, $r)
  {
    // Sanity check
    self::checkAction('actPlaceTile');
    $args = $this->argsPlaceTile();
    // Check tile
    if (!in_array($tileId, $args['tileIds'])) {
      throw new \BgaVisibleSystemException('Cannot place this tile. Should not happen');
    }
    // Check position
    $optionId = Utils::search($args['options'], function ($option) use ($pos) {
      return Utils::compareZones($option, $pos) == 0;
    });
    if ($optionId === false) {
      throw new \BgaVisibleSystemException('Impossible hex. Should not happen');
    }
    // Check rotation
    $option = $args['options'][$optionId];
    if (!in_array($r, $option['r'])) {
      throw new \BgaVisibleSystemException('Impossible rotation. Should not happen');
    }

    // Place tile
    $player = Players::getActive();
    $player->board()->addTile($tileId, $pos, $r);
    // Pay money if needed : TODO
    // Gain money if recovering quarries : TODO
    // Update score if live scoring : TODO
    // Notify : TODO

    // Change state and refill if needed : TODO
  }
}
