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
    $options = [];
    for ($hex = 0; $hex < 3; $hex++) {
      $options[$hex] = $player->board()->getPlacementOptions($hex);
    }

    $tiles = Tiles::getInLocation('dock')->filter(function ($tile) use ($player) {
      return $tile['state'] <= $player->getMoney();
    });

    return [
      'options' => $options,
      'tileIds' => $tiles->getIds(),
    ];
  }

  public function actPlaceTile($tileId, $hex, $pos, $r)
  {
    $player = Players::getActive();
    // Sanity check
    self::checkAction('actPlaceTile');
    $args = $this->argsPlaceTile();
    // Check tile
    if (!in_array($tileId, $args['tileIds'])) {
      throw new \BgaVisibleSystemException('Cannot place this tile. Should not happen');
    }
    $tile = Tiles::getSingle($tileId);
    $cost = $tile['state'];
    // Check position : always go back to top left hex on tile
    $pos = $player->board()->getCorrespondingPos($pos, $r, $hex);
    $optionId = Utils::search($args['options'][0], function ($option) use ($pos) {
      return Utils::compareZones($option, $pos) == 0;
    });
    if ($optionId === false) {
      throw new \BgaVisibleSystemException('Impossible hex. Should not happen');
    }
    // Check rotation
    $option = $args['options'][0][$optionId];
    if (!in_array($r, $option['r'])) {
      throw new \BgaVisibleSystemException('Impossible rotation. Should not happen');
    }

    // Pay money if needed
    if ($cost > 0) {
      $player->incMoney(-$cost);
      Notifications::payForTile($player, $cost);
    }

    // Place tile
    $money = $player->board()->addTile($tileId, $pos, $r);
    $tile = Tiles::getSingle($tileId);
    Notifications::placeTile($player, $tile);
    // Gain money if recovering quarries
    if ($money > 0) {
      $player->incMoney($money);
      Notifications::gainStones($player, $money);
    }

    // Shift remaining tiles
    Tiles::shiftDock($cost);

    // Update score if live scoring : TODO

    $this->gamestate->nextState('next');
  }

  public function stNextPlayer()
  {
    // Change state and refill if needed
    if (Tiles::countInLocation('dock') == 1) {
      if (Tiles::countInLocation('deck') > 0) {
        $dock = Tiles::refillDock();
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
