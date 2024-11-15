<?php

namespace AKR\Models;

use AKR\Managers\Tiles;
use AKR\Managers\Players;
use AKR\Helpers\UserException;
use AKR\Helpers\Utils;
use AKR\Helpers\Collection;
use AKR\Core\Globals;
use AKR\Core\Stats;

/*
 * Board: all utility functions concerning a player Board
 */


// Each direction also corresponds to 1 triangle of the hex
const DIRECTIONS = [
  ['x' => -1, 'y' => -1],
  ['x' => 0, 'y' => -2],
  ['x' => 1, 'y' => -1],
  ['x' => 1, 'y' => 1],
  ['x' => 0, 'y' => 2],
  ['x' => -1, 'y' => 1],
];


class TriangulatedBoard
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
    $liveScoring = Globals::isLiveScoring();
    return [
      'tiles' => $this->tiles->toArray(),
      'scores' => $liveScoring ? $this->getScores() : null,
    ];
  }

  public function getScores()
  {
    $scores = [
      'districts' => $this->getDistrictSizes(),
      'stars' => $this->getPlazaStars(),
    ];

    // VERY SPECIFIC CASE : AUTOMA CANNOT DOUBLE MARKET MORE THAN 3*PLAZA
    if ($this->pId == \ARCHITECT_ID && Globals::isVariant(MARKET)) {
      // How many markets and plaza do we have ?
      $mult = $this->player->getLvl() == 2 ? 2 : 1;
      $nMarkets = $scores['districts'][MARKET] / (2 * $mult); // 2 * $mult because we doubled them all...
      $nPlazas = $scores['stars'][\MARKET_PLAZA] / PLAZAS_MULT[MARKET_PLAZA];
      // Cap the doubled markets
      $nDoubledMarkets = min(3 * $nPlazas, $nMarkets);
      $maxMarkets = $mult * (2 * $nDoubledMarkets + max(0, $nMarkets - $nDoubledMarkets));
      $scores['districts'][MARKET] = min($scores['districts'][MARKET], $maxMarkets);
    }

    $scores['score'] = $this->computeScore($scores);
    return $scores;
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
  protected $tiles = null;
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
   * protected addTileAux: add the individual hexes of a tile to the board
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
    $tile = Tiles::add($tileId, $this->pId, $pos, $rotation);
    $this->tiles[$tileId] = $tile;
    $this->addTileAux($tile);

    $bonus = 0;
    $geometry = $this->getTileGeometry($tile);
    foreach ($this->getCoveredHexes($geometry, $pos, $rotation) as $cell) {
      $cell['z']--;
      $types = array_keys($this->getTypesAtPos($cell, false, false));
      if ($cell['z'] >= 0 && in_array(QUARRY, $types)) {
        $bonus++;
      }
    }
    if ($bonus > 0 && $this->pId != \ARCHITECT_ID) {
      Stats::incMoneyEarned($this->player, $bonus);
    }

    return $bonus;
  }

  /**
   * getTileGeometry : return the geometry associated to a tile
   *  => distinguish 3-tiles from 1-tile by looking at number of hexes currently, 
   *    but could be used for more complex shapes
   */
  public function getTileGeometry($tile)
  {
    $nHexes = count($tile['hexes']);
    return TILE_GEOMETRIES[$nHexes];
  }

  /**
   * getCoveredHexes: given a position and rotation, return the list of hexes that would be covered by the tile placed that way
   */
  public function getCoveredHexes($geometry, $pos, $rotation)
  {
    $hexes = [];
    foreach ($geometry as $delta) {
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
    $geometry = $this->getTileGeometry($tile);
    return $this->getCoveredHexes($geometry, self::extractPos($tile), $tile['r']);
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
  public function isValidOption($geometry, $pos, $rotation)
  {
    $touchExisting = false;
    $cells = $this->getCoveredHexes($geometry, $pos, $rotation);
    $coveredTileIds = [];
    foreach ($cells as $cell) {
      if ($this->isCellBuilt($cell)) {
        return false;
      }

      // Ground 0 => one of the cells must touch existing tiles
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
        $coveredTileIds[] = $this->getTileIdAtPos($cellBelow);
        $touchExisting = true;
      }
    }

    // Must touch existing tile
    if (!$touchExisting) {
      return false;
    }

    // Z > 0 : check also that this is not covering only a single tile
    $coveredTileIds = array_unique($coveredTileIds);
    if (count($coveredTileIds) == 1) {
      $tileId = $coveredTileIds[0]; // Handle starting tile with id = -1...
      $coveredGeometry = $tileId == -1 ? TILE_GEOMETRY : $this->getTileGeometry($this->tiles[$tileId]);
      // Single tile can cover only one tile, EXCEPT IF IT'S A SINGLE TILE
      if (count($geometry) > 1 || count($coveredGeometry) == 1) {
        return false;
      }
    }

    return true;
  }

  /**
   * getPlacementOptions: return all the possible positions to place a new tile
   */
  public function getPlacementOptions($hex, $geometry)
  {
    $options = [];
    $cells = $this->getCellsAsDist($this->getBuiltCells(), 2);
    foreach ($cells as $cell) {
      $pos = $this->getMaxHeightAtPos($cell);
      $rotations = [];
      for ($r = 0; $r < 6; $r++) {
        $realPos = $this->getCorrespondingPos($geometry, $pos, $r, $hex);
        if ($this->isValidOption($geometry, $realPos, $r)) {
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

  public function getCorrespondingPos($geometry, $pos, $r, $hex)
  {
    $hexOffset = self::getRotatedHex(['x' => -$geometry[$hex][0], 'y' => -$geometry[$hex][1]], $r);
    return [
      'x' => $pos['x'] + $hexOffset['x'],
      'y' => $pos['y'] + $hexOffset['y'],
      'z' => $pos['z'],
    ];
  }

  /**
   * isCellBuilt: given an hex, is there something here already
   */
  public function isCellBuilt($cell)
  {
    return !is_null($this->grid[$cell['x']][$cell['y']][$cell['z']] ?? null);
  }

  /**
   * getTypesAtPos: return the type(s) of hex at a given cell
   */
  public function getTypesAtPos($cell, $nullIfEmpty = false, $maxHeight = true)
  {
    if ($maxHeight) {
      $cell = $this->getMaxHeightAtPos($cell, false);
    }
    $type = $this->grid[$cell['x']][$cell['y']][$cell['z']] ?? null;
    if (is_null($type)) {
      return $nullIfEmpty ? null : [FREE => [0, 1, 2, 3, 4, 5]];
    }

    $types = [];
    // Hex with only one type
    if (!is_array($type)) {
      $types[$type] = [0, 1, 2, 3, 4, 5];
    }
    // Dual tiles
    else {
      $tile = $this->tiles[$this->getTileIdAtPos($cell)];
      $rotation = $tile['r'];
      // Compute set of triangles for each type on the tile
      foreach ($type as $i => $t) {
        $triangles = [];
        for ($j = 0; $j < 3; $j++) {
          $triangles[] = (3 * $i + $j + $rotation) % 6;
        }
        $types[$t] = $triangles;
      }
    }

    return $types;
  }

  /**
   * getTileIdAtPos: return the tile id of hex at a given cell
   */
  public function getTileIdAtPos($cell)
  {
    return $this->gridTileIds[$cell['x']][$cell['y']][$cell['z']] ?? null;
  }

  /**
   * getMaxHeightAtPos: return the maxium built at a given $x,$y cell
   */
  public function getMaxHeightAtPos($cell, $increaseZ = true)
  {
    $column = $this->grid[$cell['x']][$cell['y']] ?? [];
    $heights = array_keys($column);
    $cell['z'] = empty($heights) ? 0 : max($heights) + 1;
    if (!$increaseZ) {
      $cell['z']--;
    }
    return $cell;
  }

  //////////////////////////////////
  //  ____
  // / ___|  ___ ___  _ __ ___
  // \___ \ / __/ _ \| '__/ _ \
  //  ___) | (_| (_) | | |  __/
  // |____/ \___\___/|_|  \___|
  //////////////////////////////////
  public function computeScore($scores)
  {
    $map = [
      BARRACK => \BARRACK_PLAZA,
      MARKET => \MARKET_PLAZA,
      TEMPLE => \TEMPLE_PLAZA,
      HOUSE => \HOUSE_PLAZA,
      GARDEN => \GARDEN_PLAZA,
      QUARRY => QUARRY,
    ];
    $statMap = [
      BARRACK => 'Barracks',
      MARKET => 'Markets',
      TEMPLE => 'Temples',
      HOUSE => 'Houses',
      GARDEN => 'Gardens',
    ];

    $score = 0;
    foreach ($scores['districts'] as $type => $size) {
      $multiplier = $scores['stars'][$map[$type]];
      $partialScore = $size * $multiplier;
      $score += $partialScore;

      if ($this->pId != \ARCHITECT_ID) {
        // Set value stat
        $statName = 'set' . $statMap[$type] . 'DistrictValue';
        Stats::$statName($this->player, $size);

        // Set multiplier stat
        $statName = 'set' . $statMap[$type] . 'PlazaMultiplier';
        Stats::$statName($this->player, $multiplier);

        // Set visible plaza stat
        // $statName = 'set' . $statMap[$type] . 'PlazaVisibleTiles';
        // Stats::$statName($this->player, $multiplier / PLAZAS_MULT[$map[$type]]);

        // Set score stat
        $statName = 'set' . $statMap[$type] . 'Score';
        Stats::$statName($this->player, $partialScore);
      }
    }

    // Score stones
    $statuses = Globals::getAthenaCardStatuses()[$this->pId] ?? [];
    $hasAthena = count($statuses) == 4;

    $money = $this->player->getMoney();
    $score += ($hasAthena ? 5 : 1) * $money;
    if ($this->pId != \ARCHITECT_ID) {
      Stats::setMoneyLeft($this->player, $money);
      Stats::setScore($this->player, $score);
    }

    return $score;
  }

  public function getPlazaStars()
  {
    $plazas = [];
    foreach (PLAZAS as $plaza) {
      $plazas[$plaza] = 0;
    }

    foreach ($this->getVisibleBuiltCells() as $cell) {
      foreach ($this->getTypesAtPos($cell) as $type => $triangles) {
        if (in_array($type, PLAZAS)) {
          $plazas[$type]++;
        }
      }
    }

    // Multiply by nbr of stars
    foreach (PLAZAS as $plaza) {
      $plazas[$plaza] *= \PLAZAS_MULT[$plaza];
    }

    // ARCHITECT => score 2 per quarry
    if ($this->pId == \ARCHITECT_ID) {
      $plazas[QUARRY] = 2;
    }

    return $plazas;
  }

  public function getDistrictSizes()
  {
    $districts = [];
    foreach (\DISTRICTS as $district) {
      $districts[$district] = 0;
    }

    list($cells, $components, $marks) = $this->computeComponents();
    foreach ($cells as $cell) {
      foreach ($this->getTypesAtPos($cell) as $type => $triangles) {
        if ($type == FREE) continue;

        // Handle ARCHITECT scoring here
        if ($this->pId == ARCHITECT_ID) {
          if (in_array($type, \DISTRICTS)) {
            $districts[$type] += $this->player->getLvl() == 2 ? 2 : 1;
          } elseif ($type == QUARRY && $this->player->getLvl() == 1) {
            $districts[QUARRY] = ($districts[QUARRY] ?? 0) + 1;
          }
          continue;
        }

        $double = false;
        if (!in_array($type, \DISTRICTS) || $type == HOUSE) {
          continue; // Don't care about plazas and quarries, and house will be treated later
        }
        $neighbours = $this->getNeighbours($cell, true, $triangles);
        $builtNeighbours = $this->getBuiltNeighbours($cell, $triangles);

        // Market : dont score market if adjacent to other marker
        if ($type == MARKET) {
          $nextToMarket = false;
          $nextToPlaza = false;
          foreach ($builtNeighbours as $pos) {
            foreach ($this->getTypesAtPos($pos) as $type2 => $triangles2) {
              if ($this->areCellsTrianglesAdjacent($cell, $triangles, $pos, $triangles2)) {
                $nextToPlaza = $nextToPlaza || $type2 == MARKET_PLAZA;
                $nextToMarket = $nextToMarket || $type2 == MARKET;
              }
            }
          }

          if ($nextToMarket) {
            continue;
          }
          // MARKET VARIANT : double size if adjacent to PLAZA
          if (Globals::isVariant(MARKET) && $nextToPlaza) {
            $double = true;
          }
        }
        // Dont score barracks if not on the edge
        elseif ($type == BARRACK) {
          // We must count empty cells ourselves to avoid Lake...
          $emptyCells = 0;
          foreach ($neighbours as $pos) {
            $uid = self::getCellId($pos) . "_" . FREE; // We are looking for empty cells
            if (!$this->isCellBuilt($pos) && ($marks[$uid] ?? 0) === 1) {
              $emptyCells++;
            }
          }

          if ($emptyCells == 0) {
            continue;
          }

          // BARRACK VARIANT : double size if 3 or 4 empty neighbours
          if (Globals::isVariant(BARRACK) && $emptyCells >= 3) {
            $double = true;
          }
        }
        // Dont score temple if not fully built around
        elseif ($type == TEMPLE) {
          if (count($builtNeighbours) < count($triangles)) {
            continue;
          }

          // TEMPLE VARIANT : double size if height > 1
          if ($cell['z'] > 0 && Globals::isVariant(TEMPLE)) {
            $double = true;
          }
        }
        // GARDEN VARIANT : double size if adjacent to lakes
        elseif ($type == GARDEN && Globals::isVariant(GARDEN)) {
          // count Lakes
          $lakes = 0;
          foreach ($neighbours as $pos) {
            $uid = self::getCellId($pos) . "_" . FREE; // We are looking for empty cells
            if (!$this->isCellBuilt($pos) && ($marks[$uid] ?? 0) !== 1) {
              $lakes++;
            }
          }

          if ($lakes > 0) {
            $double = true;
          }
        }

        $districts[$type] += ($cell['z'] + 1) * ($double ? 2 : 1);
      }
    }

    // SCORE BIGGEST HOUSE
    $maxNTiles = 0;
    foreach ($components as $component) {
      if ($component['type'] != HOUSE) {
        continue;
      }
      $size = $component['size'];
      // HOUSE VARIANT : double the point of house is more than 10
      if (Globals::isVariant(HOUSE) && $size >= 10) {
        $size *= 2;
      }

      $nTiles = count($component['cells']);
      if ($nTiles >= $maxNTiles) {
        $districts[HOUSE] = max($districts[HOUSE], $size);
        $maxNTiles = max($maxNTiles, $nTiles);
      }
    }

    // HANDLE VARIANTS FOR ARCHITECT
    if ($this->pId == ARCHITECT_ID) {
      foreach (\DISTRICTS as $type) {
        if (!Globals::isVariant($type)) {
          continue;
        }

        // Only double the houses if more than 10 in size
        if ($type == HOUSE && $districts[HOUSE] < 10) {
          continue;
        }
        // Only double temple if they arent at ground lvl <=> hard mode
        if ($type == TEMPLE && $this->player->getLvl() < 2) {
          continue;
        }

        $districts[$type] *= 2;
      }
    }

    return $districts;
  }

  public function computeComponents()
  {
    $cells = $this->getVisibleBuiltCells();

    // To detect outside zone, find "rectangle" that contains the all board
    $minX = 0;
    $maxX = 0;
    $minY = 0;
    $maxY = 0;
    foreach ($cells as $cell) {
      $minX = min($minX, $cell['x']);
      $maxX = max($maxX, $cell['x']);
      $minY = min($minY, $cell['y']);
      $maxY = max($maxY, $cell['y']);
    }
    $minX--;
    $maxX++;
    $minY -= 2;
    $maxY += 2;

    // Now add one of this exterior cell as first cell to treat
    array_unshift($cells, ['x' => $minX, 'y' => $minX % 2 == 0 ? 0 : 1, 'z' => 0]);

    $marks = [];
    $components = [];
    $mark = 1;
    foreach ($cells as $cell) {
      $queue = [$cell];
      $types = $this->getTypesAtPos($cell);
      foreach ($types as $type => $triangles) {
        // Mark now also includes the type to work with dual tiles
        $uid = self::getCellId($cell) . "_" . $type;
        if (isset($marks[$uid])) {
          continue;
        }

        $component = [];
        $size = 0;
        while (!empty($queue)) {
          $cell = array_pop($queue);
          $uid = self::getCellId($cell) . "_" . $type;
          if (isset($marks[$uid])) {
            continue;
          }
          $marks[$uid] = $mark;
          $component[] = $cell;
          $size += $cell['z'] + 1;

          // Get triangles
          $triangles = $this->getTypesAtPos($cell)[$type];
          foreach (self::getNeighbours($cell, $triangles) as $pos) {
            if ($pos['x'] < $minX || $pos['x'] > $maxX || $pos['y'] < $minY || $pos['y'] > $maxY) {
              continue;
            }

            $pos = $this->getMaxHeightAtPos($pos, false);
            $pos['z'] = max(0, $pos['z']);
            foreach ($this->getTypesAtPos($pos) as $type2 => $triangles2) {
              if ($type2 == $type && $this->areCellsTrianglesAdjacent($cell, $triangles, $pos, $triangles2)) {
                $queue[] = $pos;
              }
            }
          }
        }

        $components[] = [
          'type' => $type,
          'cells' => $component,
          'size' => $size,
        ];
        $mark++;
      }
    }

    return [$cells, $components, $marks];
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

  public function getVisibleBuiltCells()
  {
    $cells = [];
    foreach ($this->grid as $x => $row) {
      foreach ($row as $y => $column) {
        $z = max(array_keys($column));
        $cells[] = ['x' => $x, 'y' => $y, 'z' => $z];
      }
    }
    return $cells;
  }

  public function getBuiltNeighbours($cell, $directions = null)
  {
    $cells = [];
    foreach (self::getNeighbours($cell, false, $directions) as $cell) {
      $cell = $this->getMaxHeightAtPos($cell, false);
      if ($cell['z'] >= 0) {
        $cells[] = $cell;
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

  public function getNeighbours($cell, $projectAtZ0 = false, $directions = null)
  {
    $cells = [];
    foreach (($directions ?? [0, 1, 2, 3, 4, 5]) as $d) {
      $dir = DIRECTIONS[$d];
      $newCell = [
        'x' => $cell['x'] + $dir['x'],
        'y' => $cell['y'] + $dir['y'],
        'z' => $projectAtZ0 ? 0 : $cell['z'],
      ];
      $cells[] = $newCell;
    }
    return $cells;
  }

  public function isAdjacent($source, $target, $directions = null)
  {
    $neighbours = $this->getNeighbours($source, false, $directions);
    foreach ($neighbours as $pos) {
      if ($this->getDistance($pos, $target) == 0) {
        return true;
      }
    }
    return false;
  }

  public function areCellsTrianglesAdjacent($cell1, $triangles1, $cell2, $triangles2)
  {
    return $this->isAdjacent($cell1, $cell2, $triangles1) && $this->isAdjacent($cell2, $cell1, $triangles2);
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

  public function getDistance($hex1, $hex2)
  {
    $deltaX = abs($hex1['x'] - $hex2['x']);
    $deltaY = abs($hex1['y'] - $hex2['y']);
    return $deltaX + max(0, ($deltaY - $deltaX) / 2);
  }
}
