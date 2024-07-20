<?php

namespace AKR\States;

use AKR\Core\Globals;
use AKR\Core\Notifications;
use AKR\Managers\Players;
use AKR\Managers\Tiles;
use AKR\Helpers\Utils;

trait ArchitectTurnTrait
{
  public function stArchitectTurn()
  {
    $architect = Players::getArchitect();
    $geometry = TILE_GEOMETRIES[3];
    $options = $architect->board()->getPlacementOptions(0, $geometry);

    // Keep only options at ground level
    Utils::filter($options, function ($option) {
      return $option['z'] == 0;
    });

    // Keep the closest one to the center
    $min = null;
    $minOption = null;
    foreach ($options as $option) {
      $dist = abs($option['x']) + abs($option['y']);
      if (is_null($min) || $dist < $min) {
        $min = $dist;
        $minOption = $option;
      }
    }

    // Find the tile
    $tiles = Tiles::getInLocation('dock')->order(function ($tile1, $tile2) {
      return $tile1['state'] - $tile2['state'];
    });
    $tilesWithPlaza = $tiles->filter(function ($tile) use ($architect) {
      return $tile['state'] <= $architect->getMoney() && count(array_intersect(PLAZAS, $tile['hexes'])) > 0;
    });

    if ($tilesWithPlaza->empty()) {
      $tileId = $tiles->first()['id'];
      Notifications::automataDelay($architect, clienttranslate('${player_name} takes the first City tile from the Construction Site'));
    } else {
      $tileId = $tilesWithPlaza->first()['id'];
      Notifications::automataDelay($architect, clienttranslate('${player_name} takes cheapest City tile with a Plaza'));
    }

    $this->actPlaceTileAux($architect, $tileId, 0, $minOption, $minOption['r'][0]);
  }
}
