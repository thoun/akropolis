<?php

declare(strict_types=1);

namespace Bga\Games\Akropolis\Helpers;

/*
 * This is a generic class to manage game pieces.
 *
 * On DB side this is based on a standard table with the following fields:
 * %prefix_%id (string), %prefix_%location (string), %prefix_%state (int)
 *
 *
 * CREATE TABLE IF NOT EXISTS `token` (
 * `token_id` varchar(32) NOT NULL,
 * `token_location` varchar(32) NOT NULL,
 * `token_state` int(10),
 * PRIMARY KEY (`token_id`)
 * ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
 *
 * CREATE TABLE IF NOT EXISTS `card` (
 * `card_id` int(32) NOT NULL AUTO_INCREMENT,,
 * `card_location` varchar(32) NOT NULL,
 * `card_state` int(10),
 * PRIMARY KEY (`card_id`)
 * ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
 *
 */

class Pieces extends DB_Manager
{
  protected static string $table = "";
  protected static mixed $cast = null;

  protected static string $prefix = 'piece_';
  protected static bool $autoIncrement = true;
  protected static string $primary;
  protected static bool $autoremovePrefix = true;
  protected static bool $autoreshuffle = false; // If true, a new deck is automatically formed with a reshuffled discard as soon as it is needed
  protected static ?array $autoreshuffleListener = null; // Callback to a method called when an autoreshuffle occurs
  // autoreshuffleListener = array( 'obj' => object, 'method' => method_name )
  // If defined, tell the name of the deck and what is the corresponding discard (ex: "mydeck" => "mydiscard")
  protected static array $autoreshuffleCustom = [];
  protected static array $customFields = [];
  protected static array $gIndex = [];

  /**
   * Get QueryBuilder for the pieces table
   * @param string|null $table Table name override (optional)
   * @return QueryBuilder QueryBuilder instance
   */
  public static function DB(?string $table = null): QueryBuilder
  {
    static::$primary = static::$prefix . 'id';
    return parent::DB(static::$table);
  }

  // TODO : putDeckOnTop
  // TODO : pickRandomFor
  // TODO : collection filter

  /************************************
   *************************************
   ********* QUERY BUILDER *************
   *************************************
   ************************************/

  /**
   * Overwritable function to add base filter to any query
   * => useful if two kind of "stuff" cohabitates
   * @param QueryBuilder $query Query to modify
   */
  protected static function addBaseFilter(QueryBuilder &$query): void {}

  /****
   * Return the basic select query fetching basic fields and custom fields
   * @return QueryBuilder QueryBuilder instance
   */
  final static function getSelectQuery(): QueryBuilder
  {
    $basic = [
      'id' => static::$prefix . 'id',
      'location' => static::$prefix . 'location',
      'state' => static::$prefix . 'state',
    ];
    if (!static::$autoremovePrefix) {
      $basic = array_values($basic);
    }

    $query = self::DB()->select(array_merge($basic, static::$customFields));
    static::addBaseFilter($query);
    return $query;
  }

  /**
   * Return update query for pieces
   * @param array<int|string>|int|string|null $ids IDs to update
   * @param string|null $location Location to set
   * @param int|null $state State to set
   * @return QueryBuilder QueryBuilder instance
   */
  final static function getUpdateQuery(array|int|string|null $ids = [], ?string $location = null, ?int $state = null): QueryBuilder
  {
    $data = [];
    if (!is_null($location)) {
      $data[static::$prefix . 'location'] = $location;
    }
    if (!is_null($state)) {
      $data[static::$prefix . 'state'] = $state;
    }

    $query = self::DB()->update($data);
    if (!is_null($ids)) {
      $query = $query->whereIn(static::$prefix . 'id', is_array($ids) ? $ids : [$ids]);
    }

    static::addBaseFilter($query);
    return $query;
  }

  /****
   * Return a select query with a where condition
   * @param QueryBuilder $query Query to modify
   * @param string|int|null $id ID to filter by
   * @param string|null $location Location to filter by
   * @param int|null $state State to filter by
   * @return QueryBuilder QueryBuilder instance
   */
  protected static function addWhereClause(QueryBuilder &$query, string|int|null $id = null, ?string $location = null, ?int $state = null): QueryBuilder
  {
    if (!is_null($id)) {
      $whereOp = strpos($id, '%') !== false ? 'LIKE' : '=';
      $query = $query->where(static::$prefix . 'id', $whereOp, $id);
    }

    if (!is_null($location)) {
      $whereOp = strpos($location, '%') !== false ? 'LIKE' : '=';
      $query = $query->where(static::$prefix . 'location', $whereOp, $location);
    }

    if (!is_null($state)) {
      $query = $query->where(static::$prefix . 'state', $state);
    }

    return $query;
  }

