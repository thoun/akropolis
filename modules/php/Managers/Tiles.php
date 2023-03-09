<?php
namespace AKR\Managers;
use AKR\Core\Globals;

/* Class to manage all the tiles for Akropolis */

class Tiles extends \AKR\Helpers\Pieces
{
  protected static $table = 'tiles';
  protected static $prefix = 'card_';
  protected static $customFields = ['level', 'player_id', 'extra_datas', 'type'];
  protected static $autoIncrement = true;
  protected static $autoremovePrefix = false;

  // protected static function cast($card)
  // {
  //   return self::getInstance($card['type'], $card);
  // }

  // protected static function getInstance($type, $row = null)
  // {
  //   $className = '' . $type;
  //   return new $className($row);
  // }
}
