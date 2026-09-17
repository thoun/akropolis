<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Helpers;

/**
 * Collection class that extends ArrayObject with useful methods
 * @template TKey of array-key
 * @template TValue
 */
class Collection extends \ArrayObject
{
  /**
   * Get all IDs (keys) from the collection
   * @return array<TKey> Array of keys
   */
  public function getIds(): array
  {
    return array_keys($this->getArrayCopy());
  }

  /**
   * Check if collection is empty
   */
  public function empty(): bool
  {
    return empty($this->getArrayCopy());
  }

  /**
   * Serialize collection to JSON-compatible array
   * @return array<TKey, mixed> JSON-serializable array
   */
  public function jsonSerialize(): array
  {
    $t = [];
    foreach ($this->getArrayCopy() as $key => $obj) {
      $t[$key] = is_object($obj) && method_exists($obj, 'jsonSerialize') ? $obj->jsonSerialize() : $obj;
    }
    return $t;
  }

  /**
   * Check if a key exists in the collection
   * @param TKey $key The key to check
   */
  public function has(int|string $key): bool
  {
    return array_key_exists($key, $this->getArrayCopy());
  }

  /**
   * Get the first element
   * @return TValue|null First element or null if empty
   */
  public function first(): mixed
  {
    $arr = $this->toArray();
    return isset($arr[0]) ? $arr[0] : null;
  }

  /**
   * Get the last element
   * @return TValue|null Last element or null if empty
   */
  public function last(): mixed
  {
    $arr = $this->toArray();
    return empty($arr) ? null : $arr[count($arr) - 1];
  }

  /**
   * Get a random element
   * @return TValue Random element
   */
  public function rand(): mixed
  {
    $arr = $this->getArrayCopy();
    if (empty($arr)) {
      return null;
    }
    $key = array_rand($arr, 1);
    return $arr[$key];
  }

  /**
   * Convert collection to indexed array
   * @return array<TValue> Indexed array of values
   */
  public function toArray(): array
  {
    return array_values($this->getArrayCopy());
  }

  /**
   * Add an object to the collection
   * @param object{TKey: mixed} $obj Object with getId() method
   * @return self
   */
  public function push(object $obj): static
  {
    $this[$obj->getId()] = $obj;
    return $this;
  }

  /**
   * Convert collection to associative array
   * @return array<TKey, TValue> Associative array
   */
  public function toAssoc(): array
  {
    return $this->getArrayCopy();
  }

  /**
   * Map each element through a callback
   * @param callable(TValue): mixed $func Callback function
   * @return Collection<TKey, mixed> New collection with mapped values
   */
  public function map(callable $func): Collection
  {
    return new Collection(array_map($func, $this->toAssoc()));
  }

  /**
   * Merge with another collection
   * @param Collection<TKey, TValue> $arr Collection to merge with
   * @return Collection<TKey, TValue> Merged collection
   */
  public function merge(Collection $arr): Collection
  {
    return new Collection($this->toAssoc() + $arr->toAssoc());
  }

  /**
   * Reduce collection to a single value
   * @template TResult
   * @param callable(TResult, TValue): TResult $func Reduce function
   * @param TResult $init Initial value
   * @return TResult Reduced value
   */
  public function reduce(callable $func, mixed $init): mixed
  {
    return array_reduce($this->toArray(), $func, $init);
  }

  /**
   * Filter collection by callback
   * @param callable(mixed, TKey): bool $func Filter function (value, key)
   * @return Collection<TKey, TValue> Filtered collection
   */
  public function filter(callable $func): Collection
  {
    return new Collection(array_filter($this->toAssoc(), $func, ARRAY_FILTER_USE_BOTH));
  }

  /**
   * Limit collection to N elements
   * @param int $n Maximum number of elements
   * @return Collection<TKey, TValue> Limited collection
   */
  public function limit(int $n): Collection
  {
    return new Collection(array_slice($this->toAssoc(), 0, $n, true));
  }

  /**
   * Check if collection includes a value
   * @param mixed $t Value to check
   */
  public function includes(mixed $t): bool
  {
    return in_array($t, $this->getArrayCopy(), true);
  }

  /**
   * Get UI data for all elements as indexed array
   * @return array<array> UI data for all elements
   */
  public function ui(): array
  {
    return $this->map(fn($elem) => $elem->getUiData())->toArray();
  }

  /**
   * Get UI data for all elements as associative array
   * @return array UI data for all elements (associative)
   */
  public function uiAssoc(): array
  {
    return $this->map(fn($elem) => $elem->getUiData())->toAssoc();
  }

  /**
   * Order collection using a callback
   * @param callable(TValue, TValue): int $callback Comparison function
   * @return Collection<TKey, TValue> Ordered collection
   */
  public function order(callable $callback): Collection
  {
    $t = $this->getArrayCopy();
    \uasort($t, $callback);
    return new Collection($t);
  }

  /**
   * Filter collection by field value
   * @param string $field Field name (will call get{Field} on objects)
   * @param mixed $value Value to match
   * @return Collection<TKey, TValue> Filtered collection
   */
  public function where(string $field, mixed $value): Collection
  {
    if (is_null($value)) {
      return $this;
    }

    return $this->filter(function ($obj) use ($field, $value) {
      $method = 'get' . ucfirst($field);
      $objValue = $obj->$method();
      if (is_array($value)) {
        return in_array($objValue, $value, true);
      }
      if (strpos($value, '%') !== false) {
        return like_match($value, (string)$objValue);
      }
      return $objValue == $value;
    });
  }

  /**
   * Filter collection by null field value
   * @param string $field Field name
   * @return Collection<TKey, TValue> Filtered collection
   */
  public function whereNull(string $field): Collection
  {
    return $this->filter(function ($obj) use ($field) {
      $method = 'get' . ucfirst($field);
      return is_null($obj->$method());
    });
  }

  /**
   * Order collection by field value
   * @param string $field Field name (will call get{Field} on objects)
   * @param string $asc Sort direction ('ASC' or 'DESC')
   * @return Collection<TKey, TValue> Ordered collection
   */
  public function orderBy(string $field, string $asc = 'ASC'): Collection
  {
    return $this->order(function ($a, $b) use ($field, $asc) {
      $method = 'get' . ucfirst($field);
      return $asc === 'ASC' ? $a->$method() <=> $b->$method() : $b->$method() <=> $a->$method();
    });
  }

  /**
   * Update field on all objects in collection
   * @param string $field Field name (will call set{Field} on objects)
   * @param mixed $value Value to set
   * @return self
   */
  public function update(string $field, mixed $value): static
  {
    $method = 'set' . ucfirst($field);
    foreach ($this->getArrayCopy() as $obj) {
      $obj->$method($value);
    }
    return $this;
  }
}

/**
 * SQL LIKE pattern matching for strings
 * @param string $pattern Pattern with % as wildcard
 * @param string $subject String to match
 * @return bool True if subject matches pattern
 */
function like_match(string $pattern, string $subject): bool
{
  $pattern = str_replace('%', '.*', preg_quote($pattern, '/'));
  return (bool) preg_match("/^{$pattern}$/i", $subject);
}
