<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class ReligiousFervor extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'ReligiousFervor';
        $this->name = clienttranslate('Religious Fervor');
        $this->description = clienttranslate('Have 3 <TEMPLE> surrounded');
        $this->color = TEMPLE;
    }

    public function isSatisfied(Player $player): bool
    {
        $board = $player->board();
        return false;
    }
}
