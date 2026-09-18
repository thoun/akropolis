<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Helpers;

if (!function_exists('mysql_escape_string')) {
  function mysql_escape_string(string $str)
  {
    return $str;
  }
}

class QueryBuilder extends \APP_DbObject
{
  private string $table;
  private mixed $cast;
  private string $primary;
  private ?string $associative;
  private ?string $columns;
  private ?string $sql;
  private array $bindValues = [];
  private ?string $where;
  private ?string $orWhere;
  private int $whereCount = 0;
  private bool $isOrWhere = false;
  private ?string $limit;
  private ?string $orderBy;
  private ?bool $log;
  private string|int|bool|null $insertPrimaryIndex;
  private ?string $operation;
  private ?array $operationDatas;

  /**
   * Create a new QueryBuilder
   * @param string $table Table name
   * @param callable|null $cast Cast function for results
   * @param string $primary Primary key column name
   * @param bool|object $log Logging flag or object
   */
  public function __construct(string $table, ?callable $cast = null, string $primary = 'id', bool $log = false)
  {
    $this->table = $table;
    $this->cast = $cast;
    $this->primary = $primary;
    $this->log = $log;
    $this->columns = null;
    $this->sql = null;
    $this->limit = null;
    $this->orderBy = null;
    $this->where = null;
    $this->orWhere = null;
    $this->isOrWhere = false;
  }

  /*************************
   ********* INSERT *********
   *************************/
  /**
   * Single insert, array syntax is [ 'name_of_field' => $value, ... ]
   * @param array<string, mixed> $fields Field => value pairs
   * @param bool $overwriteIfExists Whether to replace if exists
   * @return int Last insert ID
   */
  public function insert(array $fields = [], bool $overwriteIfExists = false): int
  {
    $this->multipleInsert(array_keys($fields), $overwriteIfExists)->values([array_values($fields)]);
    return (int) self::getUniqueValueFromDB("SELECT LAST_INSERT_ID()");
  }

  /**
   * Multiple insert, syntax is: ->multipleInsert(['field1', 'field2'])->values([ [1, 'test'], [2, 'tester'], ...])
   * Note: each values must have the content in same order as the fields
   * @param array<string> $fields Field names
   * @param bool $overwriteIfExists Whether to replace if exists
   * @return self QueryBuilder instance
   */
  public function multipleInsert(array $fields = [], bool $overwriteIfExists = false): self
  {
    $keys = implode('`, `', array_values($fields));
    $this->sql = ($overwriteIfExists ? 'REPLACE' : 'INSERT') . " INTO `{$this->table}` (`{$keys}`) VALUES";
    $this->insertPrimaryIndex = array_search($this->primary, $fields);
    return $this;
  }


  /**
   * Add values for multiple insert
   * @param array<array<mixed>> $rows Array of rows to insert
   * @return array<int|string> Array of inserted IDs
   */
  public function values(array $rows = []): array
  {
    $vals = [];
    $ids  = [];

    foreach ($rows as $row) {
      $rowValues = [];

      foreach ($row as $val) {
        $rowValues[] = $val === null
          ? 'NULL'
          : "'" . mysql_escape_string($val) . "'";
      }

      $vals[] = '(' . implode(',', $rowValues) . ')';

      // Case 1: Primary key explicitly provided
      if ($this->insertPrimaryIndex !== false && $this->insertPrimaryIndex !== null) {
        $ids[] = $row[$this->insertPrimaryIndex];
      }
    }

    $this->sql .= implode(',', $vals);

    // Execute INSERT
    self::DbQuery($this->sql);

    // Case 2: AUTO_INCREMENT primary key
    if ($this->insertPrimaryIndex === false) {
      $firstId = (int) self::getUniqueValueFromDB("SELECT LAST_INSERT_ID()");
      $count   = count($rows);

      for ($i = 0; $i < $count; $i++) {
        $ids[] = $firstId + $i;
      }
    }

    // Case 3: No primary tracking requested (insertPrimaryIndex === null)
    // $ids remains as collected (possibly empty)

    if ($this->log && !empty($ids)) {
      Log::addEntry([
        'table'   => $this->table,
        'primary' => $this->primary,
        'type'    => 'create',
        'affected' => $ids,
      ]);
    }

    return $ids;
  }

  /********************************
   ********* BASIC QUERIES *********
   ********************************/

