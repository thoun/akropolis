<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class GodsPromenade extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'GodsPromenade';
        $this->name = clienttranslate('Gods Promenade');
        $this->description = clienttranslate('Place 1 <GARDEN> adjacent to 1 <GARDEN>');
        $this->color = GARDEN;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
