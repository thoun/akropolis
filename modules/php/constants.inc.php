<?php

/*
 * Game options
 */

const OPTION_LIVE_SCORING = 102;
const OPTION_LIVE_SCORING_DISABLED = 0;
const OPTION_LIVE_SCORING_ENABLED = 1;

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

const DISTRICTS = [BARRACK, HOUSE, MARKET, TEMPLE, GARDEN];
const PLAZAS = [BARRACK_PLAZA, HOUSE_PLAZA, MARKET_PLAZA, TEMPLE_PLAZA, GARDEN_PLAZA];