  /**
   * Delete: optional parameter $id adds a where clause on primary key
   * @param mixed|null $id Primary key value to delete
   * @return int|self Number of affected rows or QueryBuilder for chaining
   */
  public function delete($id = null): int|self
  {
    $this->sql = "DELETE FROM `{$this->table}`";
    $this->operation = 'delete';
    return isset($id) ? $this->run($id) : $this;
  }

  /**
   * Update: $fields array structure is the same as the one for insert
   * Optional parameter $id adds a where clause on primary key
   * @param array<string, mixed> $fields Column => value pairs
   * @param mixed|null $id Primary key value to update
   * @return int|self Number of affected rows or QueryBuilder for chaining
   */
  public function update(array $fields = [], $id = null): int|self
  {
    $values = [];
    foreach ($fields as $column => $field) {
      $values[] = "`$column` = " . (is_null($field) ? 'NULL' : "'$field'");
    }

    $this->operation = 'update';
    $this->operationDatas = array_keys($fields);
    $this->sql = "UPDATE `{$this->table}` SET " . implode(',', $values);
    return isset($id) ? $this->run($id) : $this;
  }

  /**
   * Inc: $fields array structure is the same as for insert, but instead of value to be set,
   * the array contains the offset
   * @param array<string, int> $fields Column => increment value pairs
   * @param mixed|null $id Primary key value to increment
   * @return int|self Number of affected rows or QueryBuilder for chaining
   */
  public function inc(array $fields = [], $id = null): int|self
  {
    $values = [];
    foreach ($fields as $column => $field) {
      $values[] = "`$column` = `$column` + $field";
    }

    $this->operation = 'update';
    $this->operationDatas = array_keys($fields);
    $this->sql = "UPDATE `{$this->table}` SET " . implode(',', $values);
    return isset($id) ? $this->run($id) : $this;
  }

  /**
   * Run a query (DELETE or UPDATE with optional WHERE on primary key)
   * @param mixed|null $id Primary key value for WHERE clause
   * @return int Number of affected rows
   */
  public function run($id = null): int
  {
    if (isset($id)) {
      $this->computeWhereClause([[$id]]);
    }

    if ($this->log) {
      // Log module is on
      $tmp = $this->sql;

      if ($this->operation == 'delete') {
        $this->sql = "SELECT * FROM `{$this->table}`";
      } elseif ($this->operation == 'update') {
        if (!\in_array($this->primary, $this->operationDatas)) {
          $this->operationDatas[] = $this->primary;
        }
        $columns = implode(',', $this->operationDatas);
        $this->sql = "SELECT {$columns} FROM `{$this->table}`";
      }

      $this->assembleQueryClauses();
      $objList = self::getObjectListFromDB($this->sql);
      Log::addEntry([
        'table' => $this->table,
        'primary' => $this->primary,
        'type' => $this->operation,
        'affected' => $objList,
      ]);
      $this->sql = $tmp;
    }

    $this->assembleQueryClauses();
    self::DbQuery($this->sql);
    return self::DbAffectedRow();
  }

  /*********************************
   ********* SELECT QUERIES *********
   *********************************/

  /**
   * Select: fetch rows. Structure is columns is either an array with the name of columns you want to fetch,
   * or an associative array [ 'alias' => 'fieldname'] if you want to use "AS"
   * @param array<string|int, string>|string $columns Columns to select
   * @return self QueryBuilder instance for chaining
   */
  public function select(array|string $columns): self
  {
    $cols = ["{$this->primary} AS `result_associative_index`"];

    if (!is_array($columns)) {
      $cols = [$columns];
    } else {
      foreach ($columns as $alias => $col) {
        $cols[] = is_numeric($alias) ? "`$col`" : "`$col` AS `$alias`";
      }
    }

    $this->columns = implode(' , ', $cols);
    return $this;
  }

