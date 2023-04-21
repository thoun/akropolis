<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Akropolis implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * stats.inc.php
 *
 * Akropolis game statistics description
 *
 */

require_once 'modules/php/constants.inc.php';

$stats_type = [
  // Statistics global to table
  'table' => [],

  // Statistics existing for each player
  'player' => [
    'position' => [
      'id' => STAT_STARTING_POSITION,
      'name' => totranslate('Starting position in first round'),
      'type' => 'int',
    ],

    'moneyLeft' => [
      'id' => STAT_MONEY_LEFT,
      'name' => totranslate('Stone left at the end of the game'),
      'type' => 'int',
    ],

    'housesDistrictValue' => [
      'id' => STAT_HOUSES_DISTRICT_VALUE,
      'name' => totranslate('Value of houses districts'),
      'type' => 'int',
    ],
    'housesPlazaMultiplier' => [
      'id' => STAT_HOUSES_PLAZA_MULTIPLIER,
      'name' => totranslate('Houses plazas multiplier'),
      'type' => 'int',
    ],
    'housesScore' => [
      'id' => STAT_HOUSES_SCORE,
      'name' => totranslate('Houses victory points'),
      'type' => 'int',
    ],

    'marketsDistrictValue' => [
      'id' => STAT_MARKETS_DISTRICT_VALUE,
      'name' => totranslate('Value of markets districts'),
      'type' => 'int',
    ],
    'marketsPlazaMultiplier' => [
      'id' => STAT_MARKETS_PLAZA_MULTIPLIER,
      'name' => totranslate('Markets plazas multiplier'),
      'type' => 'int',
    ],
    'marketsScore' => [
      'id' => STAT_MARKETS_SCORE,
      'name' => totranslate('Markets victory points'),
      'type' => 'int',
    ],

    'barracksDistrictValue' => [
      'id' => STAT_BARRACKS_DISTRICT_VALUE,
      'name' => totranslate('Value of barracks districts'),
      'type' => 'int',
    ],
    'barracksPlazaMultiplier' => [
      'id' => STAT_BARRACKS_PLAZA_MULTIPLIER,
      'name' => totranslate('Barracks plazas multiplier'),
      'type' => 'int',
    ],
    'barracksScore' => [
      'id' => STAT_BARRACKS_SCORE,
      'name' => totranslate('Barracks victory points'),
      'type' => 'int',
    ],

    'templesDistrictValue' => [
      'id' => STAT_TEMPLES_DISTRICT_VALUE,
      'name' => totranslate('Value of temples districts'),
      'type' => 'int',
    ],
    'templesPlazaMultiplier' => [
      'id' => STAT_TEMPLES_PLAZA_MULTIPLIER,
      'name' => totranslate('Temples plazas multiplier'),
      'type' => 'int',
    ],
    'templesScore' => [
      'id' => STAT_TEMPLES_SCORE,
      'name' => totranslate('Temples victory points'),
      'type' => 'int',
    ],

    'gardensDistrictValue' => [
      'id' => STAT_GARDENS_DISTRICT_VALUE,
      'name' => totranslate('Value of gardens districts'),
      'type' => 'int',
    ],
    'gardensPlazaMultiplier' => [
      'id' => STAT_GARDENS_PLAZA_MULTIPLIER,
      'name' => totranslate('Gardens plazas multiplier'),
      'type' => 'int',
    ],
    'gardensScore' => [
      'id' => STAT_GARDENS_SCORE,
      'name' => totranslate('Gardens victory points'),
      'type' => 'int',
    ],

    'score' => [
      'id' => STAT_SCORE,
      'name' => totranslate('Final score'),
      'type' => 'int',
    ],

    'moneyEarned' => [
      'id' => STAT_MONEY_EARNED,
      'name' => totranslate('Stone gained by covering quarries'),
      'type' => 'int',
    ],

    'moneyUsed' => [
      'id' => STAT_MONEY_USED,
      'name' => totranslate('Stone used to buy tiles'),
      'type' => 'int',
    ],

    'housesDistrictTiles' => [
      'id' => STAT_HOUSES_DISTRICT_TILES,
      'name' => totranslate('Number of played houses hexes'),
      'type' => 'int',
    ],
    'housesDistrictVisibleTiles' => [
      'id' => STAT_HOUSES_DISTRICT_VISIBLE_TILES,
      'name' => totranslate('Number of played houses hexes visible at the end'),
      'type' => 'int',
    ],
    'housesPlazaTiles' => [
      'id' => STAT_HOUSES_PLAZA_TILES,
      'name' => totranslate('Number of played houses plazas'),
      'type' => 'int',
    ],
    'housesPlazaVisibleTiles' => [
      'id' => STAT_HOUSES_PLAZA_VISIBLE_TILES,
      'name' => totranslate('Number of played houses plazas visible at the end'),
      'type' => 'int',
    ],
    'marketsDistrictTiles' => [
      'id' => STAT_MARKETS_DISTRICT_TILES,
      'name' => totranslate('Number of played markets hexes'),
      'type' => 'int',
    ],
    'marketsDistrictVisibleTiles' => [
      'id' => STAT_MARKETS_DISTRICT_VISIBLE_TILES,
      'name' => totranslate('Number of played markets hexes visible at the end'),
      'type' => 'int',
    ],
    'marketsPlazaTiles' => [
      'id' => STAT_MARKETS_PLAZA_TILES,
      'name' => totranslate('Number of played markets plazas'),
      'type' => 'int',
    ],
    'marketsPlazaVisibleTiles' => [
      'id' => STAT_MARKETS_PLAZA_VISIBLE_TILES,
      'name' => totranslate('Number of played markets plazas visible at the end'),
      'type' => 'int',
    ],
    'barracksDistrictTiles' => [
      'id' => STAT_BARRACKS_DISTRICT_TILES,
      'name' => totranslate('Number of played barracks hexes'),
      'type' => 'int',
    ],
    'barracksDistrictVisibleTiles' => [
      'id' => STAT_BARRACKS_DISTRICT_VISIBLE_TILES,
      'name' => totranslate('Number of played barracks hexes visible at the end'),
      'type' => 'int',
    ],
    'barracksPlazaTiles' => [
      'id' => STAT_BARRACKS_PLAZA_TILES,
      'name' => totranslate('Number of played barracks plazas'),
      'type' => 'int',
    ],
    'barracksPlazaVisibleTiles' => [
      'id' => STAT_BARRACKS_PLAZA_VISIBLE_TILES,
      'name' => totranslate('Number of played barracks plazas visible at the end'),
      'type' => 'int',
    ],
    'templesDistrictTiles' => [
      'id' => STAT_TEMPLES_DISTRICT_TILES,
      'name' => totranslate('Number of played temples hexes'),
      'type' => 'int',
    ],
    'templesDistrictVisibleTiles' => [
      'id' => STAT_TEMPLES_DISTRICT_VISIBLE_TILES,
      'name' => totranslate('Number of played temples hexes visible at the end'),
      'type' => 'int',
    ],
    'templesPlazaTiles' => [
      'id' => STAT_TEMPLES_PLAZA_TILES,
      'name' => totranslate('Number of played temples plazas'),
      'type' => 'int',
    ],
    'templesPlazaVisibleTiles' => [
      'id' => STAT_TEMPLES_PLAZA_VISIBLE_TILES,
      'name' => totranslate('Number of played temples plazas visible at the end'),
      'type' => 'int',
    ],
    'gardensDistrictTiles' => [
      'id' => STAT_GARDENS_DISTRICT_TILES,
      'name' => totranslate('Number of played gardens hexes'),
      'type' => 'int',
    ],
    'gardensDistrictVisibleTiles' => [
      'id' => STAT_GARDENS_DISTRICT_VISIBLE_TILES,
      'name' => totranslate('Number of played gardens hexes visible at the end'),
      'type' => 'int',
    ],
    'gardensPlazaTiles' => [
      'id' => STAT_GARDENS_PLAZA_TILES,
      'name' => totranslate('Number of played gardens plazas'),
      'type' => 'int',
    ],
    'gardensPlazaVisibleTiles' => [
      'id' => STAT_GARDENS_PLAZA_VISIBLE_TILES,
      'name' => totranslate('Number of played gardens plazas visible at the end'),
      'type' => 'int',
    ],
  ],
];
