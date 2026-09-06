<?php

namespace AKR\Managers;

use AKR\PantheonChallenges\Challenge;

/**
 * Manager for Pantheon Challenge tiles
 * Handles creation, drawing, and management of challenges
 */
class PantheonChallenges extends \AKR\Helpers\Pieces
{
    protected static $table = 'pantheon_challenges';
    protected static $primary = 'challenge_id';
    protected static $autoIncrement = false;
    protected static $autoremovePrefix = false;

    protected static function cast($row)
    {
        $challengeId = $row['challenge_id'];
        $className = '\\AKR\\PantheonChallenges\\' . $challengeId;

        if (class_exists($className)) {
            return new $className($row);
        }

        throw new \InvalidArgumentException("Unknown challenge type: " . $challengeId);
    }

    public static function getUiData(): array
    {
        $data = [
            'board' => self::getInLocation('board')->ui(),
        ];
        return $data;
    }


    /**
     * Setup new game - initialize challenge database
     */
    public static function setupNewGame($players, $options)
    {
        $challengeIds = [
            "Bastion",
            "BustlingTrade",
            "Challenge",
            "ForeignTrade",
            "Garrison",
            "GodsPromenade",
            "GrandTemple",
            "LookoutTower",
            "MarketStall",
            "Neighborhood",
            "Oracle",
            "Orchard",
            "PatricianVilla",
            "PopulationExpansion",
            "RareCommodities",
            "ReligiousFervor",
            "ResidentialArea",
            "Ritual",
            "SacredGrove",
            "Suburb",
            "Uprising",
        ];

        $challenges = [];
        foreach ($challengeIds as $id) {
            $challenges[] = [
                'id' => $id,
                'location' => 'deck',
            ];
        }

        self::create($challenges);

        // Draw 3 challenges
        self::shuffle('deck');
        for ($i = 0; $i < 3; $i++) {
            self::drawChallenge();
        }
    }

    /**
     * Draw a challenge from deck to revealed
     */
    public static function drawChallenge(): ?Challenge
    {
        return self::pickOneForLocation('deck', 'board');
    }

    // /**
    //  * Complete a challenge (move to completed)
    //  */
    // public static function completeChallenge($challengeId)
    // {
    //     self::DB()->update([
    //         'challenge_location' => 'completed',
    //     ], $challengeId);
    // }

    // /**
    //  * Discard a challenge and draw a new one
    //  */
    // public static function discardChallenge($challengeId)
    // {
    //     self::DB()->update([
    //         'challenge_location' => 'discarded',
    //     ], $challengeId);

    //     // Draw a new one to replace it
    //     return self::drawChallenge();
    // }
    // /**
    //  * Get challenges that a player can complete
    //  */
    // public static function getCompletableChallenges($player): array
    // {
    //     $completable = [];
    //     foreach (self::getRevealed() as $challenge) {
    //         if ($challenge->isSatisfied($player)) {
    //             $completable[$challenge->getId()] = $challenge;
    //         }
    //     }
    //     return $completable;
    // }
}
