<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class Neighborhood extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'Neighborhood';
        $this->name = clienttranslate('Neighborhood');
        $this->description = clienttranslate('Place 1 <HOUSE>, so that 2 <HOUSE> are surrounded');
        $this->color = HOUSE;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        return false;
    }
}
