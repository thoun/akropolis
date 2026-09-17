<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Helpers;

/**
 * Database Manager
 * Base class for database operations with typing
 */
class DB_Manager extends \APP_DbObject
{
  protected static string $table = "";
  protected static string $primary = "";
  protected static bool $log = true;

  /**
   * Cast a database row to the appropriate type
   * @param array<string, mixed> $row Database row
   * @return array<string, mixed> Casted row
   */
  protected static function cast(array $row): mixed
  {
    return $row;
  }

  /**
   * Get a QueryBuilder instance for the specified table
   * @param string|null $table Table name (uses static::$table if null)
   * @return QueryBuilder QueryBuilder instance
   * @throws \feException If table is not specified
   */
  public static function DB(?string $table = null): QueryBuilder
  {
    if ($table === null) {
      if (static::$table === "") {
        throw new \feException('You must specify the table you want to do the query on');
      }
      $table = static::$table;
    }

    $log = new Log(static::$table, static::$primary);

    return new QueryBuilder(
      $table,
      fn(array $row): mixed => static::cast($row),
      static::$primary,
      $log
    );
  }

  /**
   * Enable logging
   */
  public static function startLog(): void
  {
    static::$log = true;
  }

  /**
   * Disable logging and clear existing logs
   */
  public static function stopLog(): void
  {
    static::$log = false;
    $log = new Log(static::$table, static::$primary);
    $log->clearAll();
  }

  /**
   * Revert all database changes from logs
   */
  public static function revertLogs(): void
  {
    $log = new Log(static::$table, static::$primary);
    $log->revertAll();
  }
}
