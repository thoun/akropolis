<?php

namespace Bga\Games\Akropolis\PantheonChallenges;

use Bga\Games\Akropolis\Models\Player;

class Orchard extends Challenge
{
    public function __construct($row = null)
    {
        parent::__construct($row);
        $this->id = 'Orchard';
        $this->name = clienttranslate('Orchard');
        $this->description = clienttranslate('Surround 1 <GARDEN>');
        $this->color = GARDEN;
    }

    public function isSatisfiedWithTile(Player $player, array $tile): bool
    {
        $board = $player->board();
        return false;
    }
}
