<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class PopulationExpansion extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'PopulationExpansion';
        $this->name = clienttranslate('Population Expansion');
        $this->description = clienttranslate('Place 1 <HOUSE> adjacent to 4 <HOUSE>');
        $this->color = HOUSE;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        return false;
    }
}
