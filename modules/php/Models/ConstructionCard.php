<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Models;

/*
 * ConstructionCard
 */

class ConstructionCard extends \Bga\Games\Akropolis\Helpers\DB_Model
{
  protected string $table = 'construction-cards';
  protected string $primary = 'card_id';
  protected array $attributes = [
    'id' => 'card_id',
    'location' => 'card_location',
    'state' => ['card_state', 'int'],
  ];
  protected string $id;
  protected string $location;
  protected int $state;

  protected array $staticAttributes = [['name', 'str'], ['desc', 'str']];
  protected string $name = "";
  protected string $desc = "";

  /**
   * Check if card requirements are satisfied by player
   * @param Player $player Player to check
   * @return bool True if card can be completed
   */
  public function isSatisfied(Player $player): bool
  {
    return false;
  }
}
