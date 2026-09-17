<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Core;

use Bga\Games\Akropolis\Game;

/**
 * User preferences management
 */
class Preferences extends \Bga\Games\Akropolis\Helpers\DB_Manager
{
    protected static string $table = 'user_preferences';
    protected static string $primary = 'id';
    protected static bool $log = false; // Turn off log to avoid undoing changes in this table

    /**
     * Cast database row
     * @param array<mixed> $row Database row
     * @return array<mixed> Casted row
     */
    protected static function cast(array $row): array
    {
        return $row;
    }

    /**
     * Setup new game with player preferences
     * @param array<int, mixed> $players Array of player info
     * @param array<int, array<string, mixed>> $prefs Player preferences from setup
     */
    public static function setupNewGame(array $players, array $prefs): void
    {
        // Load user preferences
        include dirname(__FILE__) . '/../../../gameoptions.inc.php';

        $values = [];
        foreach ($game_preferences as $id => $data) {
            $defaultValue = $data['default'] ?? array_keys($data['values'])[0];

            foreach ($players as $pId => $infos) {
                $values[] = [
                    'player_id' => $pId,
                    'pref_id' => $id,
                    'pref_value' => $prefs[$pId][$id] ?? $defaultValue,
                ];
            }
        }

        self::DB()
            ->multipleInsert(['player_id', 'pref_id', 'pref_value'])
            ->values($values);
    }

    /**
     * Check if stored user preferences match declared preferences, and create otherwise
     */
    public static function checkExistence(): void
    {
        // Load user preferences
        include dirname(__FILE__) . '/../../../gameoptions.inc.php';

        $playerIds = array_keys(Game::get()->loadPlayersBasicInfos());
        $values = [];
        foreach ($game_preferences as $id => $data) {
            $defaultValue = $data['default'] ?? array_keys($data['values'])[0];

            foreach ($playerIds as $pId) {
                if (self::get($pId, $id) === null) {
                    $values[] = [
                        'player_id' => $pId,
                        'pref_id' => $id,
                        'pref_value' => $defaultValue,
                    ];
                }
            }
        }

        if (!empty($values)) {
            self::DB()
                ->multipleInsert(['player_id', 'pref_id', 'pref_value'])
                ->values($values);
        }
    }

    /**
     * Get UI data for a player's preferences (useful to check inconsistency)
     * @param int $pId Player ID
     * @return array<array{pref_id: string, pref_value: mixed}> Preferences data
     */
    public static function getUiData(int $pId): array
    {
        self::checkExistence();
        return self::DB()
            ->where('player_id', $pId)
            ->get()
            ->toArray();
    }

    /**
     * Get a user preference
     * @param int $pId Player ID
     * @param string|int $prefId Preference ID
     * @return mixed|null Preference value or null if not found
     */
    public static function get(int $pId, string|int $prefId): mixed
    {
        return self::DB()
            ->select(['pref_value'])
            ->where('player_id', $pId)
            ->where('pref_id', $prefId)
            ->get(true)['pref_value'] ?? null;
    }

    /**
     * Set a user preference
     * @param int $pId Player ID
     * @param string|int $prefId Preference ID
     * @param mixed $value Preference value to set
     * @return bool Success status
     */
    public static function set(int $pId, string|int $prefId, mixed $value): bool
    {
        return self::DB()
            ->update(['pref_value' => $value])
            ->where('player_id', $pId)
            ->where('pref_id', $prefId)
            ->run();
    }
}
