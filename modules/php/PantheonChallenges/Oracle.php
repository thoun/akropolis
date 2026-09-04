<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class Oracle extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'Oracle';
        $this->name = clienttranslate('Oracle');
        $this->description = clienttranslate('Place 1 <TEMPLE> on a higher level and surrounded');
        $this->color = TEMPLE;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