  /****
   * Append the basic select query with a where clause
   * @param string|int|null $id ID to filter by
   * @param string|null $location Location to filter by
   * @param int|null $state State to filter by
   * @return QueryBuilder QueryBuilder instance
   */
  public static function getSelectWhere(string|int|null $id = null, ?string $location = null, ?int $state = null): QueryBuilder
  {
    $query = self::getSelectQuery();
    self::addWhereClause($query, $id, $location, $state);
    return $query;
  }

  /************************************
   *************************************
   ********* SANITY CHECKS *************
   *************************************
   ************************************/

  /**
   * Check that the location only contains alphanum and underscore character
   *  -> if the location is an array, implode it using underscores
   * @param string|array<string> $location Location to check (passed by reference, may be modified)
   * @param bool $like Whether to allow LIKE wildcards
   * @return void
   * @throws \BgaVisibleSystemException If location is invalid
   */
  final static function checkLocation(&$location, bool $like = false): void
  {
    if (is_null($location)) {
      throw new \BgaVisibleSystemException('Class Pieces: location cannot be null');
    }

    if (is_array($location)) {
      $location = implode('-', $location);
    }

    $extra = $like ? '%' : '';
    if (preg_match("/^[A-Za-z0-9${extra}-][A-Za-z_0-9${extra}-]*$/", $location) == 0) {
      throw new \BgaVisibleSystemException("Class Pieces: location must be alphanum and underscore non empty string '$location'");
    }
  }

  /**
   * Check that the id is alphanum and underscore
   * @param string $id ID to check (passed by reference)
   * @param bool $like Whether to allow LIKE wildcards
   * @throws \BgaVisibleSystemException If ID is invalid
   */
  final static function checkId(&$id, bool $like = false): void
  {
    if (is_null($id)) {
      throw new \BgaVisibleSystemException('Class Pieces: id cannot be null');
    }

    $extra = $like ? '%' : '';
    if (preg_match("/^[A-Za-z_0-9${extra}]+$/", strval($id)) == 0) {
      throw new \BgaVisibleSystemException("Class Pieces: id must be alphanum and underscore non empty string '$id'");
    }
  }

  /**
   * Check that the array is valid
   * @param array<string>|null $arr Array of IDs to check
   * @throws \BgaVisibleSystemException If array is invalid
   */
  final static function checkIdArray(?array $arr): void
  {
    if (is_null($arr)) {
      throw new \BgaVisibleSystemException('Class Pieces: tokens cannot be null');
    }

    if (!is_array($arr)) {
      throw new \BgaVisibleSystemException('Class Pieces: tokens must be an array');
      foreach ($arr as $id) {
        self::checkId($id);
      }
    }
  }

  /**
   * Check that the state is an integer
   * @param int|string|null $state State to check
   * @param bool $canBeNull Whether null is allowed
   * @throws \BgaVisibleSystemException If state is invalid
   */
  final static function checkState($state, bool $canBeNull = false): void
  {
    if (is_null($state) && !$canBeNull) {
      throw new \BgaVisibleSystemException('Class Pieces: state cannot be null');
    }

    if (!is_null($state) && preg_match('/^-*[0-9]+$/', strval($state)) == 0) {
      throw new \BgaVisibleSystemException('Class Pieces: state must be integer number');
    }
  }

  /**
   * Check that a given variable is a positive integer
   * @param int|string $n Number to check
   * @throws \BgaVisibleSystemException If number is invalid
   */
  final static function checkPosInt($n): void
  {
    if ($n && preg_match('/^[0-9]+$/', strval($n)) == 0) {
      throw new \BgaVisibleSystemException('Class Pieces: number of pieces must be integer number');
    }
  }

  /************************************
   *************************************
   ************** GETTERS **************
   *************************************
   ************************************/

  /**
   * Get all the pieces
   * @return Collection Collection of all pieces
   */
  public static function getAll(): Collection
  {
    return self::getSelectQuery()->get();
  }

