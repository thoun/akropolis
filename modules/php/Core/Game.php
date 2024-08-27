<?php
namespace AKR\Core;
use AkropolisAthena;

/*
 * Game: a wrapper over table object to allow more generic modules
 */
class Game
{
  public static function get()
  {
    return AkropolisAthena::get();
  }
}
