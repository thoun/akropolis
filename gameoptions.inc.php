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
 * gameoptions.inc.php
 *
 * Akropolis game options description
 *
 */

namespace AKR;

require_once 'modules/php/constants.inc.php';

$game_options = [
  \OPTION_LIVE_SCORING => [
    'name' => totranslate('Live scoring'),
    'values' => [
      \OPTION_LIVE_SCORING_ENABLED => [
        'name' => totranslate('Enabled'),
        'tmdisplay' => totranslate('[Live scoring]'),
        'description' => totranslate('Live scoring during the game'),
      ],
      \OPTION_LIVE_SCORING_DISABLED => [
        'name' => totranslate('Disabled'),
        'description' => totranslate('Hidden scores during the game'),
      ],
    ],
    'default' => OPTION_LIVE_SCORING_ENABLED,
  ],

  \OPTION_ALL_TILES => [
    'name' => totranslate('All tiles'),
    'values' => [
      \OPTION_ALL_TILES_DISABLED => [
        'name' => totranslate('Disabled'),
        'description' => totranslate('Always form 11 stack of tiles'),
      ],
      \OPTION_ALL_TILES_ENABLED => [
        'name' => totranslate('Enabled'),
        'description' => totranslate('Play with the whole set of 61 tiles'),
      ],
    ],
    'default' => OPTION_ALL_TILES_DISABLED,
    'displaycondition' => [
      [
        'type' => 'maxplayers',
        'value' => [1, 2, 3],
      ],
    ],
  ],

  \OPTION_SOLO_LVL => [
    'name' => totranslate('Architect level'),
    'values' => [
      \OPTION_SOLO_LVL_0 => [
        'name' => totranslate('Easy'),
        'description' => totranslate('All the Architect\'s districts are considered on the ground level.'),
      ],
      \OPTION_SOLO_LVL_1 => [
        'name' => totranslate('Medium'),
        'description' => totranslate(
          'All the Architect\'s districts are considered on the ground level, and each quarry is worth 2 points.'
        ),
        'nobeginner' => true,
      ],
      \OPTION_SOLO_LVL_2 => [
        'name' => totranslate('Hard'),
        'description' => totranslate('All the Architect\'s districts are considered on the first floor.'),
        'nobeginner' => true,
      ],
    ],
    'default' => OPTION_SOLO_LVL_0,
    'displaycondition' => [
      [
        'type' => 'maxplayers',
        'value' => [1],
      ],
    ],
  ],

  \OPTION_VARIANTS => [
    'name' => totranslate('Variants'),
    'values' => [
      \OPTION_VARIANTS_NONE => [
        'name' => totranslate('None'),
        'description' => totranslate('Only the base rules'),
      ],
      \OPTION_VARIANTS_ALL => [
        'name' => totranslate('All variants'),
        'tmdisplay' => totranslate('[All variants]'),
        'description' => totranslate('The five variants will be enabled'),
        'nobeginner' => true,
      ],
      \OPTION_VARIANTS_SOME => [
        'name' => totranslate('Some variants'),
        'description' => totranslate('Select the variants you want enabled'),
        'nobeginner' => true,
      ],
    ],
    'default' => OPTION_VARIANTS_NONE,
  ],

  \OPTION_VARIANT_BARRACK => [
    'name' => totranslate('Variant for Barrack'),
    'values' => [
      \OPTION_VARIANT_DISABLED => [
        'name' => totranslate('Disabled'),
        'description' => totranslate('Only the base rule for barracks'),
      ],
      \OPTION_VARIANT_ENABLED => [
        'name' => totranslate('Enabled'),
        'tmdisplay' => totranslate('[Barrack variant]'),
        'description' => totranslate('Variant rules for Barracks'),
        'nobeginner' => true,
      ],
    ],
    'default' => OPTION_VARIANT_DISABLED,
    'displaycondition' => [
      [
        'type' => 'otheroption',
        'id' => OPTION_VARIANTS,
        'value' => [OPTION_VARIANTS_SOME],
      ],
    ],
  ],

  \OPTION_VARIANT_GARDEN => [
    'name' => totranslate('Variant for gardens'),
    'values' => [
      \OPTION_VARIANT_DISABLED => [
        'name' => totranslate('Disabled'),
        'description' => totranslate('Only the base rule for gardens'),
      ],
      \OPTION_VARIANT_ENABLED => [
        'name' => totranslate('Enabled'),
        'tmdisplay' => totranslate('[Gardens variant]'),
        'description' => totranslate('Variant rules for gardens'),
        'nobeginner' => true,
      ],
    ],
    'default' => OPTION_VARIANT_DISABLED,
    'displaycondition' => [
      [
        'type' => 'otheroption',
        'id' => OPTION_VARIANTS,
        'value' => [OPTION_VARIANTS_SOME],
      ],
    ],
  ],
  \OPTION_VARIANT_HOUSE => [
    'name' => totranslate('Variant for houses'),
    'values' => [
      \OPTION_VARIANT_DISABLED => [
        'name' => totranslate('Disabled'),
        'description' => totranslate('Only the base rule for houses'),
      ],
      \OPTION_VARIANT_ENABLED => [
        'name' => totranslate('Enabled'),
        'tmdisplay' => totranslate('[Houses variant]'),
        'description' => totranslate('Variant rules for houses'),
        'nobeginner' => true,
      ],
    ],
    'default' => OPTION_VARIANT_DISABLED,
    'displaycondition' => [
      [
        'type' => 'otheroption',
        'id' => OPTION_VARIANTS,
        'value' => [OPTION_VARIANTS_SOME],
      ],
    ],
  ],
  \OPTION_VARIANT_MARKET => [
    'name' => totranslate('Variant for markets'),
    'values' => [
      \OPTION_VARIANT_DISABLED => [
        'name' => totranslate('Disabled'),
        'description' => totranslate('Only the base rule for markets'),
      ],
      \OPTION_VARIANT_ENABLED => [
        'name' => totranslate('Enabled'),
        'tmdisplay' => totranslate('[Markets variant]'),
        'description' => totranslate('Variant rules for markets'),
        'nobeginner' => true,
      ],
    ],
    'default' => OPTION_VARIANT_DISABLED,
    'displaycondition' => [
      [
        'type' => 'otheroption',
        'id' => OPTION_VARIANTS,
        'value' => [OPTION_VARIANTS_SOME],
      ],
    ],
  ],
  \OPTION_VARIANT_TEMPLE => [
    'name' => totranslate('Variant for gardens'),
    'values' => [
      \OPTION_VARIANT_DISABLED => [
        'name' => totranslate('Disabled'),
        'description' => totranslate('Only the base rule for gardens'),
      ],
      \OPTION_VARIANT_ENABLED => [
        'name' => totranslate('Enabled'),
        'tmdisplay' => totranslate('[Gardens variant]'),
        'description' => totranslate('Variant rules for gardens'),
        'nobeginner' => true,
      ],
    ],
    'default' => OPTION_VARIANT_DISABLED,
    'displaycondition' => [
      [
        'type' => 'otheroption',
        'id' => OPTION_VARIANTS,
        'value' => [OPTION_VARIANTS_SOME],
      ],
    ],
  ],
];

$game_preferences = [
  201 => [
      'name' => totranslate('Different tile border colors based on level'),
      'needReload' => false,
      'values' => [
          1 => [ 'name' => totranslate('Disabled')],
          2 => [ 'name' => totranslate('Enabled')],
      ],
      'default' => 1,
  ],

  /* old preference, do not reuse 202. 202 => [
      'name' => totranslate('Allow to replace without cancel'),
      'needReload' => false,
      'values' => [
          1 => [ 'name' => totranslate('Disabled')],
          2 => [ 'name' => totranslate('Enabled')],
      ],
      'default' => 1,
  ],*/

  203 => [
      'name' => totranslate('Reverse construction site order'),
      'needReload' => false,
      'values' => [
          1 => [ 'name' => totranslate('Disabled')],
          2 => [ 'name' => totranslate('Enabled')],
      ],
      'default' => 1,
  ],
];
