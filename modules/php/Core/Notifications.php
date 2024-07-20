<?php

namespace AKR\Core;

use AKR\Managers\Players;
use AKR\Helpers\Utils;
use AKR\Helpers\Collection;
use AKR\Core\Globals;

class Notifications
{
  /*************************
   **** GENERIC METHODS ****
   *************************/
  protected static function notifyAll($name, $msg, $data)
  {
    self::updateArgs($data);
    Game::get()->notifyAllPlayers($name, $msg, $data);
  }

  protected static function notify($player, $name, $msg, $data)
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::updateArgs($data);
    Game::get()->notifyPlayer($pId, $name, $msg, $data);
  }

  public static function message($txt, $args = [])
  {
    self::notifyAll('message', $txt, $args);
  }

  public static function messageTo($player, $txt, $args = [])
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::notify($pId, 'message', $txt, $args);
  }

  public static function payForTile($player, $cost)
  {
    self::notifyAll('pay', clienttranslate('${player_name} pays ${cost} for taking the tile'), [
      'player' => $player,
      'cost' => $cost,
    ]);
  }

  public static function gainStones($player, $money, bool $silent = false)
  {
    self::notifyAll('gainStones', $silent ? '' : clienttranslate('${player_name} covers ${n} quarry(ies) and gains ${n} stone(s)'), [
      'player' => $player,
      'n' => $money,
    ]);
  }

  public static function placeTile($player, $tile)
  {
    self::notifyAll('placedTile', clienttranslate('${player_name} places a tile in their city'), [
      'player' => $player,
      'tile' => $tile,
    ]);
  }

  public static function refill($dock, $deck)
  {
    self::notifyAll('refillDock', clienttranslate('Dock is refilled'), [
      'dock' => $dock,
      'deck' => $deck,
    ]);
  }

  public static function updateScores($player, $scores)
  {
    self::notifyAll('updateScores', '', [
      'player' => $player,
      'scores' => $scores,
    ]);
  }

  public static function updateFirstPlayer($pId)
  {
    self::notifyAll('updateFirstPlayer', '', [
      'pId' => $pId,
    ]);
  }

  public static function automataDelay($player, $message)
  {
    self::notifyAll('automataDelay', $message, [
      'player' => $player,
    ]);
  }

  public static function completeCard($player, $card)
  {
    self::notifyAll('completeCard', clienttranslate('${player_name} completes construction card "${card_name}"'), [
      'player' => $player,
      'card' => $card,
      'card_name' => $card->getName(),
      'i18n' => ['card_name'],
    ]);
  }

  ///////////////////////////////////////////////////////////////
  //  _   _           _       _            _
  // | | | |_ __   __| | __ _| |_ ___     / \   _ __ __ _ ___
  // | | | | '_ \ / _` |/ _` | __/ _ \   / _ \ | '__/ _` / __|
  // | |_| | |_) | (_| | (_| | ||  __/  / ___ \| | | (_| \__ \
  //  \___/| .__/ \__,_|\__,_|\__\___| /_/   \_\_|  \__, |___/
  //       |_|                                      |___/
  ///////////////////////////////////////////////////////////////

  /*
   * Automatically adds some standard field about player and/or card
   */
  protected static function updateArgs(&$data)
  {
    if (isset($data['player'])) {
      $data['player_name'] = $data['player']->getName();
      $data['player_id'] = $data['player']->getId();
      unset($data['player']);
    }
  }
}
