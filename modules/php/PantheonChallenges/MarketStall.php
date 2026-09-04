<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class MarketStall extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'MarketStall';
        $this->name = clienttranslate('Market Stall');
        $this->description = clienttranslate('Place 1 tile, so that 1 <MARKET> is enclosed');
        $this->color = MARKET;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
