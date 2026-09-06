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
 * states.inc.php
 *
 * Akropolis game states description
 *
 */

$machinestates = [
  // The initial state. Please do not modify.
  ST_GAME_SETUP => [
    'name' => 'gameSetup',
    'description' => '',
    'type' => 'manager',
    'action' => 'stGameSetup',
    'transitions' => ['' => ST_PLACE_TILE],
  ],

  ST_PLACE_TILE => [
    'name' => 'placeTile',
    'description' => clienttranslate('${actplayer} must place a tile in their city'),
    'descriptionmyturn' => clienttranslate('${you} must play a tile in your city'),
    'type' => 'activeplayer',
    'args' => 'argsPlaceTile',
    'possibleactions' => ['actPlaceTile'],
    'transitions' => ['completeCard' => ST_COMPLETE_CARD, 'next' => ST_NEXT_PLAYER],
  ],

  ST_NEXT_PLAYER => [
    'name' => 'nextPlayer',
    'type' => 'game',
    'action' => 'stNextPlayer',
    'transitions' => ['placeTile' => ST_PLACE_TILE, 'end' => ST_PRE_END_OF_GAME],
    'updateGameProgression' => true,
  ],

  ST_PRE_END_OF_GAME => [
    'name' => 'preEndOfGame',
    'action' => 'stPreEndOfGame',
    'type' => 'game',
    'transitions' => ['' => ST_END_GAME],
  ],

  // Final state.
  // Please do not modify (and do not overload action/args methods).
  ST_END_GAME => [
    'name' => 'gameEnd',
    'description' => clienttranslate('End of game'),
    'type' => 'manager',
    'action' => 'stGameEnd',
    'args' => 'argGameEnd',
  ],

  ////////////////////////////////////////////
  //     _   _   _                      
  //    / \ | |_| |__   ___ _ __   __ _ 
  //   / _ \| __| '_ \ / _ \ '_ \ / _` |
  //  / ___ \ |_| | | |  __/ | | | (_| |
  // /_/   \_\__|_| |_|\___|_| |_|\__,_|
  ////////////////////////////////////////////


  ST_COMPLETE_CARD => [
    'name' => 'completeCard',
    'description' => clienttranslate('${actplayer} may complete a fulfilled construction card'),
    'descriptionmyturn' => clienttranslate('${you} may complete a fulfilled construction card'),
    'type' => 'activeplayer',
    'args' => 'argsCompleteCard',
    'possibleactions' => ['actCompleteCard', 'actSkipCompleteCard'],
    'transitions' => ['completeCard' => ST_COMPLETE_CARD, 'next' => ST_NEXT_PLAYER],
  ],


  /////////////////////////////////////////////////////
  //  ____             _   _                      
  // |  _ \ __ _ _ __ | |_| |__   ___  ___  _ __  
  // | |_) / _` | '_ \| __| '_ \ / _ \/ _ \| '_ \ 
  // |  __/ (_| | | | | |_| | | |  __/ (_) | | | |
  // |_|   \__,_|_| |_|\__|_| |_|\___|\___/|_| |_|
  /////////////////////////////////////////////////////

  ST_PANTHEON_SETUP => [
    'name' => 'pantheonSetup',
    'description' => clienttranslate('Setup: Distribute starting tiles'),
    'type' => 'multipleactiveplayer',
    'action' => 'stPantheonSetup',
    'args' => 'argsPantheonSetup',
    'possibleactions' => ['actPlaceStartingTileInCapital'],
    'transitions' => ['next' => ST_PLACE_TILE_PANTHEON],
  ],

  ST_PLACE_TILE_PANTHEON => [
    'name' => 'placeTilePantheon',
    'description' => clienttranslate('${actplayer} must place a tile in their city or in the Capital'),
    'descriptionmyturn' => clienttranslate('${you} must play a tile in your city or in the Capital'),
    'type' => 'activeplayer',
    'args' => 'argsPlaceTilePantheon',
    'possibleactions' => ['actPlaceTileInCity', 'actPlaceTileInCapital', 'actCompleteChallenge', 'actDiscardChallenge', 'actUnlockChallengeSlot'],
    'transitions' => ['next' => ST_NEXT_PLAYER_PANTHEON, 'complete' => ST_COMPLETE_CHALLENGE, 'end' => ST_PRE_END_OF_GAME],
  ],

  ST_COMPLETE_CHALLENGE => [
    'name' => 'completeChallenge',
    'description' => clienttranslate('${actplayer} can complete architectural challenges'),
    'descriptionmyturn' => clienttranslate('${you} can complete architectural challenges'),
    'type' => 'activeplayer',
    'args' => 'argsCompleteChallenge',
    'possibleactions' => ['actCompleteChallenge', 'actSkipCompleteChallenge'],
    'transitions' => ['next' => ST_NEXT_PLAYER_PANTHEON, 'complete' => ST_COMPLETE_CHALLENGE],
  ],

  ST_NEXT_PLAYER_PANTHEON => [
    'name' => 'nextPlayerPantheon',
    'type' => 'game',
    'action' => 'stNextPlayerPantheon',
    'transitions' => ['placeTile' => ST_PLACE_TILE_PANTHEON, 'end' => ST_PRE_END_OF_GAME],
    'updateGameProgression' => true,
  ],
];
