<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Managers;

use Bga\Games\Akropolis\Core\Globals;
use Bga\Games\Akropolis\Helpers\Utils;
use Bga\Games\Akropolis\Models\ConstructionCard;

/* Class to manage all the construction cards for Akropolis */

class ConstructionCards extends \Bga\Games\Akropolis\Helpers\Pieces
{
    protected static string $table = 'construction-cards';
    protected static string $prefix = 'card_';
    protected static array $customFields = [];
    protected static bool $autoIncrement = false;
    protected static bool $autoremovePrefix = false;

    /**
     * Cast database row to ConstructionCard object
     * @param array<mixed> $card Database row
     * @return ConstructionCard Construction card instance
     */
    protected static function cast(array $card): ConstructionCard
    {
        return self::getCardInstance($card['card_id'], $card);
    }

    /**
     * Get a construction card instance by ID
     * @param string $id Card ID
     * @param array<mixed>|null $data Card data (optional)
     * @return ConstructionCard Construction card instance
     */
    public static function getCardInstance(string $id, ?array $data = null): ConstructionCard
    {
        $className = "\Bga\Games\Akropolis\ConstructionCards\\$id";
        return new $className($data);
    }

    /**
     * Get UI data for construction cards
     * @return array<array> Array of card UI data
     */
    public static function getUiData(): array
    {
        if (!Globals::isAthena()) {
            return [];
        }

        return self::getAll()->ui();
    }

    /**
     * Setup new game with construction cards
     * @param array<int, mixed> $players Array of player info
     * @param array<string, mixed> $options Game options
     */
    public static function setupNewGame(array $players, array $options): void
    {
        if (!Globals::isAthena()) {
            return;
        }

        $cardIds = Utils::rand(self::$cards, 4);
        $cards = [];
        foreach ($cardIds as $i => $id) {
            $slot = $i + 1;
            $cards[] = [
                'id' => $id,
                'location' => "athena-$slot"
            ];
        }

        // Create the cards
        self::create($cards);
    }

    /** @var array<int, string> Available construction card IDs */
    static array $cards = [
        "Agora",
        "CityMarket",
        "DistrictCenter",
        "Fortress",
        "GuardTower",
        "HangingGardens",
        "Housing",
        "LuxuryGoods",
        "MainStreet",
        "Oasis",
        "Pantheon",
        "Parkland",
        "PilgrimsStairs",
        "QuarryMine",
        "Rampart",
        "Sanctuary",
        "Storehouses",
        "Villa",
    ];
}
