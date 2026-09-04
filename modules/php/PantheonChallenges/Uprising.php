<?php

namespace AKR\PantheonChallenges;

use AKR\Models\Player;

class Uprising extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'Uprising';
        $this->name = clienttranslate('Uprising');
        $this->description = clienttranslate('Have 4 <BARRACK> along the edge');
        $this->color = BARRACK;
    }

    public function isSatisfied(Player $player): bool
    {
        $board = $player->board();
        return false;
    }
}
