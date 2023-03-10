<?php
namespace AKR\Models;
use AKR\Managers\Tiles;
use AKR\Managers\Players;
use AKR\Helpers\UserException;
use AKR\Helpers\Utils;
use AKR\Helpers\Collection;

/*
 * Board: all utility functions concerning a Zoo Map
 */
const DIRECTIONS = [
  ['x' => -1, 'y' => -1],
  ['x' => 0, 'y' => -2],
  ['x' => 1, 'y' => -1],
  ['x' => 1, 'y' => 1],
  ['x' => 0, 'y' => 2],
  ['x' => -1, 'y' => 1],
];

class Board
{
  // CONSTRUCT
  protected $player = null;
  protected $pId = null;
  public function __construct($player = null)
  {
    if (!is_null($player)) {
      $this->player = $player;
      $this->pId = $player->getId();
      $this->fetchDatas();
    }
  }

  public function getUiData()
  {
    return [
      'grid' => $this->grid,
    ];
  }

  public function refresh()
  {
    $this->fetchDatas();
  }

  /**
   * Fetch DB for tiles and fill the grid
   */
  protected $grid = [];
  protected $gridTileIds = [];
  protected $tiles = [];
  protected function fetchDatas()
  {
    if ($this->player == null) {
      return;
    }

    $this->grid = [];
    $this->gridTileIds = [];

    // Starting tile
    $this->grid[0][0][0] = HOUSE_PLAZA;
    $this->grid[0][-2][0] = QUARRY;
    $this->grid[1][1][0] = QUARRY;
    $this->grid[-1][1][0] = QUARRY;
    $this->gridTileIds[0][0][0] = -1;
    $this->gridTileIds[0][-2][0] = -1;
    $this->gridTileIds[1][1][0] = -1;
    $this->gridTileIds[-1][1][0] = -1;

    // Placed tiles
    $this->tiles = Tiles::getOfPlayer($this->pId);
    foreach ($this->tiles as $tile) {
      $this->addTileAux($tile);
    }
  }

  /**
   * protected addTileAux: add the 3 individual hexes of a tile to the board
   */
  protected function addTileAux($tile)
  {
    foreach ($this->getTileCoveredHexes($tile) as $i => $hex) {
      $this->grid[$hex['x']][$hex['y']][$hex['z']] = $tile['hexes'][$i];
      $this->gridTileIds[$hex['x']][$hex['y']][$hex['z']] = $tile['id'];
    }
  }

  /**
   * addTile : add a tile at a given pos and rotation
   */
  public function addTile($tileId, $pos, $rotation)
  {
    $tile = Tiles::add($this->pId, $tileId, $pos, $rotation);
    $this->tiles[$$tileId] = $tile;
    $this->addTileAux($tile);
  }

  /**
   * getCoveredHexes: given a position and rotation, return the list of hexes that would be covered by the tile placed that way
   */
  public function getCoveredHexes($pos, $rotation)
  {
    $hexes = [];
    foreach (TILE_GEOMETRY as $delta) {
      $hexOffset = self::getRotatedHex(['x' => $delta[0], 'y' => $delta[1]], $rotation);
      $hex = [
        'x' => $pos['x'] + $hexOffset['x'],
        'y' => $pos['y'] + $hexOffset['y'],
        'z' => $pos['z'],
      ];
      $hexes[] = $hex;
    }

    return $hexes;
  }

  // Same thing for a given DB result representing a building
  public function getTileCoveredHexes($tile)
  {
    return $this->getCoveredHexes(self::extractPos($tile), $tile['rotation']);
  }

  /**
   * getCellsAtDist: return the list of cells at distance at most $k from a given list of cells
   *  => only the Z = 0 plane
   */
  protected function getCellsAsDist($cells, $k)
  {
    $neighbours = [];
    for ($i = 0; $i < $k; $i++) {
      foreach ($cells as $cell) {
        $neighbours = array_merge($neighbours, $this->getNeighbours($cell, true));
      }
      $neighbours = Utils::uniqueZones($neighbours);
      $cells = $neighbours;
    }

    return $neighbours;
  }

  /**
   * isValidOption: given a pos and rotation, can we place a tile here ?
   */
  public function isValidOption($pos, $rotation)
  {
    $touchExisting = false;
    $cells = $this->getCoveredHexes($pos, $rotation);
    $coveredTileIds = [];
    foreach ($cells as $cell) {
      if ($this->isCellBuilt($cell)) {
        return false;
      }

      // Ground 0 => one of the 3 cells must touch existing tiles
      if ($cell['z'] == 0) {
        foreach ($this->getNeighbours($cell) as $neighbour) {
          if ($this->isCellBuilt($neighbour)) {
            $touchExisting = true;
            break;
          }
        }
      }
      // Z > 0 => must be right above an existing tile
      else {
        $cellBelow = ['x' => $cell['x'], 'y' => $cell['y'], 'z' => $cell['z'] - 1];
        if (!$this->isCellBuilt($cellBelow)) {
          return false;
        }
        $coveredTileIds[] = $this->getTileIdAtPos($cellBellow);
        $touchExisting = true;
      }
    }

    // Z > 0 : check also that this is not covering only a single tile
    if (count($coveredTileIds) == 1) {
      return false;
    }

    return $touchExisting;
  }

