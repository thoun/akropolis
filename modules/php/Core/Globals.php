<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Core;

use Bga\Games\Akropolis\Helpers\Collection;

/**
 * Global game state management
 * Uses magic __callStatic to provide dynamic getters/setters for game variables
 */
class Globals extends \Bga\Games\Akropolis\Helpers\DB_Manager
{
    /**
     * Setup new game with initial global values
     * @param array<int, mixed> $players Array of player info
     * @param array<string, mixed> $options Game options
     */
    public static function setupNewGame(array $players, array $options): void
    {
        self::setAllTiles(
            count($players) === 4 || (($options[\OPTION_ALL_TILES] ?? OPTION_ALL_TILES_DISABLED) == \OPTION_ALL_TILES_ENABLED)
        );
        self::setLiveScoring($options[\OPTION_LIVE_SCORING] == \OPTION_LIVE_SCORING_ENABLED);

        /** @var array<string, bool> $variants */
        $variants = [
            \BARRACK => ($options[OPTION_VARIANTS] ?? OPTION_VARIANTS_NONE) == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_BARRACK] ?? 0) == \OPTION_VARIANT_ENABLED,
            \GARDEN => ($options[OPTION_VARIANTS] ?? OPTION_VARIANTS_NONE) == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_GARDEN] ?? 0) == \OPTION_VARIANT_ENABLED,
            \HOUSE => ($options[OPTION_VARIANTS] ?? OPTION_VARIANTS_NONE) == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_HOUSE] ?? 0) == \OPTION_VARIANT_ENABLED,
            \MARKET => ($options[OPTION_VARIANTS] ?? OPTION_VARIANTS_NONE) == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_MARKET] ?? 0) == \OPTION_VARIANT_ENABLED,
            \TEMPLE => ($options[OPTION_VARIANTS] ?? OPTION_VARIANTS_NONE) == OPTION_VARIANTS_ALL || ($options[OPTION_VARIANT_TEMPLE] ?? 0) == \OPTION_VARIANT_ENABLED,
        ];
        self::setVariants($variants);

        self::setSolo(count($players) === 1);
        if (count($players) === 1) {
            /** @var array{lvl: int, money: int, score: int} $architect */
            $architect = [
                'lvl' => $options[OPTION_SOLO_LVL] ?? 0,
                'money' => 2,
                'score' => 0,
            ];
            self::setArchitect($architect);
        }

        // Athena
        self::setAthena(($options[\OPTION_EXP_ATHENA] ?? OPTION_ATHENA_DISABLED) == OPTION_ATHENA_ENABLED);
        self::setAthenaCardStatuses([]);

        // Pantheon expansion
        self::setPantheon(($options[\OPTION_EXP_PANTHEON] ?? OPTION_PANTHEON_DISABLED) == OPTION_PANTHEON_ENABLED);
        self::setScenario($options[OPTION_PANTHEON_SCENARIO] ?? SCENARIO_CORINTHE);
        self::setUnlockedChallengeSlots(3);
        self::setPantheonTilePlaced(false);
        self::setPantheonMoneyRequest([]);
        if (self::isPantheon()) {
            self::setAthena(false);
            self::setAllTiles(true);

            /** @var array<string, bool> $pantheonVariants */
            $pantheonVariants = [
                \BARRACK => false,
                \GARDEN => false,
                \HOUSE => false,
                \MARKET => false,
                \TEMPLE => false,
            ];
            self::setVariants($pantheonVariants);
        }
    }

    /**
     * Check if a district variant is enabled
     * @param string $type District type constant (e.g., BARRACK, HOUSE)
     * @return bool True if variant is enabled
     */
    public static function isVariant(string $type): bool
    {
        /** @var array<string, bool> $variants */
        $variants = self::getVariants();
        return $variants[$type];
    }

    /**
     * Check if Pantheon expansion is enabled
     * @return bool True if Pantheon is enabled
     */
    public static function isPantheon(): bool
    {
        return (bool) self::getPantheon();
    }


    /** @var bool Whether data has been fetched from DB */
    protected static bool $initialized = false;

    /** @var array<string, 'int'|'bool'|'obj'|'str'> Variable type definitions */
    protected static array $variables = [
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

        // Pantheon expansion
        'pantheon' => 'bool',
        'scenario' => 'int',
        'unlockedChallengeSlots' => 'int',
        'pantheonTilePlaced' => 'bool',
        'pantheonMoneyRequest' => 'obj',
    ];

    protected static string $table = 'global_variables';
    protected static string $primary = 'name';

    /** @var array<string, int|bool|array<mixed>|string> Cached global data */
    protected static array $data = [];

    /**
     * Cast database row to appropriate type
     * @param array{name: string, value: string} $row Database row
     * @return int|bool|array<mixed>|string Casted value
     */
    protected static function cast(array $row): int|bool|array|string
    {
        $val = json_decode(\stripslashes($row['value']), true);
        return self::$variables[$row['name']] === 'int' ? (int)$val : $val;
    }

    /**
     * Fetch all existing variables from DB
     */
    public static function fetch(): void
    {
        // Turn off LOG to avoid infinite loop (Globals::isLogging() calling itself for fetching)
        $tmp = self::$log;
        self::$log = false;

        /** @var Collection<string, int|bool|array<mixed>|string> $variables */
        $variables = self::DB()
            ->select(['value', 'name'])
            ->get(false);

        foreach ($variables as $name => $value) {
            if (\array_key_exists($name, self::$variables)) {
                self::$data[$name] = $value;
            }
        }
        self::$initialized = true;
        self::$log = $tmp;
    }

    /**
     * Create and store a global variable declared in this file but not present in DB yet
     * (only happens when adding globals while a game is running)
     * @param string $name Variable name
     */
    public static function create(string $name): void
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

    /**
     * Magic method that intercepts undefined static method calls
     * Supports: getXxx(), setXxx(), incXxx(), isXxx() patterns
     * @param string $method Method name
     * @param array<mixed> $args Method arguments
     * @return int|bool|array<mixed>|string Return value from the operation
     * @throws \InvalidArgumentException|\feException
     */
    public static function __callStatic(string $method, array $args): int|bool|array|string
    {
        if (!self::$initialized) {
            self::fetch();
        }

        if (preg_match('/^([gs]et|inc|is)([A-Z])(.*)$/', $method, $match)) {
            // Sanity check: does the name correspond to a declared variable?
            $name = strtolower($match[2]) . $match[3];
            if (!\array_key_exists($name, self::$variables)) {
                throw new \InvalidArgumentException("Property {$name} doesn't exist");
            }

            // Create in DB if doesn't exist yet
            if (!\array_key_exists($name, self::$data)) {
                self::create($name);
            }

            if ($match[1] === 'get') {
                // Basic getters
                return self::$data[$name];
            } elseif ($match[1] === 'is') {
                // Boolean getter
                if (self::$variables[$name] !== 'bool') {
                    throw new \InvalidArgumentException("Property {$name} is not of type bool");
                }
                return (bool) self::$data[$name];
            } elseif ($match[1] === 'set') {
                // Setters in DB and update cache
                $value = $args[0];
                if (self::$variables[$name] === 'int') {
                    $value = (int) $value;
                }
                if (self::$variables[$name] === 'bool') {
                    $value = (bool) $value;
                }

                self::$data[$name] = $value;
                self::DB()->update(['value' => \addslashes(\json_encode($value))], $name);
                return $value;
            } elseif ($match[1] === 'inc') {
                if (self::$variables[$name] !== 'int') {
                    throw new \InvalidArgumentException("Trying to increase {$name} which is not an int");
                }

                $getter = 'get' . $match[2] . $match[3];
                $setter = 'set' . $match[2] . $match[3];
                return self::$setter(self::$getter() + (empty($args) ? 1 : $args[0]));
            }
        }
        debug_print_backtrace();
        die("Error in Globals");
    }
}
