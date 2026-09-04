<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class LookoutTower extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'LookoutTower';
        $this->name = clienttranslate('Lookout Tower');
        $this->description = clienttranslate('Place 1 <BARRACK> on a higher level and along the edge');
        $this->color = BARRACK;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
