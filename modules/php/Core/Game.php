<?php

namespace AKR\Core;

use Akropolis;

/*
 * Game: a wrapper over table object to allow more generic modules
 */

class Game
{
  public static function get()
  {
    return Akropolis::get();
  }
}
