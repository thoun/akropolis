<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class GrandTemple extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'GrandTemple';
        $this->name = clienttranslate('Grand Temple');
        $this->description = clienttranslate('Place 1 <TEMPLE> to connect 2 <TEMPLE>');
        $this->color = TEMPLE;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