  /**
   * Get specific piece by id
   * @param int|string $id ID of piece to get
   * @param bool $raiseExceptionIfNotEnough Whether to raise exception if not found
   * @return mixed Single piece or Collection
   */
  public static function get(int|string $id, bool $raiseExceptionIfNotEnough = true): mixed
  {
    $result = self::getMany($id, $raiseExceptionIfNotEnough);
    return $result->count() == 1 ? $result->first() : $result;
  }

  /**
   * Get multiple pieces by IDs
   * @param array<int|string>|int|string $ids IDs of pieces to get
   * @param bool $raiseExceptionIfNotEnough Whether to raise exception if not all found
   * @return Collection Collection of pieces
   * @throws \feException If pieces not found and raiseExceptionIfNotEnough is true
   */
  public static function getMany(array|int|string $ids, bool $raiseExceptionIfNotEnough = true): Collection
  {
    if (!is_array($ids)) {
      $ids = [$ids];
    }

    self::checkIdArray($ids);
    if (empty($ids)) {
      return new Collection([]);
    }

    $result = self::getSelectQuery()
      ->whereIn(static::$prefix . 'id', $ids)
      ->get(false);
    if (count($result) != count($ids) && $raiseExceptionIfNotEnough) {
      // throw new \feException(print_r(\debug_print_backtrace()));
      throw new \feException(
        'Class Pieces: getMany, some pieces have not been found !' . static::$table . ' => ' . json_encode($ids)
      );
    }

    return $result;
  }

  /**
   * Get a single piece by ID
   * @param int|string $id ID of piece to get
   * @param bool $raiseExceptionIfNotEnough Whether to raise exception if not found
   * @return mixed Single piece or null
   */
  public static function getSingle(int|string $id, bool $raiseExceptionIfNotEnough = true): mixed
  {
    $result = self::getMany([$id], $raiseExceptionIfNotEnough);
    return $result->count() == 1 ? $result->first() : null;
  }

  /**
   * Get state of a specific piece
   * @param int|string $id ID of piece
   * @return int|null State value or null if not found
   */
  public static function getState(int|string $id): ?int
  {
    $res = self::get($id);
    return is_null($res) ? null : $res[(static::$autoremovePrefix ? '' : static::$prefix) . 'state'];
  }

  /**
   * Get location of a specific piece
   * @param int|string $id ID of piece
   * @return string|null Location value or null if not found
   */
  public static function getLocation(int|string $id): ?string
  {
    $res = self::get($id);
    return is_null($res) ? null : $res[(static::$autoremovePrefix ? '' : static::$prefix) . 'location'];
  }

  /**
   * Get max or min state of the specific location
   * @param bool $getMax Whether to get max (true) or min (false)
   * @param string $location Location to check
   * @param int|string|null $id ID to filter by
   * @return int Extreme position value
   */
  public static function getExtremePosition(bool $getMax, string $location, int|string|null $id = null): int
  {
    $whereOp = self::checkLocation($location, true);
    $query = self::DB();
    self::addWhereClause($query, $id, $location);
    return $query->func($getMax ? 'MAX' : 'MIN', static::$prefix . 'state') ?? 0;
  }

  /**
   * Return "$nbr" piece on top of this location, top defined as item with higher state value
   * @param string $location Location to get from
   * @param int $n Number of pieces to get
   * @param bool $returnValueIfOnlyOneRow Whether to return single value if only one row
   * @return mixed Single piece, Collection, or null
   */
  public static function getTopOf(string $location, int $n = 1, bool $returnValueIfOnlyOneRow = true): mixed
  {
    self::checkLocation($location);
    self::checkPosInt($n);
    return self::getSelectWhere(null, $location)
      ->orderBy(static::$prefix . 'state', 'DESC')
      ->limit($n)
      ->get($returnValueIfOnlyOneRow);
  }

  /**
   * Return all pieces in specific location (query builder)
   * note: if "order by" is used, result object is NOT indexed by ids
   * @param string $location Location to get from
   * @param int|null $state State to filter by
   * @param array<string>|null $orderBy Order by clause
   * @return QueryBuilder QueryBuilder instance
   */
  public static function getInLocationQ(string $location, ?int $state = null, ?array $orderBy = null): QueryBuilder
  {
    self::checkLocation($location, true);
    self::checkState($state, true);

    $query = self::getSelectWhere(null, $location, $state);
    if (!is_null($orderBy)) {
      $query = $query->orderBy($orderBy);
    }

    return $query;
  }

