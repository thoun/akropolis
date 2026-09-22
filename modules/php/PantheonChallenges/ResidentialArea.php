<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Challenge;
use Bga\Games\Akropolis\Models\Player;

class ResidentialArea extends Challenge
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'ResidentialArea';
    $this->name = clienttranslate('Residential Area');
    $this->description = clienttranslate('Place 1 <HOUSE> on a higher level that connects 2 <HOUSE> lowers');
    $this->color = HOUSE;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    $board = $player->board();

    // Check that the tile was not placed at level 0
    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      if ($cell['z'] == 0) {
        return false;
      }
    }

    return $this->isConnectingTwoOtherHex($player, $tile, HOUSE);
  }
}