  /**
   * Get: run a select query and fetch values
   * @param bool $returnValueIfOnlyOneRow If true, return single value instead of Collection
   * @param bool $debug If true, throw exception with SQL instead of executing
   * @return mixed Single value, null, or Collection of results
   */
  public function get(bool $returnValueIfOnlyOneRow = false, bool $debug = false): mixed
  {
    $select = $this->columns ?? "*, {$this->primary} AS `result_associative_index`";
    $this->sql = "SELECT $select FROM `$this->table`";
    $this->assembleQueryClauses();

    if ($debug) {
      throw new \feException($this->sql);
    }
    $res = self::getObjectListFromDB($this->sql);
    $oRes = [];
    foreach ($res as $row) {
      $id = $row['result_associative_index'];
      unset($row['result_associative_index']);

      $val = $row;
      if (is_callable($this->cast)) {
        $val = forward_static_call($this->cast, $row);
      } elseif (is_string($this->cast)) {
        $val = $this->cast == 'object' ? ((object) $row) : new $this->cast($row);
      }

      $oRes[$id] = $val;
    }

    if ($returnValueIfOnlyOneRow && count($oRes) <= 1) {
      return count($oRes) == 1 ? reset($oRes) : null;
    } else {
      return new Collection($oRes);
    }
  }

  /**
   * Get single row (limit 1)
   * @return mixed Single result or null
   */
  public function getSingle(): mixed
  {
    return $this->limit(1)->get(true);
  }

  /**
   * Execute aggregate function (COUNT, MAX, MIN)
   * @param string $func Function name (COUNT, MAX, MIN)
   * @param string|null $field Field to aggregate, or null for COUNT(*)
   * @return int Result of the aggregate function
   * @throws \BgaVisibleSystemException If unknown function
   */
  public function func(string $func, ?string $field = null): int
  {
    if (!in_array($func, ['COUNT', 'MAX', 'MIN'])) {
      throw new \BgaVisibleSystemException('QueryBuilder: func is called with unknown function');
    }

    $field = is_null($field) ? '*' : "`$field`";
    $this->sql = "SELECT $func($field) FROM `$this->table`";
    $this->assembleQueryClauses();
    return (int) self::getUniqueValueFromDB($this->sql);
  }

  /**
   * Count rows
   * @param string|null $field Field to count, or null for COUNT(*)
   * @return int Number of rows
   */
  public function count(?string $field = null): int
  {
    return self::func('COUNT', $field);
  }

  /**
   * Get minimum value
   * @param string $field Field to get minimum from
   * @return int Minimum value
   */
  public function min(string $field): int
  {
    return self::func('MIN', $field);
  }

  /**
   * Get maximum value
   * @param string $field Field to get maximum from
   * @return int Maximum value
   */
  public function max(string $field): int
  {
    return self::func('MAX', $field);
  }

  /****************************
   ********* MODIFIERS *********
   ****************************/
  /**
   * Append all the modifiers to a query in the right order
   */
  private function assembleQueryClauses(): void
  {
    $this->sql .= $this->where ?? '';
    $this->sql .= $this->orderBy ?? '';
    $this->sql .= $this->limit ?? '';
  }

  /**
   * Protect a value for SQL insertion
   * @param mixed $arg Value to protect
   * @return mixed Protected value (string values are quoted)
   */
  private function protect($arg): string
  {
    return is_string($arg) ? "'" . mysql_escape_string($arg) . "'" : "$arg";
  }

  /**
   * Compute WHERE clause from arguments
   * @param array<mixed> $arg Arguments for WHERE clause
   */
  protected function computeWhereClause(array $arg): void
  {
    $this->where = is_null($this->where) ? ' WHERE ' : $this->where . ($this->isOrWhere ? ' OR ' : ' AND ');

    if (!is_array($arg)) {
      $arg = [$arg];
    }

    $param = array_pop($arg);
    $n = count($param);
    // Only one param => use primary field
    if ($n == 1) {
      $this->where .= " `{$this->primary}` = " . $this->protect($param[0]);
    }
    // Three params : WHERE $1 OP2 $3
    elseif ($n == 3) {
      $this->where .= '`' . trim($param[0]) . '` ' . $param[1] . ' ' . $this->protect($param[2]);
    }
    // Two params : $1 = $2
    elseif ($n == 2) {
      $this->where .= '`' . trim($param[0]) . '` = ' . $this->protect($param[1]);
    }

    if (!empty($arg)) {
      self::computeWhereClause($arg);
    }
  }

  /**
   * Add WHERE clause
   * @param string|array<mixed> $conditions Conditions for WHERE clause
   * @return self QueryBuilder instance for chaining
   */
  public function where(string|array $conditions = []): self
  {
    $this->isOrWhere = false;
    $num_args = func_num_args();
    $args = func_get_args();
    $this->computeWhereClause($num_args == 1 && is_array($args[0]) ? $args[0] : [$args]);
    return $this;
  }

