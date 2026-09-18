<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class Villa extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'Villa';
    $this->name = clienttranslate('Villa');
    $this->desc = clienttranslate('4 <HOUSE> on second level or above');
  }

  // Testée
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $highHouses = 0;
    $cells = $board->getVisibleBuiltCells();
    foreach ($cells as $cell) {
      if ($cell['z'] < 1) continue;

      $types = array_keys($board->getTypesAtPos($cell));
      if (in_array(HOUSE, $types)) {
        $highHouses++;
      }
    }

    return $highHouses >= 4;
  }
}