  /**
   * Return all pieces in specific location
   * @param string $location Location to get from
   * @param int|null $state State to filter by
   * @param array<string>|null $orderBy Order by clause
   * @return Collection Collection of pieces
   */
  public static function getInLocation(string $location, ?int $state = null, ?array $orderBy = null): Collection
  {
    return self::getInLocationQ($location, $state, $orderBy)->get();
  }

  /**
   * Return all pieces in specific location ordered by state
   * @param string $location Location to get from
   * @param int|null $state State to filter by
   * @return Collection Collection of pieces
   */
  public static function getInLocationOrdered(string $location, ?int $state = null): Collection
  {
    return self::getInLocation($location, $state, [static::$prefix . 'state', 'ASC']);
  }

  /**
   * Return number of pieces in specific location
   * @param string $location Location to count
   * @param int|null $state State to filter by
   * @return int Number of pieces
   */
  public static function countInLocation(string $location, ?int $state = null): int
  {
    self::checkLocation($location, true);
    self::checkState($state, true);
    return self::getSelectWhere(null, $location, $state)->count();
  }

  /**
   * getFilteredQuery : many times the DB scheme has a pId and a type extra field, this allow for a shortcut for a query for these case
   * @param int $pId Player ID
   * @param string|null $location Location to filter by
   * @param string|array<string>|null $type Type to filter by
   * @return QueryBuilder QueryBuilder instance
   */
  public static function getFilteredQuery(int $pId, ?string $location = null, string|array|null $type = null): QueryBuilder
  {
    $query = self::getSelectQuery()->wherePlayer($pId);
    if ($location != null) {
      $query = $query->where(static::$prefix . 'location', strpos($location, '%') === false ? '=' : 'LIKE', $location);
    }
    if ($type != null) {
      if (is_array($type)) {
        $query = $query->whereIn('type', $type);
      } else {
        $query = $query->where('type', strpos($type, '%') === false ? '=' : 'LIKE', $type);
      }
    }
    return $query;
  }

  /**
   * Get filtered pieces
   * @param int $pId Player ID
   * @param string|null $location Location to filter by
   * @param string|array<string>|null $type Type to filter by
   * @return Collection Collection of filtered pieces
   */
  public static function getFiltered(int $pId, ?string $location = null, string|array|null $type = null): Collection
  {
    return static::getFilteredQuery($pId, $location, $type)->get();
  }

  /************************************
   *************************************
   ************** SETTERS **************
   *************************************
   ************************************/
  /**
   * Set state of a piece
   * @param int|string $id ID of piece
   * @param int $state State to set
   * @return int Number of affected rows
   */
  public static function setState(int|string $id, int $state): int
  {
    self::checkState($state);
    self::checkId($id);
    return self::getUpdateQuery($id, null, $state)->run();
  }

  /*
   * Move one (or many) pieces to given location
   * @param array<int|string>|int|string $ids ID(s) of pieces to move
   * @param string $location Location to move to
   * @param int $state State to set (default 0)
   * @return array<int|string> Array of moved IDs
   */
  public static function move(array|int|string $ids, string $location, int $state = 0): array
  {
    if (!is_array($ids)) {
      $ids = [$ids];
    }
    if (empty($ids)) {
      return [];
    }

    self::checkLocation($location);
    self::checkState($state);
    self::checkIdArray($ids);
    self::getUpdateQuery($ids, $location, $state)->run();
    return $ids;
  }

  /*
   *  Move all tokens from a location to another
   *  !!! state is reset to 0 or specified value !!!
   *  if "fromLocation" and "fromState" are null: move ALL cards to specific location
   * @param string|null $fromLocation Source location
   * @param string $toLocation Destination location
   * @param int|null $fromState Source state
   * @param int $toState Destination state (default 0)
   * @return int Number of affected rows
   */
  public static function moveAllInLocation(?string $fromLocation, string $toLocation, ?int $fromState = null, int $toState = 0): int
  {
    if (!is_null($fromLocation)) {
      self::checkLocation($fromLocation);
    }
    self::checkLocation($toLocation);

    $query = self::getUpdateQuery(null, $toLocation, $toState);
    self::addWhereClause($query, null, $fromLocation, $fromState);
    return $query->run();
  }

