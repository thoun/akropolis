<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class Suburb extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'Suburb';
        $this->name = clienttranslate('Suburb');
        $this->description = clienttranslate('Have 4 <HOUSE> connected along the edge');
        $this->color = HOUSE;
    }

    public function isSatisfied(Player $player): bool
    {
        $board = $player->board();
        return false;
    }
}
