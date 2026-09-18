<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\ConstructionCards;

use Bga\Games\Akropolis\Models\ConstructionCard;
use Bga\Games\Akropolis\Models\Player;

class GuardTower extends ConstructionCard
{
  public function __construct(?array $row = null)
  {
    parent::__construct($row);
    $this->id = 'GuardTower';
    $this->name = clienttranslate('Guard Tower');
    $this->desc = clienttranslate('2 <BARRACK> on 2nd level or above');
  }

  // Testée
  public function isSatisfied(Player $player): bool
  {
    $board = $player->board();
    $highBarracks = 0;
    $cells = $board->getVisibleBuiltCells();
    foreach ($cells as $cell) {
      if ($cell['z'] < 1) continue;

      $types = array_keys($board->getTypesAtPos($cell));
      if (in_array(BARRACK, $types)) {
        $highBarracks++;
      }
    }

    return $highBarracks >= 2;
  }
}
