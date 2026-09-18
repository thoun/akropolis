<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Models;

use Bga\Games\Akropolis\Models\Player;

/**
 * Base Challenge class for Pantheon expansion
 * Each specific challenge extends this class and implements isSatisfied()
 */
class Challenge extends \Bga\Games\Akropolis\Helpers\DB_Model
{
  protected string $table = 'pantheon_challenges';
  protected string $primary = 'challenge_id';
  protected array $attributes = [
    'id' => ['challenge_id', 'str'],
    'location' => 'challenge_location',
    'state' => ['challenge_state', 'int'],
  ];

  // These will be set by each specific challenge
  protected string $id;
  protected string $location;
  protected int $state;
  protected string $name;
  protected string $description;
  protected string $color;

  public function getId(): string
  {
    return $this->id;
  }

  public function getName(): string
  {
    return $this->name;
  }

  public function getDescription(): string
  {
    return $this->description;
  }

  public function getColor(): string
  {
    return $this->color;
  }

  public function getLocation(): string
  {
    return $this->location;
  }

  /**
   * Main method that each challenge must implement
   * Checks if the player's board satisfies the challenge requirements
   */
  public function isSatisfied(Player $player): bool
  {
    return false;
  }

  public function isSatisfiedWithTile(Player $player, array $tile): bool
  {
    return false;
  }
}
