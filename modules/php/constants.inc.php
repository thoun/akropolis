<?php

/*
 * Game options
 */

const OPTION_LIVE_SCORING = 101;
const OPTION_LIVE_SCORING_DISABLED = 0;
const OPTION_LIVE_SCORING_ENABLED = 1;

const OPTION_ALL_TILES = 102;
const OPTION_ALL_TILES_DISABLED = 0;
const OPTION_ALL_TILES_ENABLED = 1;

const OPTION_VARIANTS = 103;
const OPTION_VARIANTS_NONE = 0;
const OPTION_VARIANTS_ALL = 1;
const OPTION_VARIANTS_SOME = 2;

const OPTION_VARIANT_DISABLED = 0;
const OPTION_VARIANT_ENABLED = 1;

const OPTION_VARIANT_HOUSE = 104;
const OPTION_VARIANT_MARKET = 105;
const OPTION_VARIANT_BARRACK = 106;
const OPTION_VARIANT_TEMPLE = 107;
const OPTION_VARIANT_GARDEN = 108;

const OPTION_SOLO_LVL = 110;
const OPTION_SOLO_LVL_0 = 0;
const OPTION_SOLO_LVL_1 = 1;
const OPTION_SOLO_LVL_2 = 2;

const OPTION_EXP_ATHENA = 111;
const OPTION_ATHENA_DISABLED = 0;
const OPTION_ATHENA_ENABLED = 1;


/*
 * User preferences
 */
const OPTION_CONFIRM = 103;
const OPTION_CONFIRM_DISABLED = 0;
const OPTION_CONFIRM_TIMER = 1;
const OPTION_CONFIRM_ENABLED = 2;

/*
 * State constants
 */
const ST_GAME_SETUP = 1;
const ST_PLACE_TILE = 2;
const ST_NEXT_PLAYER = 3;
const ST_COMPLETE_CARD = 4;
const ST_PRE_END_OF_GAME = 98;
const ST_END_GAME = 99;

/**
 * Tiles
 */
const BARRACK = 'barrack-district';
const BARRACK_PLAZA = 'barrack-plaza';
const HOUSE = 'house-district';
const HOUSE_PLAZA = 'house-plaza';
const MARKET = 'market-district';
const MARKET_PLAZA = 'market-plaza';
const TEMPLE = 'temple-district';
const TEMPLE_PLAZA = 'temple-plaza';
const GARDEN = 'garden-district';
const GARDEN_PLAZA = 'garden-plaza';
const QUARRY = 'quarry';

const TILE_GEOMETRY = [[0, 0], [1, 1], [0, 2]]; // TODO : remove
const TILE_GEOMETRIES = [
  1 => [[0, 0]],
  3 => [[0, 0], [1, 1], [0, 2]],
];
const DISTRICTS = [BARRACK, HOUSE, MARKET, TEMPLE, GARDEN];
const PLAZAS = [BARRACK_PLAZA, HOUSE_PLAZA, MARKET_PLAZA, TEMPLE_PLAZA, GARDEN_PLAZA];
const PLAZAS_MULT = [BARRACK_PLAZA => 2, HOUSE_PLAZA => 1, MARKET_PLAZA => 2, TEMPLE_PLAZA => 2, GARDEN_PLAZA => 3];

const ARCHITECT_ID = 0;
/**
 * Stats
 */

const STAT_MONEY_LEFT = 13;

const STAT_HOUSES_DISTRICT_VALUE = 22;
const STAT_HOUSES_PLAZA_MULTIPLIER = 25;
const STAT_HOUSES_SCORE = 26;

const STAT_MARKETS_DISTRICT_VALUE = 32;
const STAT_MARKETS_PLAZA_MULTIPLIER = 35;
const STAT_MARKETS_SCORE = 36;

const STAT_BARRACKS_DISTRICT_VALUE = 42;
const STAT_BARRACKS_PLAZA_MULTIPLIER = 45;
const STAT_BARRACKS_SCORE = 46;

const STAT_TEMPLES_DISTRICT_VALUE = 52;
const STAT_TEMPLES_PLAZA_MULTIPLIER = 55;
const STAT_TEMPLES_SCORE = 56;

const STAT_GARDENS_DISTRICT_VALUE = 62;
const STAT_GARDENS_PLAZA_MULTIPLIER = 65;
const STAT_GARDENS_SCORE = 66;

const STAT_STARTING_POSITION = 10;
const STAT_MONEY_EARNED = 11;
const STAT_MONEY_USED = 12;

const STAT_SCORE = 15;

const STAT_HOUSES_DISTRICT_TILES = 20;
const STAT_HOUSES_DISTRICT_VISIBLE_TILES = 21;
const STAT_HOUSES_PLAZA_TILES = 23;
const STAT_HOUSES_PLAZA_VISIBLE_TILES = 24;
const STAT_MARKETS_DISTRICT_TILES = 30;
const STAT_MARKETS_DISTRICT_VISIBLE_TILES = 31;
const STAT_MARKETS_PLAZA_TILES = 33;
const STAT_MARKETS_PLAZA_VISIBLE_TILES = 34;
const STAT_BARRACKS_DISTRICT_TILES = 40;
const STAT_BARRACKS_DISTRICT_VISIBLE_TILES = 41;
const STAT_BARRACKS_PLAZA_TILES = 43;
const STAT_BARRACKS_PLAZA_VISIBLE_TILES = 44;
const STAT_TEMPLES_DISTRICT_TILES = 50;
const STAT_TEMPLES_DISTRICT_VISIBLE_TILES = 51;
const STAT_TEMPLES_PLAZA_TILES = 53;
const STAT_TEMPLES_PLAZA_VISIBLE_TILES = 54;
const STAT_GARDENS_DISTRICT_TILES = 60;
const STAT_GARDENS_DISTRICT_VISIBLE_TILES = 61;
const STAT_GARDENS_PLAZA_TILES = 63;
const STAT_GARDENS_PLAZA_VISIBLE_TILES = 64;
