<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Core;

use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Models\Player;

/**
 * Notification helpers for sending messages to players
 */
class Notifications
{
  /*************************
   **** GENERIC METHODS ****
   *************************/

  /**
   * Notify all players
   * @param string $name Notification name
   * @param string $msg Notification message (client-translated)
   * @param array<mixed> $data Notification data
   */
  protected static function notifyAll(string $name, string $msg, array $data): void
  {
    self::updateArgs($data);
    Game::get()->notifyAllPlayers($name, $msg, $data);
  }

  /**
   * Notify a specific player
   * @param int|Player $player Player ID or player object
   * @param string $name Notification name
   * @param string $msg Notification message (client-translated)
   * @param array<mixed> $data Notification data
   */
  protected static function notify(int|Player $player, string $name, string $msg, array $data): void
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::updateArgs($data);
    Game::get()->notifyPlayer($pId, $name, $msg, $data);
  }

  /**
   * Send a generic message to all players
   * @param string $txt Message text
   * @param array<mixed> $args Message arguments
   */
  public static function message(string $txt, array $args = []): void
  {
    self::notifyAll('message', $txt, $args);
  }

  /**
   * Send a message to a specific player
   * @param int|Player $player Player ID or player object
   * @param string $txt Message text
   * @param array<mixed> $args Message arguments
   */
  public static function messageTo(int|Player $player, string $txt, array $args = []): void
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::notify($pId, 'message', $txt, $args);
  }

  /**
   * Notify that a player paid for a tile
   * @param Player $player Player who paid
   * @param int $cost Cost in stones
   */
  public static function payForTile(Player $player, int $cost): void
  {
    self::notifyAll('pay', clienttranslate('${player_name} pays ${cost} for taking the tile'), [
      'player' => $player,
      'cost' => $cost,
    ]);
  }

  /**
   * Notify that a player gained stones
   * @param Player $player Player who gained stones
   * @param int $money Number of stones gained
   * @param bool $silent Whether to suppress the notification message
   */
  public static function gainStones(Player $player, int $money, bool $silent = false): void
  {
    self::notifyAll('gainStones', $silent ? '' : clienttranslate('${player_name} covers ${n} quarry(ies) and gains ${n} stone(s)'), [
      'player' => $player,
      'n' => $money,
    ]);
  }

  /**
   * Notify that a player placed a tile
   * @param Player $player Player who placed the tile
   * @param array<mixed> $tile Tile data
   */
  public static function placeTile(Player $player, array $tile): void
  {
    self::notifyAll('placedTile', clienttranslate('${player_name} places a tile in their city'), [
      'player' => $player,
      'tile' => $tile,
    ]);
  }

  /**
   * Notify that the dock was refilled
   * @param array<mixed> $dock New dock tiles
   * @param int $deck Remaining deck count
   */
  public static function refill(array $dock, int $deck): void
  {
    self::notifyAll('refillDock', clienttranslate('Dock is refilled'), [
      'dock' => $dock,
      'deck' => $deck,
    ]);
  }

  /**
   * Notify that player scores were updated
   * @param Player $player Player whose scores were updated
   * @param array<mixed> $scores Score data
   */
  public static function updateScores(Player $player, array $scores): void
  {
    self::notifyAll('updateScores', '', [
      'player' => $player,
      'scores' => $scores,
    ]);
  }

  /**
   * Notify that the first player marker was updated
   * @param int $pId New first player ID
   */
  public static function updateFirstPlayer(int $pId): void
  {
    self::notifyAll('updateFirstPlayer', '', [
      'pId' => $pId,
    ]);
  }

  /**
   * Notify about automata delay
   * @param Player $player Player causing the delay
   * @param string $message Delay message
   */
  public static function automataDelay(Player $player, string $message): void
  {
    self::notifyAll('automataDelay', $message, [
      'player' => $player,
    ]);
  }

  /**
   * Notify that a player completed a challenge
   * @param Player $player Player who completed the challenge
   * @param string $challengeId Challenge ID
   * @param string $color Challenge color
   * @param Challenge|null $newChallenge The newly drawn challenge (if any)
   * @param int $x X coordinate of altar placement
   * @param int $y Y coordinate of altar placement
   * @param int $z Z coordinate of altar placement
   */
  public static function completeChallenge(Player $player, string $challengeId, string $color, ?\Bga\Games\Akropolis\Models\Challenge $newChallenge = null, int $x = 0, int $y = 0, int $z = 0): void
  {
    $data = [
      'player' => $player,
      'challengeId' => $challengeId,
      'color' => $color,
      'x' => $x,
      'y' => $y,
      'z' => $z,
    ];
    if ($newChallenge) {
      $data['newChallenge'] = $newChallenge;
      $data['newChallengeId'] = $newChallenge->getId();
      $data['newChallengeName'] = $newChallenge->getName();
    }
    self::notifyAll('completeChallenge', clienttranslate('${player_name} completes challenge ${challengeId}'), $data);
  }

  /**
   * Notify that a player discarded a challenge
   * @param Player $player Player who discarded the challenge
   * @param string $challengeId Challenge ID
   * @param Challenge|null $newChallenge The newly drawn challenge (if any)
   */
  public static function discardChallenge(Player $player, string $challengeId, ?\Bga\Games\Akropolis\Models\Challenge $newChallenge = null): void
  {
    $data = [
      'player' => $player,
      'challengeId' => $challengeId,
    ];
    if ($newChallenge) {
      $data['newChallenge'] = $newChallenge;
      $data['newChallengeId'] = $newChallenge->getId();
      $data['newChallengeName'] = $newChallenge->getName();
    }
    self::notifyAll('discardChallenge', clienttranslate('${player_name} discards challenge ${challengeId}'), $data);
  }

  /**
   * Notify that a player unlocked a challenge slot
   * @param Player $player Player who unlocked the slot
   * @param int $newSlots New number of unlocked slots
   * @param Challenge|null $newChallenge The newly drawn challenge (if any)
   */
  public static function unlockChallengeSlot(Player $player, int $newSlots, ?\Bga\Games\Akropolis\Models\Challenge $newChallenge = null): void
  {
    $data = [
      'player' => $player,
      'newSlots' => $newSlots,
    ];
    if ($newChallenge) {
      $data['newChallenge'] = $newChallenge;
      $data['newChallengeId'] = $newChallenge->getId();
      $data['newChallengeName'] = $newChallenge->getName();
    }
    self::notifyAll('unlockChallengeSlot', clienttranslate('${player_name} unlocks challenge slot ${newSlots}'), $data);
  }

  /**
   * Notify that a player placed a tile in the Capital
   * @param Player $player Player who placed the tile
   * @param array<mixed> $tile Tile data
   */
  public static function placeInCapital(Player $player, array $tile): void
  {
    self::notifyAll('placeInCapital', clienttranslate('${player_name} places a tile in the Capital'), [
      'player' => $player,
      'tile' => $tile,
    ]);
  }

  /**
   * Notify that a player paid a stone for Capital
   * @param Player $player Player who paid
   * @param int $amount Amount paid
   */
  public static function payStoneForCapital(Player $player, int $amount): void
  {
    self::notifyAll('payStoneForCapital', clienttranslate('${player_name} pays ${amount} stone(s) for placing in Capital'), [
      'player' => $player,
      'amount' => $amount,
    ]);
  }

  /**
   * Notify that a Divine Altar was placed in the Capital
   * @param Player $player Player who placed the altar
   * @param string $color Altar color
   * @param int $x X coordinate
   * @param int $y Y coordinate
   * @param int $z Z coordinate
   */
  public static function placeDivineAltar(Player $player, string $color, int $x, int $y, int $z): void
  {
    self::notifyAll('placeDivineAltar', clienttranslate('${player_name} places a Divine Altar of ${color} in the Capital'), [
      'player' => $player,
      'color' => $color,
      'x' => $x,
      'y' => $y,
      'z' => $z,
    ]);
  }

  /**
   * Notify that a construction card was completed
   * @param Player $player Player who completed the card
   * @param object $card Card that was completed
   * @param bool $isArchitect Whether the architect also completed the card
   */
  public static function completeCard(Player $player, object $card, bool $isArchitect = false): void
  {
    $msg = $isArchitect
      ? clienttranslate('As a result, ${player_name} also completes construction card "${card_name}" and get one single tile')
      : clienttranslate('${player_name} completes construction card "${card_name}"');
    self::notifyAll('completeCard', $msg, [
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

  /**
   * Automatically adds standard fields about player and/or card
   * @param array<mixed> &$data Data to update (passed by reference)
   */
  protected static function updateArgs(array &$data): void
  {
    if (isset($data['player'])) {
      $data['player_name'] = $data['player']->getName();
      $data['player_id'] = $data['player']->getId();
      unset($data['player']);
    }
  }
}
