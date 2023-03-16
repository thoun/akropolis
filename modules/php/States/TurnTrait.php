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
    $tile = Tiles::getSingle($tileId);
    $cost = $tile['state'];
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
    $tile = Tiles::getSingle($tileId);
    Notifications::placeTile($player, $tile);

    // Pay money if needed
    if ($cost > 0) {
      $player->incMoney(-$cost);
      Notifications::payForTile($player, $cost);
    }
    Tiles::shiftDock($cost);

    // Gain money if recovering quarries : TODO
    // Update score if live scoring : TODO
    // Notify : TODO

    $this->gamestate->nextState('next');
  }

  public function stNextPlayer()
  {
    // Change state and refill if needed
    if (Tiles::countInLocation('dock') == 1) {
      if (Tiles::countInLocation('deck') > 0) {
        Tiles::refillDock();
        
        $dock = Tiles::getUiData();
        $deck = Tiles::countInLocation('deck');
        Notifications::refill($dock, $deck);
      } else {
        die('EOG');
        return;
      }
    }

    $this->activeNextPlayer();
    // giveExtraTime TODO
    $this->gamestate->nextState('placeTile');
  }
}
