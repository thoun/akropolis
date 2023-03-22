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
    $realPos = $player->board()->getCorrespondingPos($pos, $r, $hex);
    $optionId = Utils::search($args['options'][0], function ($option) use ($realPos) {
      return Utils::compareZones($option, $realPos) == 0;
    });
    if ($optionId === false) {
      throw new \BgaVisibleSystemException('Impossible hex. Should not happen');
    }
    // Check rotation
    $option = $args['options'][0][$optionId];
    if (!in_array($r, $option['r'])) {
      throw new \BgaVisibleSystemException('Impossible rotation. Should not happen');
    }

    $this->actPlaceTileAux($player, $tileId, $hex, $pos, $r);
    $this->gamestate->nextState('next');
  }

  /**
   * Auxiliary function that place the tile => can be reused for Architect
   */
  public function actPlaceTileAux($player, $tileId, $hex, $pos, $r)
  {
    $tile = Tiles::getSingle($tileId);
    $cost = $tile['state'];
    // Check position : always go back to top left hex on tile
    $pos = $player->board()->getCorrespondingPos($pos, $r, $hex);

    // Pay money if needed
    if ($cost > 0) {
      $player->incMoney(-$cost);
      Notifications::payForTile($player, $cost);
      if (Globals::isSolo() && $player->getId() != ARCHITECT_ID) {
        $architect = Players::getArchitect();
        $architect->incMoney($cost);
        // TODO : notify ??
      }
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

    // Update score if live scoring
    if (Globals::isLiveScoring()) {
      $scores = $player->board()->getScores();
      Notifications::updateScores($player, $scores);
    }
  }

  public function stNextPlayer()
  {
    $activePId = (int) Players::getActiveId();
    $nextPId = Globals::isSolo() ? 0 : Players::getNextId($activePId);

    // Refill if needed
    $this->refillIfNeeded($nextPId);

    // Auto play architect if solo
    if (Globals::isSolo()) {
      $this->stArchitectTurn();
      $this->refillIfNeeded($activePId);
    }
    // Otherwise, move to next player
    else {
      $this->activeNextPlayer();
    }

    self::giveExtraTime($nextPId);
    $this->gamestate->nextState(Globals::isEndOfGame() ? 'end' : 'placeTile');
  }

  /**
   * Refill the dock if needed and trigger detect end of game
   */
  public function refillIfNeeded($nextPId)
  {
    if (Tiles::countInLocation('dock') == 1) {
      if (Tiles::countInLocation('deck') > 0) {
        $dock = Tiles::refillDock();
        $deck = Tiles::countInLocation('deck');
        Notifications::refill($dock, $deck);

        Globals::setFirstPlayer($nextPId);
        Notifications::updateFirstPlayer($nextPId);
      } else {
        Globals::setEndOfGame(true);
      }
    }
  }
}