  /**
   * Add WHERE IN clause
   * @param string $field Field name
   * @param array<mixed> $values Values to match
   * @return self QueryBuilder instance for chaining
   */
  public function whereIn(string $field = '', array $values = []): self
  {
    $this->where = is_null($this->where) ? ' WHERE ' : $this->where . ($this->isOrWhere ? ' OR ' : ' AND ');

    $num_args = func_num_args();
    $args = func_get_args();
    $field = $num_args == 1 ? $this->primary : $args[0];
    $values = $num_args == 1 ? $args[0] : $args[1];
    if (is_null($values)) {
      return $this;
    }

    $this->where .= "`$field` IN ('" . implode("','", $values) . "')";
    return $this;
  }

  /**
   * Add WHERE NOT IN clause
   * @param string $field Field name
   * @param array<mixed> $values Values to exclude
   * @return self QueryBuilder instance for chaining
   */
  public function whereNotIn(string $field = '', array $values = []): self
  {
    $this->where = is_null($this->where) ? ' WHERE ' : $this->where . ($this->isOrWhere ? ' OR ' : ' AND ');

    $num_args = func_num_args();
    $args = func_get_args();
    $field = $num_args == 1 ? $this->primary : $args[0];
    $values = $num_args == 1 ? $args[0] : $args[1];
    if (is_null($values)) {
      return $this;
    }

    $this->where .= "`$field` NOT IN ('" . implode("','", $values) . "')";
    return $this;
  }

  /**
   * Add WHERE IS NULL clause
   * @param string $field Field name
   * @return self QueryBuilder instance for chaining
   */
  public function whereNull(string $field): self
  {
    $this->where = is_null($this->where) ? ' WHERE ' : $this->where . ($this->isOrWhere ? ' OR ' : ' AND ');
    $this->where .= "`$field` IS NULL";
    return $this;
  }

  /**
   * Add WHERE IS NOT NULL clause
   * @param string $field Field name
   * @return self QueryBuilder instance for chaining
   */
  public function whereNotNull(string $field): self
  {
    $this->where = is_null($this->where) ? ' WHERE ' : $this->where . ($this->isOrWhere ? ' OR ' : ' AND ');
    $this->where .= "`$field` IS NOT NULL";
    return $this;
  }

  /**
   * Add OR WHERE clause
   * @param string|array<mixed> $conditions Conditions for OR WHERE clause
   * @return self QueryBuilder instance for chaining
   */
  public function orWhere(string|array $conditions = []): self
  {
    $this->isOrWhere = true;
    $num_args = func_num_args();
    $args = func_get_args();
    $this->computeWhereClause($num_args == 1 ? $args[0] : [$args]);
    return $this;
  }

  // Syntaxic sugar
  /**
   * Add WHERE clause for player_id
   * @param int|null $pId Player ID or null
   * @return self QueryBuilder instance for chaining
   */
  public function wherePlayer(?int $pId): self
  {
    return $pId == null ? $this : $this->where('player_id', $pId);
  }

  /**
   * Add LIMIT clause
   * @param int $limit Maximum number of rows
   * @param int|null $offset Offset for LIMIT
   * @return self QueryBuilder instance for chaining
   */
  public function limit(int $limit, ?int $offset = null): self
  {
    $this->limit = " LIMIT {$limit}" . (is_null($offset) ? '' : " OFFSET {$offset}");
    return $this;
  }

  /**
   * Add ORDER BY clause
   * @param string|array{0: string, 1: string} $field_name Field name or [field, order] array
   * @param string $order ASC or DESC (optional if using array syntax)
   * @return self QueryBuilder instance for chaining
   */
  public function orderBy(string|array $field_name = '', string $order = 'ASC'): self
  {
    $num_args = func_num_args();
    $args = func_get_args();

    $field_name = '';
    $order = 'ASC';
    if ($num_args == 1) {
      if (is_array($args[0])) {
        $field_name = trim($args[0][0]);
        $order = trim(strtoupper($args[0][1]));
      } else {
        $field_name = trim($args[0]);
      }
    } else {
      $field_name = trim($args[0]);
      $order = trim(strtoupper($args[1]));
    }

    // validate it's not empty and have a proper valuse
    if ($field_name !== null && ($order == 'ASC' || $order == 'DESC')) {
      if ($this->orderBy == null) {
        $this->orderBy = " ORDER BY $field_name $order";
      } else {
        $this->orderBy .= ", $field_name $order";
      }
    }

    return $this;
  }
}
