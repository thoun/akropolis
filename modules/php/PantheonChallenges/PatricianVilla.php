<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class PatricianVilla extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'PatricianVilla';
        $this->name = clienttranslate('Patrician Villa');
        $this->description = clienttranslate('Place 1 <HOUSE> higher and adjacent to 1 <HOUSE> on a higher level');
        $this->color = HOUSE;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
