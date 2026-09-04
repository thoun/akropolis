<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class ForeignTrade extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'ForeignTrade';
        $this->name = clienttranslate('Foreign Trade');
        $this->description = clienttranslate('Place 1 <MARKET> on the edge that is 1 hex from 1 <MARKET> on the edge');
        $this->color = MARKET;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
