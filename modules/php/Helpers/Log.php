<?php
namespace AKR\Helpers;
use AKR\Core\Game;
use AKR\Core\Globals;
use AKR\Core\Notifications;
use AKR\Managers\Players;

/**
 * Class that allows to log DB change: useful for undo feature
 *
 * Associated DB table :
 *  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
 *  `table` varchar(32) NOT NULL,
 *  `primary` varchar(32) NOT NULL,
 *  `type` varchar(32) NOT NULL,
 *  `affected` JSON,
 */

class Log extends \APP_DbObject
{
  public function enable()
  {
    Game::get()->setGameStateValue('logging', 1);
  }

  public function disable()
  {
    Game::get()->setGameStateValue('logging', 0);
  }

  // Create a new checkpoint : anything before that checkpoint cannot be undo (unless in studio)
  public function checkpoint()
  {
    $query = new QueryBuilder('log', null, 'id');
    $entry = [
      'move_id' => self::getUniqueValueFromDB('SELECT global_value FROM global WHERE global_id = 3'),
      'table' => '',
      'primary' => '',
      'type' => 'checkpoint',
    ];
    $query->insert($entry);
  }

  public function getLastCheckpoint()
  {
    $query = new QueryBuilder('log', null, 'id');
    $log = $query
      ->select(['id'])
      ->where('type', 'checkpoint')
      ->orderBy('id', 'DESC')
      ->limit(1)
      ->get()
      ->first();

    return is_null($log) ? 1 : $log['id'];
  }

  /**
   * Add an entry
   */
  public function addEntry($entry)
  {
    $entry['affected'] = \json_encode($entry['affected']);
    $entry['move_id'] = self::getUniqueValueFromDB('SELECT global_value FROM global WHERE global_id = 3');
    $query = new QueryBuilder('log', null, 'id');
    $query->insert($entry);
  }

  /**
   * Clear the log table
   */
  public function clearAll()
  {
    static::checkpoint();
    // $query = new QueryBuilder('log', null, 'id');
    // $query->delete()->run();
  }

  /**
   * Revert all the logged changes
   */
  public function revertAll()
  {
    $checkpoint = static::getLastCheckpoint();
    $query = new QueryBuilder('log', null, 'id');
    $logs = $query
      ->select(['id', 'table', 'primary', 'type', 'affected', 'move_id'])
      ->where('id', '>', $checkpoint)
      ->orderBy('id', 'DESC')
      ->get();

    $moveIds = [];
    foreach ($logs as $log) {
      $log['affected'] = json_decode($log['affected'], true);
      $moveIds[] = intval($log['move_id']);

      foreach ($log['affected'] as $row) {
        $q = new QueryBuilder($log['table'], null, $log['primary']);

        if ($log['type'] != 'create') {
          foreach ($row as $key => $val) {
            if (isset($row[$key])) {
              $row[$key] = str_replace("'", "\\'", \stripcslashes($val));
            }
          }
        }

        // UNDO UPDATE -> NEW UPDATE
        if ($log['type'] == 'update') {
          $q->update($row)->run($row[$log['primary']]);
        }
        // UNDO DELETE -> CREATE
        elseif ($log['type'] == 'delete') {
          $q->insert($row);
        }
        // UNDO CREATE -> DELETE
        elseif ($log['type'] == 'create') {
          $q->delete()->run($row);
        }
      }
    }

    // Insert a new checkpoint instead of deleting database entry
    static::checkpoint();
    // Clear logs
    // $query = new QueryBuilder('log', null, 'id');
    // $query->delete()->run();

    // Cancel the game notifications
    $query = new QueryBuilder('gamelog', null, 'gamelog_packet_id');
    if (!empty($moveIds)) {
      // Update field
      $query
        ->update(['cancel' => 1])
        ->whereIn('gamelog_move_id', $moveIds)
        ->run();

      $notifIds = self::getCanceledNotifIds();
      Notifications::clearTurn(Players::getCurrent(), $notifIds);
    }

    // Force to clear cached informations
    Globals::fetch();

    // Notify
    $datas = Game::get()->getAllDatas();
    Notifications::refreshUI($datas);
    $player = Players::getCurrent();
    Notifications::refreshHand($player, $player->getHand()->ui());

    if (!empty($moveIds)) {
      // Delete notifications
      $query
        ->delete()
        ->where('cancel', 1)
        ->run();
    }

    return $moveIds;
  }

  /**
   * getCancelMoveIds : get all cancelled notifs IDs from BGA gamelog, used for styling the notifications on page reload
   */
  protected function extractNotifIds($notifications)
  {
    $notificationUIds = [];
    foreach ($notifications as $packet) {
      $data = \json_decode($packet, true);
      foreach ($data as $notification) {
        array_push($notificationUIds, $notification['uid']);
      }
    }
    return $notificationUIds;
  }

  public function getCanceledNotifIds()
  {
    return self::extractNotifIds(
      self::getObjectListFromDb('SELECT `gamelog_notification` FROM gamelog WHERE `cancel` = 1', true)
    );
  }
}
