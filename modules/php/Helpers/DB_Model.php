<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Helpers;

use Bga\Games\Akropolis\Game;

abstract class DB_Model extends \APP_DbObject implements \JsonSerializable
{
  protected string $table = "";
  protected string $primary = "";
  /**
   * This associative array will link class attributes to db fields
   */
  protected array $attributes = [];

  /**
   * This array will contains class attributes that does not depends on the DB (static info), they can only be accessed, not modified
   */
  protected array $staticAttributes = [];

  /**
   * Fill in class attributes based on DB entry
   * @param array<string, mixed> $row DB row data
   */
  public function __construct(array $row)
  {
    foreach ($this->attributes as $attribute => $field) {
      $fieldName = is_array($field) ? $field[0] : $field;
      $v = $row[$fieldName] ?? null;

      if (is_array($field) && !is_null($v)) {
        if ($field[1] == 'int') {
          $this->$attribute = (int) $v;
        }
        if ($field[1] == 'bool') {
          $this->$attribute = (bool) $v;
        }
        if ($field[1] == 'obj') {
          $this->$attribute = json_decode($v, true);
        }
      } else {
        $this->$attribute = $v;
      }
    }
  }

  /**
   * Get the DB primary row according to attributes mapping
   * @return mixed Primary field value or null
   */
  private function getPrimaryFieldValue(): mixed
  {
    foreach ($this->attributes as $attribute => $field) {
      $fieldName = is_array($field) ? $field[0] : $field;
      if ($fieldName == $this->primary) {
        return $this->$attribute;
      }
    }
    return null;
  }

  /*
   * Magic method that intercept not defined method and do the appropriate stuff
   * @param string $method Method name
   * @param array<mixed> $args Method arguments
   * @return mixed Return value from the operation
   */
  public function __call(string $method, array $args): mixed
  {
    if (preg_match('/^([gs]et|inc|is)([A-Z])(.*)$/', $method, $match)) {
      // Sanity check : does the name correspond to a declared variable ?
      $name = mb_strtolower($match[2]) . $match[3];
      if (!\array_key_exists($name, $this->attributes)) {
        // Static attribute getters
        if (in_array($match[1], ['get', 'is'])) {
          foreach ($this->staticAttributes as $attr) {
            if (is_array($attr) && $name == $attr[0]) {
              return $this->$name ?? ($attr[1] == 'int' ? 0 : []);
            } elseif ($attr == $name) {
              return $this->$name ?? '';
            }
          }
        }
        throw new \InvalidArgumentException("Attribute {$name} doesn't exist");
      }

      if ($match[1] == 'get') {
        if (count($args) > 0 && is_array($this->attributes[$name]) && $this->attributes[$name][1] == 'obj') {
          // Handle json field
          return $this->$name[$args[0]] ?? null;
        } else {
          // Basic getters
          return $this->$name;
        }
      } elseif ($match[1] == 'is') {
        // Boolean getter
        return (bool) ($this->$name != 0);
      } elseif ($match[1] == 'set') {
        // Setters in DB and update cache
        $value = $args[0];

        // Auto-cast
        $field = $this->attributes[$name];
        $fieldName = is_array($field) ? $field[0] : $field;
        $isObj = false;
        if (is_array($field)) {
          if ($field[1] == 'int') {
            $value = (int) $value;
            if ($value == $this->$name) {
              return $value; // No modification, abort DB call
            }
          }
          if ($field[1] == 'bool') {
            $value = (bool) $value;
            if ($value == $this->$name) {
              return $value; // No modification, abort DB call
            }
          }
          if ($field[1] == 'obj') {
            $isObj = true;
            $value = count($args) > 1 ? $args[1] : $args[0];
            $objKey = count($args) > 1 ? $args[0] : null;
          }
        }

        if ($isObj && $objKey !== null) {
          $this->$name[$objKey] = $value;
        } else {
          $this->$name = $value;
        }

        $updateValue = $this->$name;
        if ($isObj) {
          $updateValue = json_encode($updateValue);
        }
        if ($value != null) {
          $updateValue = \addslashes(strval($updateValue));
        }

        // $this->DB()->update([$this->attributes[$name] => \addslashes($value)], $this->getPrimaryFieldValue());
        $this->DB()->update([$fieldName => $updateValue], $this->getPrimaryFieldValue());
        return $value;
      } elseif ($match[1] == 'inc') {
        $getter = 'get' . $match[2] . $match[3];
        $setter = 'set' . $match[2] . $match[3];
        return $this->$setter($this->$getter() + (empty($args) ? 1 : $args[0]));
      }
      throw new \feException('Unknown type ' . $method);
    } else {
      throw new \feException('Undefined method ' . $method);
    }
  }

  /**
   * Return an array of attributes for JSON serialization
   * @return array<string, mixed> Attribute data
   */
  public function jsonSerialize(): array
  {
    $data = [];
    foreach ($this->attributes as $attribute => $field) {
      $data[$attribute] = $this->$attribute;
    }

    return $data;
  }

  /**
   * Get static data (non-DB attributes)
   * @return array<string, mixed> Static attribute data
   */
  public function getStaticData(): array
  {
    $data = [];
    foreach ($this->staticAttributes as $attribute) {
      if (is_array($attribute)) {
        $attribute = $attribute[0];
      }
      $getter = 'get' . ucfirst($attribute);
      $data[$attribute] = $this->$getter();
    }

    return $data;
  }

  /**
   * Get UI data (combines DB attributes and static data)
   * @return array<string, mixed> Combined data for UI
   */
  public function getUiData(): array
  {
    return array_merge($this->jsonSerialize(), $this->getStaticData());
  }

  /**
   * Private DB call
   * @return QueryBuilder QueryBuilder instance
   */
  private function DB(): QueryBuilder
  {
    if (is_null($this->table)) {
      throw new \feException('You must specify the table you want to do the query on');
    }

    return new QueryBuilder(
      $this->table,
      function ($row) {
        return $row;
      },
      $this->primary,
      true
    );
  }
}