  /**
   * Move all pieces from a location to another location arg stays with the same value
   * @param string $fromLocation Source location
   * @param string $toLocation Destination location
   * @return int Number of affected rows
   */
  public static function moveAllInLocationKeepState(string $fromLocation, string $toLocation): int
  {
    self::checkLocation($fromLocation);
    self::checkLocation($toLocation);
    return self::moveAllInLocation($fromLocation, $toLocation, null, 0);
  }

  /*
   * Pick the first "$nbr" pieces on top of specified deck and place it in target location
   * Return pieces infos or void array if no card in the specified location
   * @param int $nbr Number of pieces to pick
   * @param string $fromLocation Source location
   * @param string $toLocation Destination location
   * @param int $state State to set (default 0)
   * @param bool $deckReform Whether to reform deck from discard if needed
   * @return Collection Collection of picked pieces
   */
  public static function pickForLocation(int $nbr, string $fromLocation, string $toLocation, int $state = 0, bool $deckReform = true): Collection
  {
    self::checkLocation($fromLocation);
    self::checkLocation($toLocation);
    $pieces = self::getTopOf($fromLocation, $nbr, false);
    $ids = $pieces->getIds();
    self::getUpdateQuery($ids, $toLocation, $state)->run();
    $pieces = self::getMany($ids);

    // No more pieces in deck & reshuffle is active => form another deck
    if (
      array_key_exists($fromLocation, static::$autoreshuffleCustom) &&
      count($pieces) < $nbr &&
      static::$autoreshuffle &&
      $deckReform
    ) {
      $missing = $nbr - count($pieces);
      self::reformDeckFromDiscard($fromLocation);
      $pieces = $pieces->merge(self::pickForLocation($missing, $fromLocation, $toLocation, $state, false)); // Note: block another deck reform
    }

    return $pieces;
  }

  /**
   * Pick one piece from location
   * @param string $fromLocation Source location
   * @param string $toLocation Destination location
   * @param int $state State to set (default 0)
   * @param bool $deckReform Whether to reform deck from discard if needed
   * @return mixed Single piece or null
   */
  public static function pickOneForLocation(string $fromLocation, string $toLocation, int $state = 0, bool $deckReform = true): mixed
  {
    return self::pickForLocation(1, $fromLocation, $toLocation, $state, $deckReform)->first();
  }

  /*
   * Reform a location from another location when enmpty
   * @param string $fromLocation Location to reform
   * @return void
   * @throws \BgaVisibleSystemException If discard location is unknown
   */
  public static function reformDeckFromDiscard(string $fromLocation): void
  {
    self::checkLocation($fromLocation);
    if (!array_key_exists($fromLocation, static::$autoreshuffleCustom)) {
      throw new \BgaVisibleSystemException("Class Pieces:reformDeckFromDiscard: Unknown discard location for $fromLocation !");
    }

    $discard = static::$autoreshuffleCustom[$fromLocation];
    self::checkLocation($discard);
    self::moveAllInLocation($discard, $fromLocation);
    self::shuffle($fromLocation);
    if (static::$autoreshuffleListener) {
      $obj = static::$autoreshuffleListener['obj'];
      $method = static::$autoreshuffleListener['method'];
      $obj->$method($fromLocation);
    }
  }

  /*
   * Shuffle pieces of a specified location, result of the operation will changes state of the piece to be a position after shuffling
   * @param string $location Location to shuffle
   * @return void
   */
  public static function shuffle(string $location): void
  {
    self::checkLocation($location);
    $pieces = self::getInLocation($location)->getIds();
    shuffle($pieces);
    foreach ($pieces as $state => $id) {
      self::getUpdateQuery($id, null, $state)->run();
    }
  }

  // Move a card to a specific location where card are ordered. If location_arg place is already taken, increment
  // all tokens after location_arg in order to insert new card at this precise location
  /**
   * Insert a piece at a specific position in a location
   * @param int|string $id ID of piece to insert
   * @param string $location Location to insert into
   * @param int $state Position/state to insert at (default 0)
   * @return void
   */
  public static function insertAt(int|string $id, string $location, int $state = 0): void
  {
    self::checkLocation($location);
    self::checkState($state);
    $p = static::$prefix;
    self::DB()
      ->inc([$p . 'state' => 1])
      ->where($p . 'location', $location)
      ->where($p . 'state', '>=', $state)
      ->run();
    self::move($id, $location, $state);
  }

