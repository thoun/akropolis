<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class Garrison extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'Garrison';
        $this->name = clienttranslate('Garrison');
        $this->description = clienttranslate('Place 1 <BARRACK> to connect 2 <BARRACK>');
        $this->color = BARRACK;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
