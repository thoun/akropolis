<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class BustlingTrade extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'BustlingTrade';
        $this->name = clienttranslate('Bustling Trade');
        $this->description = clienttranslate('Have 5 isolated <MARKET>');
        $this->color = MARKET;
    }

    public function isSatisfied(Player $player): bool
    {
        return false;
    }
}