  /**
   * Insert a piece on top of a location
   * @param int|string $id ID of piece to insert
   * @param string $location Location to insert into
   * @return void
   */
  public static function insertOnTop(int|string $id, string $location): void
  {
    $pos = self::getExtremePosition(true, $location);
    self::insertAt($id, $location, $pos + 1);
  }

  /**
   * Insert a piece at the bottom of a location
   * @param int|string $id ID of piece to insert
   * @param string $location Location to insert into
   * @return void
   */
  public static function insertAtBottom(int|string $id, string $location): void
  {
    $pos = self::getExtremePosition(false, $location);
    self::insertAt($id, $location, $pos - 1);
  }

  /************************************
   ******** CREATE NEW PIECES **********
   ************************************/

  /* This inserts new records in the database.
   * Generically speaking you should only be calling during setup
   *  with some rare exceptions.
   *
   * Pieces is an array with at least the following fields:
   * [
   *   [
   *     "id" => <unique id>    // This unique alphanum and underscore id, use {INDEX} to replace with index if 'nbr' > 1, i..e "meeple_{INDEX}_red"
   *     "nbr" => <nbr>           // Number of tokens with this id, optional default is 1. If nbr >1 and id does not have {INDEX} it will throw an exception
   *     "nbrStart" => <nbr>           // Optional, if the indexing does not start at 0
   *     "location" => <location>       // Optional argument specifies the location, alphanum and underscore
   *     "state" => <state>             // Optional argument specifies integer state, if not specified and $token_state_global is not specified auto-increment is used
   */

  /**
   * Create new pieces in the database
   * @param array<array<string, mixed>> $pieces Array of piece definitions
   * @param string|null $globalLocation Default location for all pieces
   * @param int|null $globalState Default state for all pieces
   * @param string|null $globalId Default ID for all pieces
   * @return array<int|string> Array of created IDs
   * @throws \BgaVisibleSystemException If validation fails
   */
  public static function create(array $pieces, ?string $globalLocation = null, ?int $globalState = null, ?string $globalId = null): array
  {
    $pos = is_null($globalLocation) ? 0 : self::getExtremePosition(true, $globalLocation) + 1;

    $values = [];
    $ids = [];
    foreach ($pieces as $info) {
      $n = $info['nbr'] ?? 1;
      $start = $info['nbrStart'] ?? 0;
      $id = $info['id'] ?? $globalId;
      $location = $info['location'] ?? $globalLocation;
      $state = $info['state'] ?? $globalState;
      if (is_null($state)) {
        $state = $location == $globalLocation ? $pos++ : 0;
      }

      // SANITY
      if (is_null($id) && !static::$autoIncrement) {
        throw new \BgaVisibleSystemException('Class Pieces: create: id cannot be null if not autoincrement');
      }

      if (is_null($location)) {
        throw new \BgaVisibleSystemException(
          'Class Pieces : create location cannot be null (set per token location or location_global'
        );
      }
      self::checkLocation($location);

      for ($i = $start; $i < $n + $start; $i++) {
        $data = [];
        if (static::$autoIncrement) {
          $data = [$location, $state];
        } else {
          $nId = preg_replace('/\{INDEX\}/', strval($id == $globalId ? count($ids) : $i), strval($id));
          self::checkId($nId);
          $data = [$nId, $location, $state];
          $ids[] = $nId;
        }

        foreach (static::$customFields as $field) {
          $data[] = $info[$field] ?? null;
        }

        $values[] = $data;
      }
    }

    $p = static::$prefix;
    $fields = static::$autoIncrement ? [$p . 'location', $p . 'state'] : [$p . 'id', $p . 'location', $p . 'state'];
    foreach (static::$customFields as $field) {
      $fields[] = $field;
    }

    // With auto increment, we compute the set of all consecutive ids
    return self::DB()
      ->multipleInsert($fields)
      ->values($values);
  }

  /*
   * Create a single token
   * @param array<string, mixed> $token Piece definition
   * @return mixed Created piece or null
   */
  public static function singleCreate(array $token): mixed
  {
    $tokens = self::create([$token]);
    return self::getSingle(is_array($tokens) ? $tokens[0] : $tokens);
  }
}