  /**
   * getPlacementOptions: return all the possible positions to place a new tile
   */
  public function getPlacementOptions()
  {
    $options = [];
    $cells = $this->getCellsAsDist($this->getBuiltCells(), 2);
    foreach ($cells as $cell) {
      $pos = $this->getMaxHeightAtPos($cell);
      $rotations = [];
      for ($r = 0; $r < 6; $r++) {
        if ($this->isValidOption($pos, $r)) {
          $rotations[] = $r;
        }
      }

      if (!empty($rotations)) {
        $pos['r'] = $rotations;
        $options[] = $pos;
      }
    }

    return $options;
  }

  /**
   * isCellBuilt: given an hex, is there something here already
   */
  public function isCellBuilt($cell)
  {
    return !is_null($this->getTypeAtPos($cell));
  }

  /**
   * getTypeAtPos: return the type of hex at a given cell
   */
  public function getTypeAtPos($cell)
  {
    return $this->grid[$cell['x']][$cell['y']][$cell['z']] ?? null;
  }

  /**
   * getTypeAtPos: return the tile id of hex at a given cell
   */
  public function getTileIdAtPos($cell)
  {
    return $this->gridTileIds[$cell['x']][$cell['y']][$cell['z']] ?? null;
  }

  /**
   * getMaxHeightAtPos: return the maxium built at a given $x,$y cell
   */
  public function getMaxHeightAtPos($cell)
  {
    $column = $this->grid[$cell['x']][$cell['y']] ?? [];
    $heights = array_keys($column);
    $cell['z'] = empty($heights) ? 0 : max($heights);
    return $cell;
  }

  /////////////////////////////////////////////
  //   ____      _     _   _   _ _   _ _
  //  / ___|_ __(_) __| | | | | | |_(_) |___
  // | |  _| '__| |/ _` | | | | | __| | / __|
  // | |_| | |  | | (_| | | |_| | |_| | \__ \
  //  \____|_|  |_|\__,_|  \___/ \__|_|_|___/
  ////////////////////////////////////////////

  // NON STATIC
  public function getBuiltCells()
  {
    $cells = [];
    foreach ($this->grid as $x => $row) {
      foreach ($row as $y => $column) {
        foreach ($column as $z => $type) {
          $cells[] = ['x' => $x, 'y' => $y, 'z' => $z];
        }
      }
    }
    return $cells;
  }

  // STATIC
  public static function getCellId($hex)
  {
    return $hex['x'] . '_' . $hex['y'] . '_' . $hex['z'];
  }

  public static function getHexFromId($uid)
  {
    $coord = explode('_', $uid);
    return ['x' => $coord[0], 'y' => $coord[1], 'z' => $coord[2]];
  }

  public static function extractPos($building)
  {
    return [
      'x' => $building['x'],
      'y' => $building['y'],
      'z' => $building['z'],
    ];
  }

  protected function isCellValid($cell)
  {
    return isset($this->grid[$cell['x']][$cell['y']]);
  }

  public function getNeighbours($cell, $projectAtZ0 = false)
  {
    $cells = [];
    foreach (DIRECTIONS as $dir) {
      $newCell = [
        'x' => $cell['x'] + $dir['x'],
        'y' => $cell['y'] + $dir['y'],
        'z' => $projectAtZ0 ? 0 : $cell['z'],
      ];
      $cells[] = $newCell;
    }
    return $cells;
  }

  protected function getRotatedHex($hex, $rotation)
  {
    if ($rotation == 0 || ($hex['x'] == 0 && $hex['y'] == 0)) {
      return $hex;
    }

    $q = $hex['x'];
    $r = ($hex['y'] - $hex['x']) / 2;
    $cube = [$q, $r, -$q - $r];
    for ($i = 0; $i < $rotation; $i++) {
      $cube = [-$cube[1], -$cube[2], -$cube[0]];
    }
    return [
      'x' => $cube[0],
      'y' => 2 * $cube[1] + $cube[0],
    ];
  }

  protected function getDistance($hex1, $hex2)
  {
    $deltaX = abs($hex1['x'] - $hex2['x']);
    $deltaY = abs($hex1['y'] - $hex2['y']);
    return $deltaX + max(0, ($deltaY - $deltaX) / 2);
  }
}
