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

  ST_COMPLETE_CARD => [
    'name' => 'completeCard',
    'description' => clienttranslate('${actplayer} may complete a fulfilled construction card'),
    'descriptionmyturn' => clienttranslate('${you} may complete a fulfilled construction card'),
    'type' => 'activeplayer',
    'args' => 'argsCompleteCard',
    'possibleactions' => ['actCompleteCard', 'actSkipCompleteCard'],
    'transitions' => ['next' => ST_NEXT_PLAYER],
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
];
