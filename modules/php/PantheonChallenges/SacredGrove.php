<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class SacredGrove extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'SacredGrove';
        $this->name = clienttranslate('Sacred Grove');
        $this->description = clienttranslate('Place 1 <GARDEN> on a higher level');
        $this->color = GARDEN;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        return false;
    }
}
