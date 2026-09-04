<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class RareCommodities extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'RareCommodities';
        $this->name = clienttranslate('Rare Commodities');
        $this->description = clienttranslate('Place 1 <MARKET> on a higher level that is 1 hex from 1 <MARKET> on a higher level');
        $this->color = MARKET;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
