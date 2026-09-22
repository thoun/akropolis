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

  /**
   * Check if placing this tile connects at least 2 hexes of the given type
   * @param Player $player The player
   * @param array $tile The tile being placed
   * @param string $type The type to check (e.g., TEMPLE, BARRACK)
   * @return bool True if the tile connects at least 2 hexes of the given type
   */
  protected function isConnectingTwoOtherHex(Player $player, array $tile, string $type): bool
  {
    $board = $player->board();

    // Compute connected components for the type, excluding the placed tile
    list(, $components, $marks) = $board->computeTypeComponents($type, $tile['id']);

    // For each hex of the given type in the placed tile, check its built neighbours
    foreach ($board->getTileCoveredHexes($tile) as $cell) {
      foreach ($board->getTypesAtPos($cell) as $cellType => $triangles) {
        if ($cellType != $type) continue;

        // Get built neighbours
        $componentIds = [];
        $builtNeighbours = $board->getBuiltNeighbours($cell, $triangles);

        foreach ($builtNeighbours as $neighbour) {
          foreach ($board->getTypesAtPos($neighbour) as $neighbourType => $neighbourTriangles) {
            if ($neighbourType != $type) continue;

            // Get the component ID for this cell
            $neighbourUid = TriangulatedBoard::getCellId($neighbour) . '_' . $type;
            $componentId = $marks[$neighbourUid] ?? null;

            if ($componentId !== null && !in_array($componentId, $componentIds)) {
              $componentIds[] = $componentId;
            }
          }
        }

        // If this hex connects at least 2 different components, the challenge is satisfied
        if (count($componentIds) >= 2) {
          return true;
        }
      }
    }

    return false;
  }
}
