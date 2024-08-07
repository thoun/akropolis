<?php

namespace AKR\Core;

use AKR\Core\Game;
use AKR\Helpers\Utils;

/*
 * Globals
 */

class Globals extends \AKR\Helpers\DB_Manager
{
  protected static $initialized = false;
  protected static $variables = [
    'variants' => 'obj',
    'liveScoring' => 'bool',
    'lastMoves' => 'obj',
    'firstPlayer' => 'int',
    'solo' => 'bool',
    'architect' => 'obj',
    'endOfGame' => 'bool',
    'allTiles' => 'bool',

    // Athena expansion
    'athena' => 'bool',
    'athenaCardStatuses' => 'obj',
  ];

  protected static $table = 'global_variables';
  protected static $primary = 'name';
  protected static function cast($row)
  {
    $val = json_decode(\stripslashes($row['value']), true);
    return self::$variables[$row['name']] == 'int' ? ((int) $val) : $val;
  }

  /*
   * Fetch all existings variables from DB
   */
  protected static $data = [];
  public static function fetch()
  {
    // Turn of LOG to avoid infinite loop (Globals::isLogging() calling itself for fetching)
    $tmp = self::$log;
    self::$log = false;

    foreach (self::DB()
      ->select(['value', 'name'])
      ->get(false)
      as $name => $variable) {
      if (\array_key_exists($name, self::$variables)) {
        self::$data[$name] = $variable;
      }
    }
    self::$initialized = true;
    self::$log = $tmp;
  }

  /*
   * Create and store a global variable declared in this file but not present in DB yet
   *  (only happens when adding globals while a game is running)
   */
  public static function create($name)
  {
    if (!\array_key_exists($name, self::$variables)) {
      return;
    }

    $default = [
      'int' => 0,
      'obj' => [],
      'bool' => false,
      'str' => '',
    ];
    $val = $default[self::$variables[$name]];
    self::DB()->insert(
      [
        'name' => $name,
        'value' => \json_encode($val),
      ],
      true
    );
    self::$data[$name] = $val;
  }

  /*
   * Magic method that intercept not defined static method and do the appropriate stuff
   */
  public static function __callStatic($method, $args)
  {
    if (!self::$initialized) {
      self::fetch();
    }

    if (preg_match('/^([gs]et|inc|is)([A-Z])(.*)$/', $method, $match)) {
      // Sanity check : does the name correspond to a declared variable ?
      $name = strtolower($match[2]) . $match[3];
      if (!\array_key_exists($name, self::$variables)) {
        throw new \InvalidArgumentException("Property {$name} doesn't exist");
      }

      // Create in DB if don't exist yet
      if (!\array_key_exists($name, self::$data)) {
        self::create($name);
      }

      if ($match[1] == 'get') {
        // Basic getters
        return self::$data[$name];
      } elseif ($match[1] == 'is') {
        // Boolean getter
        if (self::$variables[$name] != 'bool') {
          throw new \InvalidArgumentException("Property {$name} is not of type bool");
        }
        return (bool) self::$data[$name];
      } elseif ($match[1] == 'set') {
        // Setters in DB and update cache
        $value = $args[0];
        if (self::$variables[$name] == 'int') {
          $value = (int) $value;
        }
        if (self::$variables[$name] == 'bool') {
          $value = (bool) $value;
        }

        self::$data[$name] = $value;
        self::DB()->update(['value' => \addslashes(\json_encode($value))], $name);
        return $value;
      } elseif ($match[1] == 'inc') {
        if (self::$variables[$name] != 'int') {
          throw new \InvalidArgumentException("Trying to increase {$name} which is not an int");
        }

        $getter = 'get' . $match[2] . $match[3];
        $setter = 'set' . $match[2] . $match[3];
        return self::$setter(self::$getter() + (empty($args) ? 1 : $args[0]));
      }
    }
    throw new \feException(print_r(debug_print_backtrace()));
    return null;
  }

  /*
   * Setup new game
   */
  public static function setupNewGame($players, $options)
  {
    self::setAllTiles(
      count($players) == 4 || (($options[\OPTION_ALL_TILES] ?? OPTION_ALL_TILES_DISABLED) == \OPTION_ALL_TILES_ENABLED)
    );
    self::setLiveScoring($options[\OPTION_LIVE_SCORING] == \OPTION_LIVE_SCORING_ENABLED);
    self::setVariants([
      \BARRACK =>
      $options[OPTION_VARIANTS] == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_BARRACK] ?? 0) == \OPTION_VARIANT_ENABLED,
      \GARDEN =>
      $options[OPTION_VARIANTS] == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_GARDEN] ?? 0) == \OPTION_VARIANT_ENABLED,
      \HOUSE =>
      $options[OPTION_VARIANTS] == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_HOUSE] ?? 0) == \OPTION_VARIANT_ENABLED,
      \MARKET =>
      $options[OPTION_VARIANTS] == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_MARKET] ?? 0) == \OPTION_VARIANT_ENABLED,
      \TEMPLE =>
      $options[OPTION_VARIANTS] == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_TEMPLE] ?? 0) == \OPTION_VARIANT_ENABLED,
    ]);

    self::setSolo(count($players) == 1);
    if (count($players) == 1) {
      self::setArchitect([
        'lvl' => $options[OPTION_SOLO_LVL] ?? 0,
        'money' => 2,
        'score' => 0,
      ]);
    }

    self::setAthena(($options[\OPTION_EXP_ATHENA] ?? OPTION_ATHENA_DISABLED) == OPTION_ATHENA_ENABLED);
    self::setAthenaCardStatuses([]);
  }

  public static function isVariant($type)
  {
    return self::getVariants()[$type];
  }
}
