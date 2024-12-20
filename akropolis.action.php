<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Akropolis implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * akropolis.action.php
 *
 * Akropolis main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/akropolis/akropolis/myAction.html", ...)
 *
 */

class action_akropolis extends APP_GameAction
{
  // Constructor: please do not modify
  public function __default()
  {
    if (self::isArg('notifwindow')) {
      $this->view = 'common_notifwindow';
      $this->viewArgs['table'] = self::getArg('table', AT_posint, true);
    } else {
      $this->view = 'akropolis_akropolis';
      self::trace('Complete reinitialization of board game');
    }
  }

  public function actPlaceTile()
  {
    self::setAjaxMode();
    $tileId = (int) self::getArg('tileId', AT_int, true);
    $hex = (int) self::getArg('hex', AT_int, true);
    $x = (int) self::getArg('x', AT_int, true);
    $y = (int) self::getArg('y', AT_int, true);
    $z = (int) self::getArg('z', AT_int, true);
    $r = (int) self::getArg('r', AT_int, true);
    $this->game->actPlaceTile($tileId, $hex, ['x' => $x, 'y' => $y, 'z' => $z], $r);
    self::ajaxResponse();
  }

  public function actCompleteCard()
  {
    self::setAjaxMode();
    $cardId = self::getArg('cardId', AT_alphanum, true);
    $tileId = (int) self::getArg('tileId', AT_int, true);
    $x = (int) self::getArg('x', AT_int, true);
    $y = (int) self::getArg('y', AT_int, true);
    $z = (int) self::getArg('z', AT_int, true);
    $r = (int) self::getArg('r', AT_int, true);
    $automaTileId = self::getArg('tileIdForAutomata', AT_int, false);
    $this->game->actCompleteCard($cardId, $tileId, ['x' => $x, 'y' => $y, 'z' => $z], $r, $automaTileId);
    self::ajaxResponse();
  }

  public function actSkipCompleteCard()
  {
    self::setAjaxMode();
    $this->game->actSkipCompleteCard();
    self::ajaxResponse();
  }
}
