<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Helpers;

use Bga\GameFramework\VisibleSystemException;

/**
 * Utility functions for array and zone operations
 */
abstract class Utils extends \APP_DbObject
{
    /**
     * Filter an array in-place using a callback
     * @param array<mixed> &$data The array to filter (passed by reference)
     * @param callable $filter Filter callback
     */
    public static function filter(array &$data, callable $filter): void
    {
        $data = array_values(array_filter($data, $filter));
    }

    /**
     * Get random entries from an array
     * @param array<mixed> $array Source array
     * @param int $n Number of entries to return (default: 1)
     * @return array<mixed> Array of random entries
     */
    public static function rand(array $array, int $n = 1): array
    {
        if ($n <= 0) {
            return [];
        }

        $keys = array_rand($array, $n);
        if ($n === 1) {
            $keys = [$keys];
        }
        $entries = [];
        foreach ($keys as $key) {
            $entries[] = $array[$key];
        }
        shuffle($entries);
        return $entries;
    }

    /**
     * Search an array for an element matching a test function
     * @param array<mixed> $array Array to search
     * @param callable $test Test function (should return bool)
     * @return int|string|false The key of the found element, or false if not found
     */
    public static function search(array $array, callable $test): int|string|false
    {
        $found = false;
        $iterator = new \ArrayIterator($array);

        while ($found === false && $iterator->valid()) {
            if ($test($iterator->current())) {
                $found = $iterator->key();
            }
            $iterator->next();
        }

        return $found;
    }

    /**
     * Throw an exception with a message
     * @param mixed|null $args Message or data to display
     * @throws VisibleSystemException
     */
    public static function die(mixed $args = null): never
    {
        throw new VisibleSystemException(json_encode($args, JSON_THROW_ON_ERROR));
    }

    /**
     * Compare two zones (position objects with x, y, z keys)
     * @param array{x: int, y: int, z: int} $a First zone
     * @param array{x: int, y: int, z: int} $b Second zone
     * @return int Comparison result (-1, 0, 1)
     */
    public static function compareZones(array $a, array $b): int
    {
        return $a['x'] <=> $b['x'] ?: ($a['y'] <=> $b['y'] ?: $a['z'] <=> $b['z']);
    }

    /**
     * Get unique zones from an array
     * @param array<array{x: int, y: int, z: int}> $arr1 Array of zones
     * @return array<array{x: int, y: int, z: int}> Unique zones
     */
    public static function uniqueZones(array $arr1): array
    {
        return array_values(
            array_uunique($arr1, fn(array $a, array $b): int => self::compareZones($a, $b))
        );
    }

    /**
     * Intersect two arrays of zones
     * @param array<array{x: int, y: int, z: int}> $arr1 First array
     * @param array<array{x: int, y: int, z: int}> $arr2 Second array
     * @return array<array{x: int, y: int, z: int}> Intersection
     */
    public static function intersectZones(array $arr1, array $arr2): array
    {
        return array_values(
            \array_uintersect($arr1, $arr2, fn(array $a, array $b): int => self::compareZones($a, $b))
        );
    }

    /**
     * Diff two arrays of zones
     * @param array<array{x: int, y: int, z: int}> $arr1 First array
     * @param array<array{x: int, y: int, z: int}> $arr2 Second array
     * @return array<array{x: int, y: int, z: int}> Difference
     */
    public static function diffZones(array $arr1, array $arr2): array
    {
        return array_values(
            array_udiff($arr1, $arr2, fn(array $a, array $b): int => self::compareZones($a, $b))
        );
    }
}

/**
 * Get unique elements from an array using a custom comparator
 * @template T
 * @param array<T> $array Source array
 * @param callable(T, T): int $comparator Comparison function
 * @return array<T> Unique elements
 */
function array_uunique(array $array, callable $comparator): array
{
    if (empty($array)) {
        return [];
    }

    $unique_array = [];
    do {
        $element = array_shift($array);
        $unique_array[] = $element;

        $array = array_udiff($array, [$element], $comparator);
    } while (count($array) > 0);

    return $unique_array;
}
