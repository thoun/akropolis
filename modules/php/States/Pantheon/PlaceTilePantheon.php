<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\States\Pantheon;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Core\Notifications;
use Bga\Games\Akropolis\Core\Stats;
use Bga\Games\Akropolis\Managers\Players;
use Bga\Games\Akropolis\Managers\Tiles;
use Bga\Games\Akropolis\Managers\PantheonChallenges;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\VisibleSystemException;
use Bga\Games\Akropolis\Game;
use Bga\Games\Akropolis\Helpers\Utils;

/**
 * PlaceTilePantheon State
 * Player must place a tile in their city or in the Capital
 */
class PlaceTilePantheon extends PantheonGameState
{
  /**
   * PlaceTilePantheon constructor
   * @param Game $game Game instance
   */
  function __construct(protected Game $game)
  {
    parent::__construct(
      $game,
      id: ST_PLACE_TILE_PANTHEON,
      type: StateType::ACTIVE_PLAYER,
      name: 'placeTilePantheon',
      description: clienttranslate('${actplayer} must place a tile in their city or in the Capital'),
      descriptionMyTurn: clienttranslate('${you} must play a tile in your city or in the Capital'),
      transitions: [
        'tilePlaced' => ST_PANTHEON_CHOOSE_ACTION,
        'askMoney' => ST_ASK_MONEY_PANTHEON,
        'end' => ST_PRE_END_OF_GAME,
      ],
    );
  }

  /**
   * Get arguments for the state
   * @param int $activePlayerId Active player ID
   * @return array{cityOptions: array, capitalOptions: array, canSendToCapital: bool, tileIds: array, completableChallenges: Collection} State arguments
   */
  public function getArgs(int $activePlayerId): array
  {
    $player = Players::getActive();
    $capital = Players::getCapital();

    $geometry = \TILE_GEOMETRIES[3];
    $cityOptions = [];
    $capitalOptions = [];

    for ($hex = 0; $hex < 3; $hex++) {
      $cityOptions[$hex] = $player->board()->getPlacementOptions($hex, $geometry);
      $capitalOptions[$hex] = $capital->board()->getPlacementOptions($hex, $geometry);
    }

    // Available tiles from player's hand
    $hand = Tiles::getPlayerHand($activePlayerId);
    $tileIds = $hand->getIds();

    return [
      'cityOptions' => $cityOptions,
      'capitalOptions' => $capitalOptions,
      'canSendToCapital' => $player->getMoney() >= 1,
      'tileIds' => $tileIds,
      'commonArgs' => $this->getPantheonArgs($activePlayerId),
    ];
  }

  #[PossibleAction]
  public function actPlaceTileInCity(int $tileId, int $hex, int $x, int $y, int $z, int $r): string
  {
    $pos = ['x' => $x, 'y' => $y, 'z' => $z];
    $player = Players::getActive();

    // Sanity checks
    $args = $this->getArgs($player->getId());
    if (!in_array($tileId, $args['tileIds'])) {
      throw new VisibleSystemException('Cannot place this tile. Should not happen');
    }

    $tile = Tiles::getSingle($tileId);

    // Check position : always go back to top left hex on tile
    $geometry = $player->board()->getTileGeometry($tile);
    $realPos = $player->board()->getCorrespondingPos($geometry, $pos, $r, $hex);

    $optionId = Utils::search($args['cityOptions'][0], function ($option) use ($realPos) {
      return Utils::compareZones($option, $realPos) == 0;
    });

    if ($optionId === false) {
      throw new VisibleSystemException('Impossible hex. Should not happen');
    }

    // Check rotation
    $option = $args['cityOptions'][0][$optionId];
    if (!in_array($r, $option['r'])) {
      throw new VisibleSystemException('Impossible rotation. Should not happen');
    }

    // Place the tile
    Tiles::placeTile($player, $tileId, $hex, $pos, $r);

    return 'tilePlaced';
  }

  #[PossibleAction]
  public function actPlaceTileInCapital(int $tileId, int $hex, int $x, int $y, int $z, int $r): string
  {
    $pos = ['x' => $x, 'y' => $y, 'z' => $z];
    $player = Players::getActive();
    $capital = Players::getCapital();

    // Sanity checks
    if ($player->getMoney() < 1) {
      throw new VisibleSystemException('Not enough stones to place in Capital');
    }

    $args = $this->getArgs($player->getId());
    if (!in_array($tileId, $args['tileIds'])) {
      throw new VisibleSystemException('Cannot place this tile. Should not happen');
    }

    $tile = Tiles::getSingle($tileId);

    // Check position : always go back to top left hex on tile
    $geometry = $capital->board()->getTileGeometry($tile);
    $realPos = $capital->board()->getCorrespondingPos($geometry, $pos, $r, $hex);

    $optionId = Utils::search($args['capitalOptions'][0], function ($option) use ($realPos) {
      return Utils::compareZones($option, $realPos) == 0;
    });

    if ($optionId === false) {
      throw new VisibleSystemException('Impossible hex. Should not happen');
    }

    // Check rotation
    $option = $args['capitalOptions'][0][$optionId];
    if (!in_array($r, $option['r'])) {
      throw new VisibleSystemException('Impossible rotation. Should not happen');
    }

    // Place the tile
    Tiles::placeTile($player, $tileId, $hex, $pos, $r, false, true);

    return 'tilePlaced';
  }

  public function zombie(int $playerId): string
  {
    // Simple zombie: just skip
    return 'next';
  }
}
