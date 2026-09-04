<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class Bastion extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'Bastion';
        $this->name = clienttranslate('Bastion');
        $this->description = clienttranslate('Place 1 <BARRACK> along the edge, adjacent to 1 <BARRACK> along the edge');
        $this->color = COLOR_RED;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
